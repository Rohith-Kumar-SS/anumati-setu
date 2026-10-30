// Page chrome: top bar (accessibility + language), brand bar, role navigation, prototype ribbon, page head, footer.
// Every page calls initPage() first:
//   const { user, meta } = await initPage({ roles: ['ro','rd'], active: 'applications',
//       title: 'nav.applications', subtitle: {en:'...', hi:'...'}, breadcrumbs: [{label:'nav.dashboard', href:'staff/dashboard.html'}, {label:'nav.applications'}],
//       actions: someNode });
// roles: null = public page. Labels accept an i18n key, an {en, hi} object or plain text. hrefs are site-relative.
import { api, getToken, getStoredUser, updateStoredUser, site, homeFor, logout, currentRelativePath } from './api.js';
import { t, tl, apply as applyI18n, setLang, getLang, onLang } from './i18n.js';
import { el, esc, mount, fmtDate, initials, $ } from './ui.js';
import { icon, logoSvg } from './icons.js';

const NAVS = {
  public: [
    ['home', 'index.html', 'nav.home'],
    ['how', 'index.html#how', 'nav.how'],
    ['verify', 'verify.html', 'nav.verify'],
    ['demo', 'demo.html', 'nav.demo'],
  ],
  ro: [
    ['dashboard', 'staff/dashboard.html', 'nav.dashboard'],
    ['applications', 'staff/applications.html', 'nav.applications'],
    ['pendency', 'staff/pendency.html', 'nav.pendency'],
    ['evc', 'staff/evc.html', 'nav.evc'],
    ['undertakings', 'staff/undertakings.html', 'nav.undertakings'],
    ['documents', 'staff/documents.html', 'nav.documents'],
    ['escalations', 'staff/escalations.html', 'nav.escalations'],
    ['institutions', 'staff/institutions.html', 'nav.institutions'],
    ['reports', 'staff/reports.html', 'nav.reports'],
  ],
  rd: [
    ['dashboard', 'staff/dashboard.html', 'nav.dashboard'],
    ['applications', 'staff/applications.html', 'nav.applications'],
    ['pendency', 'staff/pendency.html', 'nav.pendency'],
    ['evc', 'staff/evc.html', 'nav.evc'],
    ['undertakings', 'staff/undertakings.html', 'nav.undertakings'],
    ['documents', 'staff/documents.html', 'nav.documents'],
    ['escalations', 'staff/escalations.html', 'nav.escalations'],
    ['workload', 'staff/workload.html', 'nav.workload'],
    ['institutions', 'staff/institutions.html', 'nav.institutions'],
    ['reports', 'staff/reports.html', 'nav.reports'],
  ],
  bureau: [
    ['dashboard', 'staff/dashboard.html', 'nav.dashboard'],
    ['applications', 'staff/applications.html', 'nav.applications'],
    ['pendency', 'staff/pendency.html', 'nav.pendency'],
    ['evc', 'staff/evc.html', 'nav.evc'],
    ['undertakings', 'staff/undertakings.html', 'nav.undertakings'],
    ['documents', 'staff/documents.html', 'nav.documents'],
    ['escalations', 'staff/escalations.html', 'nav.escalations'],
    ['workload', 'staff/workload.html', 'nav.workload'],
    ['outcomes', 'staff/outcomes.html', 'nav.outcomes'],
    ['institutions', 'staff/institutions.html', 'nav.institutions'],
    ['reports', 'staff/reports.html', 'nav.reports'],
    ['rules', 'admin/rules.html', 'nav.rules'],
  ],
  evc: [
    ['dashboard', 'staff/dashboard.html', 'nav.dashboard'],
    ['evc', 'staff/evc.html', 'nav.my_visits'],
    ['applications', 'staff/applications.html', 'nav.applications'],
    ['notifications', 'notifications.html', 'nav.notifications'],
  ],
  committee: [
    ['dashboard', 'staff/dashboard.html', 'nav.dashboard'],
    ['applications', 'staff/applications.html?stage=COMMITTEE', 'nav.agenda'],
    ['pendency', 'staff/pendency.html', 'nav.pendency'],
    ['escalations', 'staff/escalations.html', 'nav.escalations'],
    ['reports', 'staff/reports.html', 'nav.reports'],
  ],
  authority: [
    ['dashboard', 'staff/dashboard.html', 'nav.dashboard'],
    ['applications', 'staff/applications.html?stage=DECISION', 'nav.decisions'],
    ['pendency', 'staff/pendency.html', 'nav.pendency'],
    ['undertakings', 'staff/undertakings.html', 'nav.undertakings'],
    ['escalations', 'staff/escalations.html', 'nav.escalations'],
    ['outcomes', 'staff/outcomes.html', 'nav.outcomes'],
    ['institutions', 'staff/institutions.html', 'nav.institutions'],
    ['reports', 'staff/reports.html', 'nav.reports'],
  ],
  admin: [
    ['dashboard', 'staff/dashboard.html', 'nav.dashboard'],
    ['applications', 'staff/applications.html', 'nav.applications'],
    ['pendency', 'staff/pendency.html', 'nav.pendency'],
    ['escalations', 'staff/escalations.html', 'nav.escalations'],
    ['audit', 'staff/audit.html', 'nav.audit'],
    ['rules', 'admin/rules.html', 'nav.rules'],
    ['users', 'admin/users.html', 'nav.users'],
    ['system', 'admin/system.html', 'nav.system'],
    ['demo', 'demo.html', 'nav.demo'],
  ],
  institution: [
    ['dashboard', 'institution/dashboard.html', 'nav.dashboard'],
    ['apply', 'institution/apply.html', 'nav.apply'],
    ['compliance', 'institution/compliance.html', 'nav.compliance'],
    ['calendar', 'institution/calendar.html', 'nav.calendar'],
    ['notifications', 'notifications.html', 'nav.notifications'],
  ],
};

