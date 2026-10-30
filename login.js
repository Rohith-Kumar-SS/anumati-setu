// Sign-in page: email + password, demo accounts grouped by role, ?as=<email>&next=<path> one-click sign-in.
import { initPage } from './assets/js/layout.js';
import { api, login, logout, homeFor, site, getToken } from './assets/js/api.js';
import { t, extend, onLang, getLang } from './assets/js/i18n.js';
import { $, el, esc, icon, mount, getParam, loading, withBusy, toast } from './assets/js/ui.js';
import { logoSvg } from './assets/js/icons.js';

extend({
  en: {
    'login.title': 'Sign in',
    'login.subtitle': 'Use your portal account, or pick a demo account below',
    'login.heading': 'Sign in to the portal',
    'login.heading_sub': 'Institutions, regional offices, the Bureau, expert visit members, committees and the Competent Authority',
    'login.email': 'Email address',
    'login.password': 'Password',
    'login.show': 'Show',
    'login.hide': 'Hide',
    'login.show_aria': 'Show password',
    'login.hide_aria': 'Hide password',
    'login.submit': 'Sign in',
    'login.signing': 'Signing in…',
    'login.need_both': 'Please enter your email address and password.',
    'login.bad': 'Incorrect email or password.',
    'login.pw_hint': 'Every demo account uses the password {pw}.',
    'login.signed_in_as': 'You are already signed in as {name} ({role}).',
    'login.continue': 'Continue',
    'login.switch': 'Sign in as someone else below, or',
    'login.signout': 'sign out',
    'login.auto': 'Signing you in as {email}…',
    'login.auto_fail': 'Automatic sign-in failed: {msg}',
    'login.auto_not_demo': 'This address is not one of the demo accounts.',
    'login.demo_title': 'Demo accounts',
    'login.demo_lead': 'This is a prototype with fictitious people. Pick a seat and sign in with one click.',
    'login.demo_off': 'Demo accounts are not enabled on this server. Use the credentials given to you.',
    'login.demo_load_error': 'The demo accounts could not be loaded.',
    'login.signin_as': 'Sign in as {name}',
    'login.region': 'Region {r}',
    'login.grp.institution': 'Institutions (applicants)',
    'login.grp.ro': 'Regional Officers',
    'login.grp.rd': 'Regional Directors',
    'login.grp.bureau': 'Approval Bureau (HQ)',
    'login.grp.evc': 'Expert Visit Committee',
    'login.grp.committee': 'SAC/SHC members',
    'login.grp.authority': 'Competent Authority',
    'login.grp.admin': 'Administrator',
  },
  hi: {
    'login.title': 'साइन इन',
    'login.subtitle': 'अपने पोर्टल खाते से, या नीचे से कोई डेमो खाता चुनकर साइन इन करें',
    'login.heading': 'पोर्टल में साइन इन करें',
    'login.heading_sub': 'संस्थान, क्षेत्रीय कार्यालय, ब्यूरो, विशेषज्ञ दौरा सदस्य, समितियाँ और सक्षम प्राधिकारी',
    'login.email': 'ईमेल पता',
    'login.password': 'पासवर्ड',
    'login.show': 'दिखाएँ',
    'login.hide': 'छिपाएँ',
    'login.show_aria': 'पासवर्ड दिखाएँ',
    'login.hide_aria': 'पासवर्ड छिपाएँ',
    'login.submit': 'साइन इन',
    'login.signing': 'साइन इन हो रहा है…',
    'login.need_both': 'कृपया अपना ईमेल पता और पासवर्ड दर्ज करें।',
    'login.bad': 'ईमेल या पासवर्ड सही नहीं है।',
    'login.pw_hint': 'हर डेमो खाते का पासवर्ड {pw} है।',
    'login.signed_in_as': 'आप पहले से {name} ({role}) के रूप में साइन इन हैं।',
    'login.continue': 'आगे बढ़ें',
    'login.switch': 'किसी और के रूप में नीचे साइन इन करें, या',
    'login.signout': 'साइन आउट करें',
    'login.auto': '{email} के रूप में साइन इन किया जा रहा है…',
    'login.auto_fail': 'स्वतः साइन इन विफल रहा: {msg}',
    'login.auto_not_demo': 'यह पता डेमो खातों में से नहीं है।',
    'login.demo_title': 'डेमो खाते',
    'login.demo_lead': 'यह काल्पनिक व्यक्तियों वाला प्रोटोटाइप है। कोई भूमिका चुनें और एक क्लिक में साइन इन करें।',
    'login.demo_off': 'इस सर्वर पर डेमो खाते चालू नहीं हैं। आपको दिए गए प्रमाण-पत्र का उपयोग करें।',
    'login.demo_load_error': 'डेमो खाते लोड नहीं हो सके।',
    'login.signin_as': '{name} के रूप में साइन इन करें',
    'login.region': 'क्षेत्र {r}',
    'login.grp.institution': 'संस्थान (आवेदक)',
    'login.grp.ro': 'क्षेत्रीय अधिकारी',
    'login.grp.rd': 'क्षेत्रीय निदेशक',
    'login.grp.bureau': 'अनुमोदन ब्यूरो (मुख्यालय)',
    'login.grp.evc': 'विशेषज्ञ दौरा समिति',
    'login.grp.committee': 'एसएसी/एसएचसी सदस्य',
    'login.grp.authority': 'सक्षम प्राधिकारी',
    'login.grp.admin': 'प्रशासक',
  },
});

