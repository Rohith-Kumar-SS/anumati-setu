// System (administrator): demo clock, daily job, demo data reset, mock AICTE feed import, API docs.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, mount, loading, renderTable, dl, toast, withBusy, confirmDialog, fmtDate, stateBadge, icon,
} from '../assets/js/ui.js';
import { field } from '../staff/c-common.js';

extend({
  en: {
    'sys.title': 'System',
    'sys.subtitle': 'Demo controls: the simulated date, the daily job, a clean reset and the mock AICTE feed',
    'sys.clock': 'Demo clock',
    'sys.clock_intro': 'Moves the portal\'s date so reminders, escalations and expiries can be shown without waiting. Each day moved replays the daily job.',
    'sys.today': 'Portal date',
    'sys.simulated': 'Simulated: {n} day(s) from the real date ({real})',
    'sys.real': 'Showing the real date',
    'sys.days_n': '+{n} day(s)',
    'sys.reset_clock': 'Back to today',
    'sys.clock_confirm': 'Move the demo clock by {n} day(s)? The daily job is replayed for every day passed.',
    'sys.clock_reset_confirm': 'Set the demo clock back to the real date? The daily job runs once for that date.',
    'sys.clock_done': 'The portal date is now {date}. The daily job ran for {days} day(s): {reminders} reminders, {escalations} escalations, {notices} compliance notices.',
    'sys.clock_hint': 'Other pages show the new date after you open them again.',
    'sys.job': 'Daily job',
    'sys.job_intro': 'Raises reminders and escalations that are due and issues compliance notices. It is safe to run more than once: nothing is raised twice.',
    'sys.job_run': 'Run the daily job now',
    'sys.job_done': 'Daily job for {date}: {reminders} reminders, {escalations} escalations, {notices} compliance notices.',
    'sys.server': 'This server',
    'sys.s_status': 'Status',
    'sys.s_ok': 'Running',
    'sys.s_version': 'Version',
    'sys.s_api': 'API address',
    'sys.s_same': 'Same server as this site',
    'sys.api_docs': 'Open the API documentation (OpenAPI)',
    'sys.reset': 'Reset demo data',
    'sys.reset_intro': 'Rebuilds the fictitious demo world from the saved snapshot: applications, undertakings, documents, users, the audit trail and the clock. Everything done since is lost and everyone is signed out.',
    'sys.reset_btn': 'Reset demo data',
    'sys.reset_confirm': 'Reset all demo data? Everything entered since the last reset will be lost and every user will have to sign in again.',
    'sys.reset_done': 'Demo data was reset ({how}). Reloading…',
    'sys.integ': 'Mock feed from an existing AICTE system',
    'sys.integ_warn_title': 'This is a mock, not a real integration',
    'sys.integ_warn': 'It stands in for a feed from the approval system AICTE already runs. Each item below is routed by the same workflow engine as an application an institution submits itself, so you can see how imported cases are routed, assigned and clocked. The applications it creates are fictitious.',
    'sys.integ_json': 'Feed contents (JSON, editable)',
    'sys.integ_hint': 'Each item needs the institution\'s permanent ID (pid), the application type (app_type), a programme and an intake.',
    'sys.integ_load': 'Load a fresh sample',
    'sys.integ_import': 'Import into the portal',
    'sys.integ_json_error': 'The feed is not valid JSON: {msg}',
    'sys.integ_results': 'Import result',
    'sys.integ_summary': '{ok} of {n} items imported from "{source}".',
    'sys.col_pid': 'Permanent ID',
    'sys.col_result': 'Result',
    'sys.col_case': 'Application',
    'sys.col_route': 'Route',
    'sys.col_state': 'State',
    'sys.col_error': 'Why not',
    'sys.imported': 'Imported',
    'sys.refused': 'Refused',
    'sys.sample_loaded': 'A fresh sample feed was loaded.',
  },
  hi: {
    'sys.title': 'सिस्टम',
    'sys.subtitle': 'डेमो नियंत्रण: अनुकरित तिथि, दैनिक कार्य, साफ़ रीसेट और नकली एआईसीटीई फ़ीड',
    'sys.clock': 'डेमो घड़ी',
    'sys.clock_intro': 'पोर्टल की तिथि आगे बढ़ाता है ताकि अनुस्मारक, वृद्धि और समाप्ति बिना प्रतीक्षा किए दिखाई जा सकें। आगे बढ़ाए गए हर दिन के लिए दैनिक कार्य दोबारा चलता है।',
    'sys.today': 'पोर्टल की तिथि',
    'sys.simulated': 'अनुकरित: वास्तविक तिथि ({real}) से {n} दिन आगे',
    'sys.real': 'वास्तविक तिथि दिखाई जा रही है',
    'sys.days_n': '+{n} दिन',
    'sys.reset_clock': 'आज की तिथि पर लौटें',
    'sys.clock_confirm': 'डेमो घड़ी {n} दिन आगे बढ़ाएँ? बीते हर दिन के लिए दैनिक कार्य दोबारा चलेगा।',
    'sys.clock_reset_confirm': 'डेमो घड़ी वास्तविक तिथि पर लौटाएँ? उस तिथि के लिए दैनिक कार्य एक बार चलेगा।',
    'sys.clock_done': 'पोर्टल की तिथि अब {date} है। दैनिक कार्य {days} दिन चला: {reminders} अनुस्मारक, {escalations} वृद्धियाँ, {notices} अनुपालन सूचनाएँ।',
    'sys.clock_hint': 'अन्य पृष्ठ दोबारा खोलने पर नई तिथि दिखाएँगे।',
    'sys.job': 'दैनिक कार्य',
    'sys.job_intro': 'देय अनुस्मारक और वृद्धियाँ उठाता है और अनुपालन सूचनाएँ जारी करता है। इसे एक से अधिक बार चलाना सुरक्षित है: कुछ भी दो बार नहीं उठता।',
    'sys.job_run': 'दैनिक कार्य अभी चलाएँ',
    'sys.job_done': '{date} का दैनिक कार्य: {reminders} अनुस्मारक, {escalations} वृद्धियाँ, {notices} अनुपालन सूचनाएँ।',
    'sys.server': 'यह सर्वर',
    'sys.s_status': 'स्थिति',
    'sys.s_ok': 'चालू',
    'sys.s_version': 'संस्करण',
    'sys.s_api': 'एपीआई पता',
    'sys.s_same': 'इस साइट वाला ही सर्वर',
    'sys.api_docs': 'एपीआई दस्तावेज़ (OpenAPI) खोलें',
    'sys.reset': 'डेमो डेटा रीसेट करें',
    'sys.reset_intro': 'सहेजे गए स्नैपशॉट से काल्पनिक डेमो दुनिया फिर से बनाता है: आवेदन, वचनबद्धताएँ, दस्तावेज़, उपयोगकर्ता, ऑडिट ट्रेल और घड़ी। उसके बाद किया गया सब कुछ मिट जाता है और सभी साइन-आउट हो जाते हैं।',
    'sys.reset_btn': 'डेमो डेटा रीसेट करें',
    'sys.reset_confirm': 'सारा डेमो डेटा रीसेट करें? पिछले रीसेट के बाद दर्ज सब कुछ मिट जाएगा और हर उपयोगकर्ता को फिर से साइन-इन करना होगा।',
    'sys.reset_done': 'डेमो डेटा रीसेट हो गया ({how})। पुनः लोड हो रहा है…',
    'sys.integ': 'मौजूदा एआईसीटीई प्रणाली से नकली फ़ीड',
    'sys.integ_warn_title': 'यह नकली (मॉक) है, वास्तविक एकीकरण नहीं',
    'sys.integ_warn': 'यह उस अनुमोदन प्रणाली की फ़ीड का स्थान लेता है जो एआईसीटीई पहले से चलाती है। नीचे का हर आइटम उसी वर्कफ़्लो इंजन से गुज़रता है जिससे संस्था का स्वयं जमा किया आवेदन गुज़रता है, ताकि आप देख सकें कि आयातित मामले कैसे रूट, आवंटित और समय-बद्ध होते हैं। इससे बने आवेदन काल्पनिक हैं।',
    'sys.integ_json': 'फ़ीड की सामग्री (JSON, संपादन योग्य)',
    'sys.integ_hint': 'हर आइटम में संस्था की स्थायी आईडी (pid), आवेदन प्रकार (app_type), कार्यक्रम और प्रवेश क्षमता चाहिए।',
    'sys.integ_load': 'नया नमूना लोड करें',
    'sys.integ_import': 'पोर्टल में आयात करें',
    'sys.integ_json_error': 'फ़ीड मान्य JSON नहीं है: {msg}',
    'sys.integ_results': 'आयात का परिणाम',
    'sys.integ_summary': '"{source}" से {n} में से {ok} आइटम आयात हुए।',
    'sys.col_pid': 'स्थायी आईडी',
    'sys.col_result': 'परिणाम',
    'sys.col_case': 'आवेदन',
    'sys.col_route': 'मार्ग',
    'sys.col_state': 'स्थिति',
    'sys.col_error': 'क्यों नहीं',
    'sys.imported': 'आयात हुआ',
    'sys.refused': 'अस्वीकृत',
    'sys.sample_loaded': 'नया नमूना फ़ीड लोड हो गया।',
  },
});

