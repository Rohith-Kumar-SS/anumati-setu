// Outcome tracker: the seven outcomes of the problem statement measured live, plus the automation counter.
import { initPage } from '../assets/js/layout.js';
import { api } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import { $, el, esc, mount, loading, errorState, renderTable, fmtNum, fmtDate, icon } from '../assets/js/ui.js';
import { doughnutChart, SERIES } from '../assets/js/charts.js';

extend({
  en: {
    'out.title': 'Outcome tracker',
    'out.subtitle': 'The seven outcomes the problem statement asks for, measured live on the prototype',
    'out.note_title': 'Honest reading',
    'out.measured': 'Measured on {date}',
    'out.how': 'How this is measured',
    'out.u.actions': 'actions',
    'out.u.docs': 'documents',
    'out.u.x': '×',
    'out.auto_title': 'What the portal did without an officer touching it',
    'out.auto_sub': 'Every automated action is written to the audit trail as "System"',
    'out.auto_action': 'Automated action',
    'out.auto_30': 'Last 30 days',
    'out.auto_all': 'All time',
    'out.auto_center': 'in 30 days',
    'out.d.routed': 'Routed to a stage',
    'out.d.advanced': 'Moved to next stage',
    'out.d.assigned': 'Assigned to an officer',
    'out.d.resumed': 'Clock resumed',
    'out.d.reminders': 'Reminders sent',
    'out.d.escalations': 'Escalations raised',
    'out.d.letters': 'Letters issued',
    'out.d.total': 'Total',
    'out.d.median_days_to_decision': 'Median days to decision',
    'out.d.decided': 'Applications decided',
    'out.d.stages_completed': 'Stages completed',
    'out.d.completed_on_time_pct': 'EVCs completed on time (%)',
    'out.d.scheduled': 'EVCs scheduled',
    'out.d.completed': 'EVCs completed',
    'out.d.due_so_far': 'Due so far',
    'out.d.on_time': 'Fulfilled on time',
    'out.d.renewals': 'Renewals received',
    'out.d.renewed_before_expiry': 'Renewed before expiry',
    'out.d.expiring_within_window': 'Expiring within 90 days',
    'out.d.raised': 'Escalations raised (90 days)',
    'out.d.by_level': 'By level',
    'out.d.audit_chain': 'Audit trail intact',
    'out.d.officers': 'Regional Officers',
    'out.d.reassignments': 'Reassignments',
    'out.d.suggestions_now': 'Balancing suggestions now',
  },
  hi: {
    'out.title': 'परिणाम ट्रैकर',
    'out.subtitle': 'समस्या कथन में अपेक्षित सात परिणाम, प्रोटोटाइप पर सीधे मापे गए',
    'out.note_title': 'ईमानदार पाठ',
    'out.measured': '{date} को मापा गया',
    'out.how': 'यह कैसे मापा जाता है',
    'out.u.actions': 'कार्य',
    'out.u.docs': 'दस्तावेज़',
    'out.u.x': '×',
    'out.auto_title': 'पोर्टल ने बिना किसी अधिकारी के छुए क्या किया',
    'out.auto_sub': 'हर स्वचालित कार्य ऑडिट ट्रेल में "सिस्टम" के नाम से दर्ज होता है',
    'out.auto_action': 'स्वचालित कार्य',
    'out.auto_30': 'पिछले 30 दिन',
    'out.auto_all': 'अब तक',
    'out.auto_center': '30 दिनों में',
    'out.d.routed': 'चरण पर भेजे गए',
    'out.d.advanced': 'अगले चरण में भेजे गए',
    'out.d.assigned': 'अधिकारी को आवंटित',
    'out.d.resumed': 'समय-सीमा पुनः चालू',
    'out.d.reminders': 'अनुस्मारक भेजे गए',
    'out.d.escalations': 'वृद्धियाँ की गईं',
    'out.d.letters': 'पत्र जारी',
    'out.d.total': 'कुल',
    'out.d.median_days_to_decision': 'निर्णय तक औसत दिन',
    'out.d.decided': 'निर्णीत आवेदन',
    'out.d.stages_completed': 'पूर्ण चरण',
    'out.d.completed_on_time_pct': 'समय पर पूर्ण ईवीसी (%)',
    'out.d.scheduled': 'निर्धारित ईवीसी',
    'out.d.completed': 'पूर्ण ईवीसी',
    'out.d.due_so_far': 'अब तक नियत',
    'out.d.on_time': 'समय पर पूर्ण',
    'out.d.renewals': 'प्राप्त नवीनीकरण',
    'out.d.renewed_before_expiry': 'समाप्ति से पहले नवीनीकृत',
    'out.d.expiring_within_window': '90 दिनों में समाप्त होने वाले',
    'out.d.raised': 'वृद्धियाँ (90 दिन)',
    'out.d.by_level': 'स्तर के अनुसार',
    'out.d.audit_chain': 'ऑडिट ट्रेल अक्षुण्ण',
    'out.d.officers': 'क्षेत्रीय अधिकारी',
    'out.d.reassignments': 'पुनः आवंटन',
    'out.d.suggestions_now': 'अभी संतुलन सुझाव',
  },
});

