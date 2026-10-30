// Institution dashboard: KPI tiles, actions needed, my applications, compliance health, next dates.
import { initPage, setPageHead } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, tl, extend, onLang, getLang } from '../assets/js/i18n.js';
import { $, el, esc, icon, kpi, mount, renderTable, fmtDate, monthName, loading, emptyState, errorState,
  stateBadge, flagChips, daysChip, utBadge, validityBadge } from '../assets/js/ui.js';

extend({
  en: {
    'idash.title': 'Dashboard',
    'idash.subtitle': 'Your applications, what needs you and what is coming up',
    'idash.act_title': 'Actions needed',
    'idash.act_sub': 'Most urgent first',
    'idash.act_empty': 'Nothing needs your action',
    'idash.act_empty_text': 'When a reply, evidence or renewal is due it will appear here.',
    'idash.apps_title': 'My applications',
    'idash.new_app': 'New application',
    'idash.apps_empty': 'No applications yet',
    'idash.apps_empty_text': 'Start one from New application. The portal picks the route for you.',
    'idash.col_app': 'Application',
    'idash.col_status': 'Status',
    'idash.col_why': 'Where it stands',
    'idash.col_due': 'Due',
    'idash.closed': 'Closed',
    'idash.health_title': 'Compliance health',
    'idash.health_of': 'out of 100',
    'idash.health_good': 'In good standing',
    'idash.health_watch': 'Needs attention',
    'idash.health_poor': 'Action needed',
    'idash.health_ok': 'Nothing is expiring, overdue or late.',
    'idash.health_open': 'Open compliance',
    'idash.next_title': 'Coming up',
    'idash.cal_open': 'Full calendar',
    'idash.next_empty': 'No dates to show',
    'idash.kind.REPLY': 'Reply to a deficiency letter',
    'idash.kind.UNDERTAKING': 'Undertaking evidence',
    'idash.kind.DOCUMENT': 'Document renewal',
    'idash.kind.EVC_VISIT': 'Expert visit',
    'idash.open': 'Open',
    'idash.r_expired': '{doc} expired',
    'idash.r_expiring': '{doc} expiring soon',
    'idash.r_overdue': '{ref} overdue',
    'idash.r_late': '{n} undertaking(s) fulfilled late',
    'idash.where': '{city}, {state} · Permanent ID {pid}',
  },
  hi: {
    'idash.title': 'डैशबोर्ड',
    'idash.subtitle': 'आपके आवेदन, आपसे क्या अपेक्षित है और आगे क्या आने वाला है',
    'idash.act_title': 'आवश्यक कार्रवाइयाँ',
    'idash.act_sub': 'सबसे अत्यावश्यक पहले',
    'idash.act_empty': 'आपकी किसी कार्रवाई की आवश्यकता नहीं',
    'idash.act_empty_text': 'जब कोई उत्तर, साक्ष्य या नवीनीकरण देय होगा तो वह यहाँ दिखेगा।',
    'idash.apps_title': 'मेरे आवेदन',
    'idash.new_app': 'नया आवेदन',
    'idash.apps_empty': 'अभी कोई आवेदन नहीं',
    'idash.apps_empty_text': 'नया आवेदन से शुरू करें। मार्ग पोर्टल तय कर देता है।',
    'idash.col_app': 'आवेदन',
    'idash.col_status': 'स्थिति',
    'idash.col_why': 'अभी कहाँ है',
    'idash.col_due': 'नियत',
    'idash.closed': 'बंद',
    'idash.health_title': 'अनुपालन स्वास्थ्य',
    'idash.health_of': '100 में से',
    'idash.health_good': 'अच्छी स्थिति',
    'idash.health_watch': 'ध्यान देने योग्य',
    'idash.health_poor': 'कार्रवाई आवश्यक',
    'idash.health_ok': 'कुछ भी समाप्त होने वाला, अतिदेय या विलंबित नहीं है।',
    'idash.health_open': 'अनुपालन खोलें',
    'idash.next_title': 'आगामी तिथियाँ',
    'idash.cal_open': 'पूरा कैलेंडर',
    'idash.next_empty': 'दिखाने के लिए कोई तिथि नहीं',
    'idash.kind.REPLY': 'कमी पत्र का उत्तर',
    'idash.kind.UNDERTAKING': 'वचनबद्धता का साक्ष्य',
    'idash.kind.DOCUMENT': 'दस्तावेज़ का नवीनीकरण',
    'idash.kind.EVC_VISIT': 'विशेषज्ञ दौरा',
    'idash.open': 'खोलें',
    'idash.r_expired': '{doc} समाप्त हो चुका',
    'idash.r_expiring': '{doc} शीघ्र समाप्त होने वाला',
    'idash.r_overdue': '{ref} अतिदेय',
    'idash.r_late': '{n} वचनबद्धता(एँ) देर से पूर्ण',
    'idash.where': '{city}, {state} · स्थायी आईडी {pid}',
  },
});