const { meta: meta0 } = await initPage({
  roles: ['admin'],
  active: 'system',
  title: 'sys.title',
  subtitle: 'sys.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.system' }],
});

let meta = meta0;
let health = null;
let clockMsg = null; // {text}
let jobMsg = null;
let integJson = '';
let integResult = null; // {source, results} | {error}

const apiBase = (window.AS_CONFIG && window.AS_CONFIG.apiBase) || '';
const docsUrl = `${apiBase}/api/docs`;

/* ---------------------------------------------------------------- clock */
function renderClock() {
  const c = meta || {};
  const card = $('#clock-card');
  const sim = c.simulated
    ? t('sys.simulated', { n: c.offset_days, real: fmtDate(c.real_today) })
    : t('sys.real');
  const move = (n) => el('button', { class: 'btn secondary', type: 'button', onclick: (e) => moveClock(e.currentTarget, { days: n }, t('sys.clock_confirm', { n })) }, t('sys.days_n', { n }));
  mount(card,
    el('div', { class: 'card-head' }, el('h2', {}, el('span', { html: icon('clock', 18) }), t('sys.clock'))),
    el('div', { class: 'card-body' },
      el('p', { class: 'text-2 small mt-0' }, t('sys.clock_intro')),
      el('div', { class: 'muted small' }, t('sys.today')),
      el('div', { class: 'clock-date' }, fmtDate(c.today)),
      el('div', { class: `small ${c.simulated ? '' : 'muted'}`, style: { marginBottom: '14px' } }, c.simulated ? el('span', { class: 'badge b-saffron' }, sim) : sim),
      el('div', { class: 'btn-row' }, move(1), move(7), move(30),
        el('button', { class: 'btn ghost', type: 'button', html: `${icon('refresh', 15)} ${esc(t('sys.reset_clock'))}`, onclick: (e) => moveClock(e.currentTarget, { reset: true }, t('sys.clock_reset_confirm')) })),
      clockMsg ? el('div', { class: 'alert success result-box' }, el('span', { class: 'icon', html: icon('check-circle', 18) }), el('div', {}, clockMsg, ' ', el('span', { class: 'muted' }, t('sys.clock_hint')))) : null));
}