export const STAFF_ROLES = ['ro', 'rd', 'bureau', 'evc', 'committee', 'authority', 'admin'];

export function navFor(role) {
  return NAVS[role] ? role : 'public';
}

const FONT_STEPS = ['13.5px', '15px', '16.5px', '18px'];
let state = {};
let unreadTimer = null;

function halt() { return new Promise(() => {}); }

function ensureSlot(id, tag, where) {
  let node = document.getElementById(id);
  if (!node) {
    node = el(tag, { id });
    if (where === 'start') document.body.prepend(node);
    else if (where === 'end') document.body.append(node);
    else where.before(node);
  }
  return node;
}

/* ---------------------------------------------------------------- header */
function topbar() {
  const fs = (() => { try { return localStorage.getItem('as_font_scale') || '15px'; } catch (e) { return '15px'; } })();
  const setFont = (v) => {
    document.documentElement.style.fontSize = v;
    try { localStorage.setItem('as_font_scale', v); } catch (e) { /* ignore */ }
  };
  const step = (d) => {
    const cur = FONT_STEPS.indexOf(document.documentElement.style.fontSize || fs);
    const i = Math.min(FONT_STEPS.length - 1, Math.max(0, (cur < 0 ? 1 : cur) + d));
    setFont(FONT_STEPS[i]);
  };
  const lang = getLang();
  return el('div', { class: 'as-topbar' }, el('div', { class: 'as-container' },
    el('div', { class: 'tb-left' },
      el('span', { class: 'pill' }, t('top.sih')),
      el('span', { class: 'tb-text' }, t('top.text'))),
    el('div', { class: 'tb-right' },
      el('a', { class: 'tb-btn', href: '#main' }, t('top.skip')),
      el('span', { class: 'tb-sep' }),
      el('button', { class: 'tb-btn', type: 'button', title: t('top.font_dec'), 'aria-label': t('top.font_dec'), onclick: () => step(-1) }, 'A-'),
      el('button', { class: 'tb-btn', type: 'button', title: t('top.font_reset'), 'aria-label': t('top.font_reset'), onclick: () => setFont('15px') }, 'A'),
      el('button', { class: 'tb-btn', type: 'button', title: t('top.font_inc'), 'aria-label': t('top.font_inc'), onclick: () => step(1) }, 'A+'),
      el('span', { class: 'tb-sep' }),
      el('button', {
        class: 'tb-btn', type: 'button', title: t('top.contrast'), 'aria-label': t('top.contrast'), html: icon('contrast', 15),
        onclick: () => {
          const on = document.documentElement.classList.toggle('as-contrast');
          try { localStorage.setItem('as_contrast', on ? '1' : '0'); } catch (e) { /* ignore */ }
        },
      }),
      el('span', { class: 'tb-sep' }),
      el('button', { class: `tb-btn ${lang === 'en' ? 'active' : ''}`, type: 'button', lang: 'en', onclick: () => setLang('en') }, 'English'),
      el('button', { class: `tb-btn ${lang === 'hi' ? 'active' : ''}`, type: 'button', lang: 'hi', onclick: () => setLang('hi') }, 'हिंदी'))));
}