const { user } = await initPage({ roles: null, active: '', title: 'login.title', subtitle: 'login.subtitle',
  breadcrumbs: [{ label: 'nav.home', href: 'index.html' }, { label: 'login.title' }] });

const ORDER = ['institution', 'ro', 'rd', 'bureau', 'evc', 'committee', 'authority', 'admin'];
const asParam = getParam('as');
let demo = null; // {enabled, password, accounts}
let demoError = null;
let autoBusy = !!asParam;
let showPw = false;
let formError = null; // function returning the current text (so a language switch re-translates it)

/** Only site-relative paths are accepted as a redirect target. */
function safeNext(next) {
  if (!next || /^[\\/]/.test(next) || !/^[A-Za-z0-9_\-./?=&%#+,~]+$/.test(next)) return null;
  return next;
}
const nextPath = safeNext(getParam('next'));
const signedIn = !!(user && getToken());

function go(u) {
  location.href = site(nextPath || homeFor(u.role));
}

function errText(e) {
  if (e && (e.status === 401 || e.status === 400) && getLang() === 'hi') return t('login.bad');
  return (e && e.message) || t('login.bad');
}

async function signIn(email, password, btn) {
  const run = async () => {
    const u = await login(email, password);
    go(u);
    return new Promise(() => {}); // keep the busy state while the browser navigates
  };
  if (btn) return withBusy(btn, run);
  return run();
}

function renderStatic() {
  $('#login-logo').innerHTML = logoSvg(52);
  $('#login-h').textContent = t('login.heading');
  $('#login-sub').textContent = t('login.heading_sub');
  $('#lbl-email').textContent = t('login.email');
  $('#lbl-password').textContent = t('login.password');
  const tg = $('#pw-toggle');
  tg.textContent = showPw ? t('login.hide') : t('login.show');
  tg.setAttribute('aria-label', showPw ? t('login.hide_aria') : t('login.show_aria'));
  tg.setAttribute('aria-pressed', String(showPw));
  $('#password').type = showPw ? 'text' : 'password';
  $('#login-submit').innerHTML = `${icon('login', 18)}<span>${esc(t('login.submit'))}</span>`;
  $('#demo-h').textContent = t('login.demo_title');
  $('#pw-hint').textContent = demo && demo.enabled ? t('login.pw_hint', { pw: demo.password }) : '';

  mount($('#login-error'), formError ? el('div', { class: 'alert danger', style: { marginBottom: '12px' } }, el('span', { class: 'icon', html: icon('alert-circle', 18) }), el('div', {}, formError())) : null);
  mount($('#auto-note'), autoBusy ? el('div', { class: 'alert info', style: { marginBottom: '12px' } }, el('span', { class: 'spinner', style: { width: '16px', height: '16px', borderWidth: '2px' } }), el('div', {}, t('login.auto', { email: asParam }))) : null);
  mount($('#signed-note'), signedIn && !autoBusy ? el('div', { class: 'alert success', style: { marginBottom: '12px' } }, el('span', { class: 'icon', html: icon('check-circle', 18) }),
    el('div', {}, t('login.signed_in_as', { name: user.name, role: t(`role.${user.role}`, { _default: user.role }) }), ' ',
      el('a', { href: site(nextPath || homeFor(user.role)) }, t('login.continue')), ' · ', t('login.switch'), ' ',
      el('button', { class: 'link-btn', type: 'button', onclick: () => logout() }, t('login.signout')))) : null);
}

function acctRow(a) {
  const place = a.region ? ` · ${t('login.region', { r: a.region })}` : '';
  const btn = el('button', { class: 'btn sm', type: 'button', 'aria-label': t('login.signin_as', { name: a.name }), html: `${icon('login', 15)}<span>${esc(t('login.submit'))}</span>` });
  btn.addEventListener('click', async () => {
    try { await signIn(a.email, demo.password, btn); } catch (e) { toast(errText(e), 'error'); }
  });
  return el('div', { class: 'acct' },
    el('div', { class: 'who' }, el('div', { class: 'n' }, a.name), el('div', { class: 'd' }, `${a.designation}${place}`), el('div', { class: 'e' }, a.email)),
    btn);
}

function renderDemo() {
  const body = $('#demo-body');
  if (demoError) { mount(body, el('div', { class: 'alert warning' }, el('span', { class: 'icon', html: icon('alert', 18) }), el('div', {}, t('login.demo_load_error')))); return; }
  if (!demo) { loading(body); return; }
  if (!demo.enabled) { mount(body, el('div', { class: 'alert info' }, el('span', { class: 'icon', html: icon('info', 18) }), el('div', {}, t('login.demo_off')))); return; }
  const groups = ORDER.map((role) => [role, demo.accounts.filter((a) => a.role === role)]).filter(([, l]) => l.length);
  mount(body, el('p', { class: 'text-2' }, t('login.demo_lead')),
    groups.map(([role, list]) => el('section', { class: 'acct-group', 'aria-label': t(`login.grp.${role}`) },
      el('h3', {}, t(`login.grp.${role}`)), list.map(acctRow))));
}

function render() { renderStatic(); renderDemo(); }

$('#login-form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const email = $('#email').value.trim();
  const password = $('#password').value;
  if (!email || !password) { formError = () => t('login.need_both'); renderStatic(); (email ? $('#password') : $('#email')).focus(); return; }
  formError = null;
  renderStatic();
  try { await signIn(email, password, $('#login-submit')); } catch (e) { formError = () => errText(e); renderStatic(); }
});
$('#pw-toggle').addEventListener('click', () => { showPw = !showPw; renderStatic(); });

render();
onLang(render);

try {
  demo = await api.get('/auth/demo-accounts', null, { noRedirect: true });
} catch (e) {
  demoError = e;
}
render();

if (asParam) {
  (async () => {
    try {
      if (!demo || !demo.enabled) throw new Error(t('login.demo_off'));
      if (!demo.accounts.some((a) => a.email.toLowerCase() === asParam.toLowerCase())) throw new Error(t('login.auto_not_demo'));
      await signIn(asParam, demo.password);
    } catch (e) {
      autoBusy = false;
      formError = () => t('login.auto_fail', { msg: errText(e) });
      render();
    }
  })();
}