const { meta } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'evc', 'committee', 'authority'],
  active: 'outcomes',
  title: 'out.title',
  subtitle: 'out.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.outcomes' }],
});

const ICONS = { manual_work: 'zap', faster: 'clock', evc: 'calendar', undertakings: 'file-check', expired_docs: 'shield-alert', accountability: 'bell', resources: 'users' };
const ACCENTS = ['accent-top', 'accent-saffron', 'accent-green'];
const AUTO_KEYS = ['routed', 'advanced', 'assigned', 'resumed', 'reminders', 'escalations', 'letters'];
let data = null;
let chart = null;

function unitText(u) {
  if (u === '%') return '%';
  return t(`out.u.${u}`, { _default: u });
}

function detailValue(key, v) {
  if (typeof v === 'boolean') return v ? t('common.yes') : t('common.no');
  if (v && typeof v === 'object') return Object.entries(v).map(([k, n]) => `${k} ${fmtNum(n)}`).join(' · ');
  return `${fmtNum(v, 1)}${key.endsWith('_pct') ? '%' : ''}`;
}

function renderCards() {
  mount($('#cards'), data.items.map((o, i) => el('div', { class: `card oc-card ${ACCENTS[i % ACCENTS.length]}` },
    el('div', { class: 'card-body' },
      el('div', { class: 'row', style: { gap: '10px', alignItems: 'flex-start', flexWrap: 'nowrap' } },
        el('span', { class: 'li-icon', style: { width: '34px', height: '34px', borderRadius: '8px', display: 'grid', placeItems: 'center', flex: 'none', background: 'var(--as-primary-50)', color: 'var(--as-primary)' }, html: icon(ICONS[o.key] || 'target', 18) }),
        el('div', {}, el('div', { class: 'oc-outcome' }, tl(o.outcome)), el('div', { class: 'oc-metric' }, tl(o.metric)))),
      el('div', { class: 'oc-value', 'aria-label': `${fmtNum(o.value, 1)} ${unitText(o.unit)}` }, fmtNum(o.value, 1), el('span', { class: 'u' }, unitText(o.unit))),
      el('div', { class: 'oc-detail' }, Object.entries(o.detail || {}).map(([k, v]) =>
        el('div', { class: 'stat-inline' }, el('span', { class: 'v' }, detailValue(k, v)), el('span', { class: 'l' }, t(`out.d.${k}`, { _default: k }))))),
      el('div', { class: 'oc-method' }, el('b', {}, `${t('out.how')}: `), tl(o.method))))));
}

function renderAuto() {
  $('#auto-title').textContent = t('out.auto_title');
  $('#auto-sub').textContent = t('out.auto_sub');
  const a30 = data.automation || {};
  const all = data.automation_all_time || {};
  const tableBox = el('div');
  const chartBox = el('div', { class: 'chart-box' }, el('canvas', { role: 'img', 'aria-label': t('out.auto_title') }));
  mount($('#auto'), tableBox, chartBox);
  renderTable(tableBox, {
    columns: [
      { key: 'k', label: t('out.auto_action'), render: (r) => (r.k === 'total' ? `<strong>${esc(t('out.d.total'))}</strong>` : esc(t(`out.d.${r.k}`))) },
      { key: 'a30', label: t('out.auto_30'), align: 'right', render: (r) => (r.k === 'total' ? `<strong>${esc(fmtNum(r.a30))}</strong>` : esc(fmtNum(r.a30))) },
      { key: 'all', label: t('out.auto_all'), align: 'right', render: (r) => (r.k === 'total' ? `<strong>${esc(fmtNum(r.all))}</strong>` : esc(fmtNum(r.all))) },
    ],
    rows: [...AUTO_KEYS, 'total'].map((k) => ({ k, a30: a30[k] ?? 0, all: all[k] ?? 0 })),
    compact: true,
  });
  if (chart) { try { chart.destroy(); } catch (e) { /* gone */ } chart = null; }
  if (window.Chart) {
    chart = doughnutChart(chartBox.querySelector('canvas'), {
      labels: AUTO_KEYS.map((k) => t(`out.d.${k}`)),
      data: AUTO_KEYS.map((k) => a30[k] ?? 0),
      colors: SERIES,
      center: { value: fmtNum(a30.total), label: t('out.auto_center') },
      legend: 'bottom',
    });
  }
}

function renderAll() {
  if (!data) return;
  mount($('#note'), el('div', { class: 'alert saffron' }, el('span', { class: 'icon', html: icon('info', 18) }),
    el('div', {}, el('div', { class: 'a-title' }, t('out.note_title')), tl(data.note), ' ', el('span', { class: 'muted' }, t('out.measured', { date: fmtDate(data.today) })))));
  renderCards();
  renderAuto();
}

async function load() {
  loading($('#cards'));
  try {
    data = await api.get('/reports/outcomes');
    renderAll();
  } catch (err) {
    errorState($('#cards'), err, load);
  }
}

onLang(renderAll);
load();