const { user, meta } = await initPage({ roles: ['institution'], active: 'dashboard', title: 'idash.title', subtitle: 'idash.subtitle' });

const TONE = { primary: '', success: 'success', warning: 'warning', danger: 'danger' };
const KPI_ICON = { open: 'queue', action: 'bell', undertakings: 'target', documents: 'file-check', score: 'shield-check' };
let data = null;

/** The API sends compliance-health reasons as English sentences; translate the known shapes. */
function reasonText(r) {
  if (getLang() !== 'hi') return r;
  let m;
  const docByEn = (en) => Object.values((meta && meta.doc_types) || {}).find((d) => d.en === en);
  if ((m = r.match(/^(.*) expired$/))) { const d = docByEn(m[1]); return t('idash.r_expired', { doc: d ? d.hi : m[1] }); }
  if ((m = r.match(/^(.*) expiring$/))) { const d = docByEn(m[1]); return t('idash.r_expiring', { doc: d ? d.hi : m[1] }); }
  if ((m = r.match(/^(\S+) overdue$/))) return t('idash.r_overdue', { ref: m[1] });
  if ((m = r.match(/^(\d+) undertaking\(s\) fulfilled late$/))) return t('idash.r_late', { n: m[1] });
  return r;
}

function renderKpis() {
  mount($('#kpis'), data.kpis.map((k) => kpi({
    label: tl(k.label), value: k.key === 'score' ? `${k.value}` : String(k.value), color: TONE[k.tone] ?? '', iconName: KPI_ICON[k.key],
    sub: k.key === 'score' ? esc(t('idash.health_of')) : null,
    onClick: k.link ? () => { location.href = site(k.link); } : null,
  })));
}

function renderActions() {
  $('#act-h').innerHTML = `${icon('bell', 19)}<span>${esc(t('idash.act_title'))}</span>`;
  $('#act-sub').textContent = t('idash.act_sub');
  const host = $('#actions');
  if (!data.action.length) { emptyState(host, { icon: 'check-circle', title: t('idash.act_empty'), text: t('idash.act_empty_text') }); return; }
  const ico = { REPLY: 'mail', UNDERTAKING: 'target', DOCUMENT: 'file-check' };
  mount(host, el('div', { class: 'list-divided' }, data.action.map((a) => el('div', { class: 'list-item act-item' },
    el('div', { class: `li-icon ${a.days_left !== null && a.days_left < 0 ? 'danger' : 'warning'}`, html: icon(ico[a.kind] || 'alert', 18) }),
    el('div', { class: 'li-main' },
      el('div', { class: 'li-title' }, tl(a.title)),
      el('div', { class: 'li-sub' }, `${t(`idash.kind.${a.kind}`, { _default: a.kind })}${a.due_date ? ` · ${t('f.due')} ${fmtDate(a.due_date)}` : ''}`)),
    el('div', { class: 'row nowrap' }, el('span', { html: daysChip(a.days_left) }),
      el('a', { class: 'btn sm', href: site(a.link) }, t('idash.open')))))));
}

function renderApps() {
  $('#apps-h').innerHTML = `${icon('queue', 19)}<span>${esc(t('idash.apps_title'))}</span>`;
  $('#apply-link').innerHTML = `${icon('plus', 15)}<span>${esc(t('idash.new_app'))}</span>`;
  const host = $('#apps');
  renderTable(host, {
    empty: { icon: 'file', title: t('idash.apps_empty'), text: t('idash.apps_empty_text') },
    onRowClick: (a) => { location.href = site(`institution/application.html?id=${a.id}`); },
    rowClass: (a) => (a.overdue ? 'row-danger' : a.approaching ? 'row-warning' : ''),
    columns: [
      { key: 'ref_no', label: t('idash.col_app'), render: (a) => `<a class="cell-main mono" href="${esc(site(`institution/application.html?id=${a.id}`))}">${esc(a.ref_no)}</a><div class="cell-sub">${esc(tl(a.app_type_label))}</div><div class="cell-sub">${esc(tl(a.route_label))}</div>` },
      { key: 'state', label: t('idash.col_status'), render: (a) => `${stateBadge(a.state)}<div style="margin-top:4px">${flagChips((a.flags || []).filter((f) => f !== 'INTEGRATION'))}</div>` },
      { key: 'why', label: t('idash.col_why'), render: (a) => `<div class="app-why">${esc(tl(a.why))}</div>` },
      { key: 'due_date', label: t('idash.col_due'), render: (a) => (a.due_date ? `${esc(fmtDate(a.due_date))}<div style="margin-top:4px">${daysChip(a.days_left, { paused: a.paused })}</div>` : `<span class="muted">${esc(t('idash.closed'))}</span>`) },
    ],
    rows: data.applications,
  });
}