async function moveClock(btn, body, confirmText) {
  if (!(await confirmDialog(confirmText, { title: t('sys.clock'), confirmLabel: t('common.confirm') }))) return;
  try {
    const res = await withBusy(btn, () => api.post('/admin/clock', body));
    const r = res.result || {};
    clockMsg = t('sys.clock_done', { date: fmtDate(res.today), days: r.days_run ?? 0, reminders: r.reminders ?? 0, escalations: r.escalations ?? 0, notices: r.notices ?? 0 });
    meta = await api.get('/meta', null, { noRedirect: true });
    renderClock();
  } catch (e) {
    toast(e.message, 'error');
  }
}

/* ---------------------------------------------------------------- daily job */
function renderJob() {
  mount($('#job-card'),
    el('div', { class: 'card-head' }, el('h2', {}, el('span', { html: icon('zap', 18) }), t('sys.job'))),
    el('div', { class: 'card-body' },
      el('p', { class: 'text-2 small mt-0' }, t('sys.job_intro')),
      el('button', { class: 'btn', type: 'button', html: `${icon('play', 15)} ${esc(t('sys.job_run'))}`, onclick: runJob }),
      jobMsg ? el('div', { class: 'alert success result-box' }, el('span', { class: 'icon', html: icon('check-circle', 18) }), el('div', {}, jobMsg)) : null));
}

