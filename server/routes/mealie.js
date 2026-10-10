import { Router } from 'express';
import { wrap } from '../logger.js';
import { requireAuth, userMgmtActive } from '../middleware/auth.js';
import db from '../db.js';
import { fetchChecked, serviceBase, readBody } from '../lib/ssrf-guard.js';
import { apiPathFor, MEALIE_API } from '../lib/service-paths.js';

const router = Router();
router.use(requireAuth);

// Mealie usually lives on the home network, so that's allowed for every
// account, but only for the parts of its API this app reads, with GET, and
// no redirect to another server (the request carries the account's token).
const _apiPath = path => apiPathFor(MEALIE_API, path);

function _normalizeUrl(s) {
  if (!s) return '';
  // user_settings stores values as JSON-stringified — strip the quotes if present.
  let v = String(s);
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  // Origin and path only: a query or fragment in the address would turn
  // the API path appended to it into part of the query.
  return serviceBase(v) || '';
}

/** Look up the user's saved Mealie base URL. Single-user mode reads any row. */
function _getStoredMealieUrl(userId) {
  const row = userId == null
    ? db.prepare(`SELECT value FROM user_settings WHERE key = 'mealieBaseUrl' AND deleted_at IS NULL LIMIT 1`).get()
    : db.prepare(`SELECT value FROM user_settings WHERE user_id = ? AND key = 'mealieBaseUrl' AND deleted_at IS NULL`).get(userId);
  return _normalizeUrl(row?.value);
}

/**
 * POST /api/mealie/proxy
 * Body: { baseUrl, token, path }
 * Server-side proxy for Mealie API calls — avoids CORS from the browser.
 *
 * SECURITY: baseUrl must match the user's saved mealieBaseUrl setting. Without
 * this, any authed user can use the server as an open SSRF tool to probe
 * internal/cloud-metadata addresses.
 */
router.post('/proxy', wrap(async (req, res) => {
  const { baseUrl, token, path } = req.body;
  if (!baseUrl || !token || !path) {
    return res.status(400).json({ error: 'baseUrl, token and path required' });
  }

  // SSRF guard. In multi-user mode, require baseUrl to match the user's saved
  // mealieBaseUrl setting — that way each authed user's proxy can only reach
  // the Mealie they personally configured. In single-user mode, settings live
  // in client-side localStorage and aren't on the server, so we trust the
  // body — single-user installs are inherently trust-the-operator anyway.
  const requestedBase = _normalizeUrl(baseUrl);
  if (userMgmtActive()) {
    const allowedBase = _getStoredMealieUrl(req.user?.id);
    if (!allowedBase) {
      return res.status(400).json({ error: 'No Mealie URL configured. Set it in Settings → Connected Services first.' });
    }
    if (allowedBase !== requestedBase) {
      return res.status(403).json({ error: 'Mealie URL must match the one saved in Settings.' });
    }
  }

  const apiPath = _apiPath(path);
  if (!apiPath) return res.status(400).json({ error: 'Not a Mealie request this app makes' });
  const url = requestedBase + apiPath;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetchChecked(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    }, { allowPrivate: true, sameOrigin: true, maxRedirects: 3 });
    clearTimeout(timer);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Mealie returned ${response.status}` });
    }
    res.json(JSON.parse((await readBody(response, 5 * 1024 * 1024)).toString('utf8')));
  } catch(e) {
    clearTimeout(timer);
    const refused = /addresses are not allowed/.test(e?.message || '');
    res.status(503).json({ error: refused ? e.message : 'Could not reach Mealie' });
  }
}));

/** Strip the JSON quoting user_settings applies to stored string values. */
function _unquote(s) {
  if (!s) return '';
  const v = String(s);
  return (v.startsWith('"') && v.endsWith('"')) ? v.slice(1, -1) : v;
}

function _getStoredMealieToken(userId) {
  const row = userId == null
    ? db.prepare(`SELECT value FROM user_settings WHERE key = 'mealieApiToken' AND deleted_at IS NULL LIMIT 1`).get()
    : db.prepare(`SELECT value FROM user_settings WHERE user_id = ? AND key = 'mealieApiToken' AND deleted_at IS NULL`).get(userId);
  return _unquote(row?.value);
}

/**
 * GET /api/mealie/image/:recipeId
 * Streams a Mealie recipe image through this server.
 *
 * Why this exists: a self-hosted Mealie is typically reachable only over plain
 * HTTP on a LAN address (http://192.168.x.x:9925). When NutriTrace itself is
 * served over HTTPS -- behind a Tailscale/Cloudflare tunnel, say -- the browser
 * refuses those <img> requests as mixed content, and will NOT auto-upgrade them
 * because the host is a bare IP rather than a name. The result is every recipe
 * thumbnail silently blank. Fetching server-side sidesteps it: the page only
 * ever talks to its own HTTPS origin.
 *
 * SECURITY: unlike POST /proxy, this takes no URL from the caller at all. Both
 * the base URL and the token are read from the requesting user's own saved
 * settings, so the endpoint can only ever reach the Mealie that user already
 * configured -- there is no input an attacker could steer at internal or
 * cloud-metadata addresses. The recipe id is additionally constrained to a
 * UUID so it cannot be used to walk out of the media path.
 */
router.get('/image/:recipeId', wrap(async (req, res) => {
  const { recipeId } = req.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recipeId)) {
    return res.status(400).json({ error: 'Invalid recipe id' });
  }

  const uid = userMgmtActive() ? req.user?.id : null;
  const baseUrl = _getStoredMealieUrl(uid);
  const token   = _getStoredMealieToken(uid);
  if (!baseUrl) return res.status(404).json({ error: 'No Mealie URL configured' });

  const url = `${baseUrl}/api/media/recipes/${recipeId}/images/original.webp`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const upstream = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!upstream.ok || !upstream.body) {
      return res.status(upstream.status === 404 ? 404 : 502).end();
    }
    res.set('Content-Type', upstream.headers.get('content-type') || 'image/webp');
    // Private: the image is only meaningful to this authenticated user, so it
    // must not be held by any shared cache in front of the app.
    res.set('Cache-Control', 'private, max-age=3600');
    const { Readable } = await import('stream');
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (e) {
    clearTimeout(timer);
    if (!res.headersSent) res.status(504).end();
  }
}));

export default router;