function simClock(meta, user) {
  if (!meta || !meta.today) return null;
  const staff = user && ['ro', 'rd', 'bureau', 'authority', 'admin'].includes(user.role);
  const chip = el(staff ? 'a' : 'span', {
    class: `as-simclock ${meta.simulated ? '' : 'real'}`,
    href: staff ? site('demo.html#clock') : null,
    title: meta.simulated ? `${t('clock.simulated')} (real: ${fmtDate(meta.real_today)})` : t('clock.demo_date'),
    html: `${icon('calendar', 14)}<span class="lbl">${esc(meta.simulated ? t('clock.simulated') : t('clock.real'))}:</span> ${esc(fmtDate(meta.today))}`,
  });
  return chip;
}

function userMenu(user) {
  const btn = el('button', { type: 'button', 'aria-haspopup': 'true', 'aria-expanded': 'false' },
    el('span', { class: 'avatar' }, initials(user.name)),
    el('span', { class: 'who' },
      el('div', { class: 'n' }, user.name),
      el('div', { class: 'r' }, (user.institution && user.institution.name) || t(`role.${user.role}`))),
    el('span', { html: icon('chevron-down', 16) }));
  const staff = STAFF_ROLES.includes(user.role) && user.role !== 'evc';
  const menu = el('div', { class: 'menu', hidden: true, role: 'menu' },
    el('div', { class: 'menu-head' }, el('div', {}, t('user.signed_in_as')), el('strong', { style: { color: 'var(--as-text)' } }, user.email), el('div', {}, t(`role.${user.role}`))),
    el('div', { class: 'menu-sep' }),
    el('a', { href: site(homeFor(user.role)), role: 'menuitem', html: `${icon('dashboard', 16)}<span>${esc(t('nav.dashboard'))}</span>` }),
    el('a', { href: site('notifications.html'), role: 'menuitem', html: `${icon('bell', 16)}<span>${esc(t('user.notifications'))}</span>` }),
    staff ? el('a', { href: site('demo.html'), role: 'menuitem', html: `${icon('play', 16)}<span>${esc(t('user.demo'))}</span>` }) : null,
    STAFF_ROLES.includes(user.role) ? el('a', { href: site('staff/audit.html'), role: 'menuitem', html: `${icon('history', 16)}<span>${esc(t('nav.audit'))}</span>` }) : null,
    el('a', { href: site('verify.html'), role: 'menuitem', html: `${icon('qr', 16)}<span>${esc(t('nav.verify'))}</span>` }),
    el('div', { class: 'menu-sep' }),
    el('button', { type: 'button', role: 'menuitem', onclick: () => logout(), html: `${icon('logout', 16)}<span>${esc(t('user.signout'))}</span>` }));
  const wrap = el('div', { class: 'as-usermenu' }, btn, menu);
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
  return wrap;
}

function bell() {
  const a = el('a', { class: 'as-bell', href: site('notifications.html'), 'aria-label': t('user.notifications'), title: t('user.notifications'), html: icon('bell', 19) });
  const count = el('span', { class: 'count', hidden: true });
  a.appendChild(count);
  const refresh = async () => {
    try {
      const r = await api.get('/notifications/unread-count', null, { noRedirect: true });
      const n = r.unread ?? r.count ?? 0;
      count.textContent = n > 99 ? '99+' : String(n);
      count.hidden = !n;
    } catch (e) { /* ignore */ }
  };
  refresh();
  clearInterval(unreadTimer);
  unreadTimer = setInterval(refresh, 60000);
  window.addEventListener('as:notifications-changed', refresh);
  return a;
}

function brandbar(user, meta) {
  const right = el('div', { class: 'bb-right' });
  if (user) {
    const clock = simClock(meta, user);
    if (clock) right.appendChild(clock);
    right.appendChild(bell());
    right.appendChild(userMenu(user));
  } else {
    if (meta && meta.today) right.appendChild(simClock(meta, null));
    right.appendChild(el('a', { class: 'btn', href: site('login.html'), html: `${icon('login', 16)}<span>${esc(t('nav.login'))}</span>` }));
  }
  return el('div', { class: 'as-brandbar' }, el('div', { class: 'as-container' },
    el('a', { class: 'as-brand', href: site(user ? homeFor(user.role) : 'index.html'), 'aria-label': 'Anumati Setu home' },
      el('span', { html: logoSvg(56) }),
      el('span', { class: 'name' },
        el('span', { class: 'en' }, 'Anumati Setu'),
        el('span', { class: 'hi', lang: 'hi' }, 'अनुमति सेतु'),
        el('span', { class: 'tag' }, t('app.tagline')))),
    el('span', { class: 'bb-divider' }),
    el('div', { class: 'bb-org' },
      el('div', { class: 'l1' }, t('org.l1')),
      el('div', { class: 'l2' }, t('org.l2')),
      el('div', { class: 'l3' }, t('org.l3'))),
    right));
}