async function runJob(e) {
  try {
    const res = await withBusy(e.currentTarget, () => api.post('/admin/run-daily-job'));
    const r = res.result || {};
    jobMsg = t('sys.job_done', { date: fmtDate(res.today), reminders: r.reminders ?? 0, escalations: r.escalations ?? 0, notices: r.notices ?? 0 });
    renderJob();
    toast(jobMsg, 'success');
  } catch (err) {
    toast(err.message, 'error');
  }
}

/* ---------------------------------------------------------------- server + reset */
function renderServer() {
  mount($('#server-card'),
    el('div', { class: 'card-head' }, el('h2', {}, el('span', { html: icon('settings', 18) }), t('sys.server'))),
    el('div', { class: 'card-body' },
      dl([
        [t('sys.s_status'), health ? `<span class="badge b-success"><span class="dot"></span>${esc(t('sys.s_ok'))}</span>` : '—'],
        [t('sys.s_version'), esc(health ? `${health.version}` : '—')],
        [t('sys.s_api'), apiBase ? `<span class="mono small">${esc(apiBase)}</span>` : esc(t('sys.s_same'))],
      ], { cols: 1 }),
      el('div', { class: 'mt-2' }, el('a', { class: 'btn secondary', href: docsUrl, target: '_blank', rel: 'noopener', html: `${icon('link', 15)} ${esc(t('sys.api_docs'))}` }))));
}

function renderReset() {
  mount($('#reset-card'),
    el('div', { class: 'card-head' }, el('h2', {}, el('span', { html: icon('alert', 18) }), t('sys.reset'))),
    el('div', { class: 'card-body' },
      el('p', { class: 'text-2 small mt-0' }, t('sys.reset_intro')),
      el('button', { class: 'btn danger', type: 'button', html: `${icon('trash', 15)} ${esc(t('sys.reset_btn'))}`, onclick: resetDemo })));
}

async function resetDemo(e) {
  if (!(await confirmDialog(t('sys.reset_confirm'), { title: t('sys.reset'), confirmLabel: t('sys.reset_btn'), variant: 'danger' }))) return;
  try {
    const res = await withBusy(e.currentTarget, () => api.post('/admin/reset-demo'));
    toast(t('sys.reset_done', { how: res.how || '' }), 'success');
    setTimeout(() => { location.reload(); }, 1500);
  } catch (err) {
    toast(err.message, 'error');
  }
}