function renderHealth() {
  $('#health-h').innerHTML = `${icon('shield-check', 19)}<span>${esc(t('idash.health_title'))}</span>`;
  const sc = data.score;
  const tone = sc.score >= 80 ? 'success' : sc.score >= 50 ? 'warning' : 'danger';
  const label = sc.score >= 80 ? t('idash.health_good') : sc.score >= 50 ? t('idash.health_watch') : t('idash.health_poor');
  mount($('#health'),
    el('div', { class: 'row between', style: { alignItems: 'flex-end' } },
      el('div', {}, el('span', { class: 'score-num' }, String(sc.score)), el('span', { class: 'muted', style: { marginLeft: '6px' } }, t('idash.health_of'))),
      el('span', { class: `badge lg ${tone === 'success' ? 'b-success' : tone === 'warning' ? 'b-warning' : 'b-danger'}` }, label)),
    el('div', { class: `meter lg ${tone === 'success' ? '' : tone}`, style: { margin: '10px 0 12px' }, role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': sc.score, 'aria-label': t('idash.health_title') },
      el('span', { style: { width: `${sc.score}%` } })),
    sc.reasons.length
      ? el('ul', { class: 'list-plain' }, sc.reasons.map((r) => el('li', { style: { display: 'flex', gap: '8px', padding: '3px 0' } }, el('span', { style: { color: 'var(--as-warning)' }, html: icon('alert', 16) }), el('span', {}, reasonText(r)))))
      : el('p', { class: 'text-2 mb-0' }, t('idash.health_ok')),
    el('div', { style: { marginTop: '12px' } }, el('a', { class: 'btn sm secondary', href: site('institution/compliance.html') }, t('idash.health_open'))));
}

function eventBadge(e) {
  if (e.kind === 'UNDERTAKING') return utBadge(e.status === 'OVERDUE' ? 'PENDING' : e.status, e.status === 'OVERDUE');
  if (e.kind === 'DOCUMENT') return validityBadge(e.status);
  return '';
}

function renderEvents() {
  $('#next-h').innerHTML = `${icon('calendar', 19)}<span>${esc(t('idash.next_title'))}</span>`;
  $('#cal-link').textContent = t('idash.cal_open');
  const host = $('#events');
  if (!data.events.length) { mount(host, el('p', { class: 'muted mb-0' }, t('idash.next_empty'))); return; }
  mount(host, el('ul', { class: 'cal-list' }, data.events.map((e) => {
    const [, mo, d] = e.date.split('-').map(Number);
    const bad = e.status === 'OVERDUE' || e.status === 'EXPIRED';
    return el('li', {},
      el('div', { class: `cal-date ${bad ? 'bad' : ''}`, 'aria-hidden': 'true' }, el('span', { class: 'd' }, String(d)), el('span', { class: 'm' }, monthName(mo - 1))),
      el('div', { class: 'grow' },
        el('a', { href: site(e.link) }, tl(e.title)),
        el('div', { class: 'small muted' }, `${fmtDate(e.date)} · ${t(`idash.kind.${e.kind}`, { _default: e.kind })} `, el('span', { html: eventBadge(e) }))));
  })));
}

function render() {
  if (!data) return;
  setPageHead({ subtitle: `${data.institution.name} · ${t('idash.where', { city: data.institution.city, state: data.institution.state, pid: data.institution.pid })}` });
  renderKpis(); renderActions(); renderApps(); renderHealth(); renderEvents();
}

async function load() {
  ['#kpis', '#actions', '#apps', '#health', '#events'].forEach((s) => loading($(s)));
  try {
    data = await api.get('/dashboard');
    render();
  } catch (e) {
    ['#actions', '#apps', '#health', '#events'].forEach((s) => errorState($(s), e, load));
    mount($('#kpis'));
  }
}

onLang(render);
load();