function navbar(navKey, active, user) {
  const items = (NAVS[navKey] || NAVS.public).map(([key, href, label]) => el('a', {
    class: `nav-item ${key === active ? 'active' : ''}`, href: site(href), 'aria-current': key === active ? 'page' : null,
  }, t(label)));
  if (navKey === 'public' && user) {
    items.push(el('a', { class: 'nav-item', href: site(homeFor(user.role)), html: `${icon('dashboard', 16)}<span>${esc(t('nav.dashboard'))}</span>` }));
  }
  const nav = el('nav', { class: 'as-nav', 'aria-label': 'Main' });
  const toggle = el('button', { class: 'nav-toggle', type: 'button', 'aria-expanded': 'false', html: `${icon('menu', 20)}<span>${esc(t('nav.menu'))}</span>` });
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.appendChild(el('div', { class: 'as-container' }, toggle, el('div', { class: 'nav-items' }, items)));
  return nav;
}

function ribbon() {
  return el('div', { class: 'as-prototype-ribbon', role: 'note' }, el('div', { class: 'as-container' },
    el('span', { html: icon('info', 15) }), el('span', {}, t('ribbon.text'))));
}

function wakeBanner() {
  const b = el('div', { class: 'as-wake', hidden: true, role: 'status' }, el('div', { class: 'as-container' },
    el('span', { class: 'spinner', style: { width: '16px', height: '16px', borderWidth: '2px' } }), el('span', {}, t('wake.text'))));
  window.addEventListener('as:slow', () => { b.hidden = false; });
  window.addEventListener('as:fast', () => { b.hidden = true; });
  return b;
}

/* ---------------------------------------------------------------- page head */
function labelOf(v) { return tl(v); }

export function setPageHead({ title, subtitle, breadcrumbs, actions } = {}) {
  if (title !== undefined) state.title = title;
  if (subtitle !== undefined) state.subtitle = subtitle;
  if (breadcrumbs !== undefined) state.breadcrumbs = breadcrumbs;
  if (actions !== undefined) state.actions = actions;
  renderPageHead();
}

function renderPageHead() {
  const slot = document.getElementById('as-pagehead');
  if (!slot) return;
  if (!state.title) { slot.hidden = true; return; }
  slot.hidden = false;
  const titleText = labelOf(state.title);
  document.title = `${titleText} · Anumati Setu`;
  const crumbs = state.breadcrumbs && state.breadcrumbs.length
    ? el('ol', { class: 'breadcrumb' }, state.breadcrumbs.map((b) => el('li', {}, b.href ? el('a', { href: site(b.href) }, labelOf(b.label)) : el('span', {}, labelOf(b.label)))))
    : null;
  let actionsNode = state.actions;
  if (typeof actionsNode === 'function') actionsNode = actionsNode();
  mount(slot, el('div', { class: 'as-pagehead' }, el('div', { class: 'as-container' },
    el('div', {}, crumbs, el('h1', {}, titleText), state.subtitle ? el('div', { class: 'subtitle' }, labelOf(state.subtitle)) : null),
    actionsNode ? el('div', { class: 'ph-actions' }, actionsNode) : null)));
}