/* ---------------------------------------------------------------- mock integration */
function renderInteg() {
  const ta = el('textarea', { class: 'textarea json-area', id: 'i-json', rows: 12, spellcheck: 'false' });
  ta.value = integJson;
  ta.addEventListener('input', () => { integJson = ta.value; });
  const resBox = el('div');
  mount($('#integ-card'),
    el('div', { class: 'card-head' }, el('h2', {}, el('span', { html: icon('git-branch', 18) }), t('sys.integ'))),
    el('div', { class: 'card-body' },
      el('div', { class: 'alert saffron', style: { marginBottom: '14px' } }, el('span', { class: 'icon', html: icon('info', 18) }),
        el('div', {}, el('div', { class: 'a-title' }, t('sys.integ_warn_title')), t('sys.integ_warn'))),
      field('i-json', t('sys.integ_json'), ta, t('sys.integ_hint')),
      el('div', { class: 'btn-row', style: { marginTop: '12px' } },
        el('button', { class: 'btn', type: 'button', html: `${icon('upload', 15)} ${esc(t('sys.integ_import'))}`, onclick: importFeed }),
        el('button', { class: 'btn secondary', type: 'button', html: `${icon('refresh', 15)} ${esc(t('sys.integ_load'))}`, onclick: (e) => loadSample(e.currentTarget, true) })),
      el('div', { class: 'result-box', 'aria-live': 'polite' }, resBox)));
  drawIntegResult(resBox);
}

function drawIntegResult(box) {
  if (!integResult) return;
  if (integResult.error) {
    mount(box, el('div', { class: 'alert danger' }, el('span', { class: 'icon', html: icon('alert-circle', 18) }), el('div', {}, integResult.error)));
    return;
  }
  const rows = integResult.results || [];
  const ok = rows.filter((r) => r.ok).length;
  const table = el('div');
  mount(box, el('h3', { style: { fontSize: '1rem', margin: '4px 0 8px' } }, t('sys.integ_results')),
    el('p', { class: 'text-2 small mt-0' }, t('sys.integ_summary', { ok, n: rows.length, source: integResult.source })), table);
  renderTable(table, {
    columns: [
      { key: 'pid', label: t('sys.col_pid'), render: (r) => `<span class="mono small">${esc(r.pid)}</span>` },
      { key: 'ok', label: t('sys.col_result'), render: (r) => `<span class="badge ${r.ok ? 'b-success' : 'b-danger'}">${esc(t(r.ok ? 'sys.imported' : 'sys.refused'))}</span>` },
      { key: 'ref_no', label: t('sys.col_case'), render: (r) => (r.ok ? `<a class="mono" href="${esc(site(`staff/application.html?id=${r.id}`))}">${esc(r.ref_no)}</a>` : '—') },
      { key: 'route', label: t('sys.col_route'), render: (r) => (r.ok ? esc(tl(meta?.routes?.[r.route]?.label) || r.route) : '—') },
      { key: 'state', label: t('sys.col_state'), render: (r) => (r.ok ? stateBadge(r.state) : '—') },
      { key: 'error', label: t('sys.col_error'), render: (r) => esc(r.error || '') },
    ],
    rows,
    compact: true,
  });
}

async function importFeed(e) {
  let body;
  try {
    body = JSON.parse(($('#i-json').value || '').trim());
  } catch (err) {
    integResult = { error: t('sys.integ_json_error', { msg: err.message }) };
    drawIntegResult($('#integ-card .result-box > div'));
    return;
  }
  try {
    integResult = await withBusy(e.currentTarget, () => api.post('/integration/applications', body));
  } catch (err) {
    integResult = { error: err.message };
  }
  drawIntegResult($('#integ-card .result-box > div'));
}

async function loadSample(btn, announce) {
  try {
    const s = await (btn ? withBusy(btn, () => api.get('/integration/sample')) : api.get('/integration/sample'));
    integJson = JSON.stringify(s, null, 2);
    if ($('#i-json')) $('#i-json').value = integJson;
    if (announce) toast(t('sys.sample_loaded'), 'success', 2200);
  } catch (err) {
    toast(err.message, 'error');
  }
}

function renderAll() {
  renderClock();
  renderJob();
  renderServer();
  renderReset();
  renderInteg();
}

renderAll();
onLang(renderAll);
try { health = await api.get('/health', null, { noRedirect: true }); renderServer(); } catch (e) { /* shown as — */ }
await loadSample(null, false);
