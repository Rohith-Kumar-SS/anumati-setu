// API client. All calls go to `${apiBase}/api${path}`. Token = JWT in localStorage (Bearer header).
const C = window.AS_CONFIG || { siteBase: location.origin + '/', apiBase: '' };
const TOKEN_KEY = 'as_token';
const USER_KEY = 'as_user';

export const siteBase = C.siteBase;

/** Absolute URL of a page/asset relative to the site root: site('staff/application.html?id=3'). */
export function site(path = '') {
  return C.siteBase + String(path).replace(/^\//, '');
}

function qs(params) {
  if (!params) return '';
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) v.forEach((x) => u.append(k, x));
    else u.append(k, v);
  }
  const s = u.toString();
  return s ? `?${s}` : '';
}

export function apiUrl(path, params) {
  return `${C.apiBase}/api${path}${qs(params)}`;
}

function store() {
  try { return window.localStorage; } catch (e) { return null; }
}

export function getToken() { return store()?.getItem(TOKEN_KEY) || null; }

export function getStoredUser() {
  try { return JSON.parse(store()?.getItem(USER_KEY) || 'null'); } catch (e) { return null; }
}

export function setSession(token, user) {
  store()?.setItem(TOKEN_KEY, token);
  store()?.setItem(USER_KEY, JSON.stringify(user));
}

export function updateStoredUser(user) { store()?.setItem(USER_KEY, JSON.stringify(user)); }

export function clearSession() {
  store()?.removeItem(TOKEN_KEY);
  store()?.removeItem(USER_KEY);
}

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function detailMessage(data, status) {
  const d = data && data.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d) && d.length) {
    return d.map((e) => {
      const field = Array.isArray(e.loc) ? e.loc.filter((x) => x !== 'body' && x !== 'query').join('.') : '';
      return field ? `${field}: ${e.msg}` : e.msg;
    }).join('; ');
  }
  if (status === 0) return 'Cannot reach the server. Check your connection and try again.';
  return `Request failed (${status})`;
}

/** Path of the current page relative to the site root, for ?next= redirects. */
export function currentRelativePath() {
  const here = location.href;
  return here.startsWith(C.siteBase) ? here.slice(C.siteBase.length) : location.pathname.replace(/^\//, '');
}

let slowCount = 0;
function markSlow(on) {
  slowCount += on ? 1 : -1;
  window.dispatchEvent(new CustomEvent(slowCount > 0 ? 'as:slow' : 'as:fast'));
}

/**
 * request(method, path, {params, body, form, responseType:'json'|'blob'|'text', noRedirect})
 * - body  -> JSON;  form -> FormData (multipart)
 * - 401   -> clears the session and redirects to login (unless noRedirect)
 * - errors throw ApiError(status, message, data)
 */
export async function request(method, path, opts = {}) {
  const { params, body, form, responseType, noRedirect } = opts;
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

  let slowTimer = setTimeout(() => { slowTimer = null; markSlow(true); }, 3500);
  let res;
  try {
    res = await fetch(apiUrl(path, params), { method, headers, body: payload });
  } catch (e) {
    throw new ApiError(0, detailMessage(null, 0), null);
  } finally {
    if (slowTimer) clearTimeout(slowTimer); else markSlow(false);
  }

  if (res.status === 401 && !noRedirect) {
    clearSession();
    if (!/login\.html/.test(location.pathname)) {
      location.href = site(`login.html?next=${encodeURIComponent(currentRelativePath())}`);
    }
    throw new ApiError(401, 'Please sign in again.', null);
  }
  if (!res.ok) {
    let data = null;
    try { data = await res.json(); } catch (e) { /* not json */ }
    throw new ApiError(res.status, detailMessage(data, res.status), data);
  }
  if (responseType === 'blob') return res.blob();
  if (responseType === 'text') return res.text();
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export const api = {
  get: (path, params, opts = {}) => request('GET', path, { ...opts, params }),
  post: (path, body, opts = {}) => request('POST', path, { ...opts, body: body === undefined ? {} : body }),
  put: (path, body, opts = {}) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts = {}) => request('PATCH', path, { ...opts, body }),
  del: (path, opts = {}) => request('DELETE', path, opts),
  upload: (path, formData, opts = {}) => request('POST', path, { ...opts, form: formData }),
  blob: (path, params, opts = {}) => request('GET', path, { ...opts, params, responseType: 'blob' }),
  /** URL usable in <iframe>/<a href> for auth-protected files (token in query string). */
  fileUrl: (path, params = {}) => apiUrl(path, { ...params, token: getToken() }),
};

export async function login(email, password) {
  const data = await request('POST', '/auth/login', { body: { email, password }, noRedirect: true });
  setSession(data.token, data.user);
  return data.user;
}

export async function logout() {
  try { await request('POST', '/auth/logout', { body: {}, noRedirect: true }); } catch (e) { /* ignore */ }
  clearSession();
  location.href = site('login.html');
}

/** Landing page for a role, relative to the site root. */
export function homeFor(role) {
  if (role === 'institution') return 'institution/dashboard.html';
  if (['ro', 'rd', 'bureau', 'evc', 'committee', 'authority', 'admin'].includes(role)) return 'staff/dashboard.html';
  return 'index.html';
}