/* ---------------------------------------------------------------- footer */
function footer(user, meta) {
  const year = (meta && meta.today ? meta.today.slice(0, 4) : '2026');
  const apiDocs = `${(window.AS_CONFIG && window.AS_CONFIG.apiBase) || ''}/api/docs`;
  return el('footer', { class: 'as-footer' }, el('div', { class: 'as-container' },
    el('div', { class: 'f-grid' },
      el('div', {},
        el('div', { class: 'row', style: { marginBottom: '10px' } }, el('span', { html: logoSvg(40) }),
          el('div', {}, el('div', { style: { color: '#fff', fontWeight: 800, fontSize: '1.1rem' } }, 'Anumati Setu'), el('div', { lang: 'hi', style: { color: '#ffd3a6' } }, 'अनुमति सेतु'))),
        el('p', { class: 'mb-0' }, t('footer.about_text'))),
      el('div', {}, el('h4', {}, t('footer.links')), el('ul', {},
        el('li', {}, el('a', { href: site('index.html') }, t('nav.home'))),
        el('li', {}, el('a', { href: site('verify.html') }, t('nav.verify'))),
        el('li', {}, el('a', { href: site('demo.html') }, t('nav.demo'))),
        el('li', {}, user ? el('a', { href: site(homeFor(user.role)) }, t('nav.dashboard')) : el('a', { href: site('login.html') }, t('nav.login'))))),
      el('div', {}, el('h4', {}, t('footer.innovations')), el('ul', {},
        el('li', {}, t('footer.i1')),
        el('li', {}, t('footer.i2')),
        el('li', {}, t('footer.i3')),
        el('li', {}, t('footer.i4')),
        el('li', {}, t('footer.i5')))),
      el('div', {}, el('h4', {}, t('footer.help')), el('ul', {},
        el('li', {}, `${t('footer.helpdesk')}: helpdesk@anumatisetu.example`),
        el('li', {}, el('a', { href: apiDocs, target: '_blank', rel: 'noopener' }, 'API documentation (OpenAPI)')),
        el('li', {}, t('footer.accessibility'))))),
    el('div', { class: 'disclaimer' }, t('footer.disclaimer')),
    el('div', { class: 'f-bottom' },
      el('span', {}, `© ${year} Anumati Setu · Team Kernels · SIH26262 prototype · v${(window.AS_CONFIG && window.AS_CONFIG.version) || '1.0.0'}`),
      el('span', {}, `${t('footer.updated')}: ${fmtDate(meta && meta.today)}`))));
}

/* ---------------------------------------------------------------- main entry */
function renderChrome() {
  const { user, meta, navKey, active } = state;
  const header = ensureSlot('as-header', 'header', 'start');
  mount(header, el('a', { class: 'skip-link', href: '#main' }, t('top.skip')), topbar(), el('div', { class: 'as-tricolor' }),
    brandbar(user, meta), navbar(navKey, active, user), ribbon(), wakeBanner());
  const main = document.getElementById('main') || document.querySelector('main');
  if (main && !main.id) main.id = 'main';
  if (main) main.setAttribute('tabindex', '-1');
  if (main && !document.getElementById('as-pagehead')) main.before(el('div', { id: 'as-pagehead' }));
  renderPageHead();
  const foot = ensureSlot('as-footer', 'div', 'end');
  mount(foot, footer(user, meta));
  applyI18n(document);
}

function setFavicon() {
  if (document.querySelector('link[rel="icon"]')) return;
  const svg = logoSvg(64).replace('class="logo" ', 'xmlns="http://www.w3.org/2000/svg" ');
  document.head.appendChild(el('link', { rel: 'icon', href: `data:image/svg+xml,${encodeURIComponent(svg)}` }));
}

export async function initPage(opts = {}) {
  const { roles = null, active = '', nav, title, subtitle, breadcrumbs, actions } = opts;
  document.documentElement.lang = getLang();
  setFavicon();
  let user = null;
  let meta = null;
  const token = getToken();

  if (roles) {
    if (!token) {
      location.href = site(`login.html?next=${encodeURIComponent(currentRelativePath())}`);
      return halt();
    }
    const [me, m] = await Promise.all([
      api.get('/auth/me'),
      api.get('/meta', null, { noRedirect: true }).catch(() => null),
    ]);
    user = me;
    meta = m;
    if (user.role !== 'admin' && !roles.includes(user.role)) {
      location.href = site(homeFor(user.role));
      return halt();
    }
    updateStoredUser(user);
  } else {
    user = token ? getStoredUser() : null;
  }

  state = { user, meta, active, navKey: nav || navFor(user && user.role), title, subtitle, breadcrumbs, actions };
  renderChrome();
  onLang(() => renderChrome());
  // Public pages render at once (the hosted API may still be waking up) and fill the date chip later.
  const metaPromise = meta ? Promise.resolve(meta) : api.get('/meta', null, { noRedirect: true })
    .then((m) => { state.meta = m; renderChrome(); return m; })
    .catch(() => null);
  return { user, meta, metaPromise };
}

export { NAVS };
