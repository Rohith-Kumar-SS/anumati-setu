// Workload: officer load table with a load index, and rebalancing suggestions the supervisor approves in one go.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, icon, kpi, mount, loading, emptyState, errorState, renderTable, toast, withBusy, setParams, getParam, daysChip, fmtNum,
} from '../assets/js/ui.js';
import { field, select, askText, pick, regionName, roleLabel, meterClass } from './casekit.js';

extend({
  en: {
    'wl.title': 'Workload',
    'wl.subtitle': 'How evenly the scrutiny and EVC-scheduling queues are spread, and the moves that would balance them',
    'wl.officers': 'Officers',
    'wl.officers_sub': 'Open scrutiny and EVC-scheduling cases per Regional Officer',
    'wl.suggestions': 'Rebalancing suggestions',
    'wl.suggestions_sub': 'The portal proposes; you approve each move.',
    'wl.region': 'Region',
    'wl.k_officers': 'Regional Officers',
    'wl.k_open': 'Open cases held',
    'wl.k_overdue': 'Overdue',
    'wl.k_moves': 'Suggested moves',
    'wl.col_officer': 'Officer',
    'wl.col_region': 'Region',
    'wl.col_open': 'Open',
    'wl.col_overdue': 'Overdue',
    'wl.col_verify': 'To verify (region)',
    'wl.col_load': 'Load index',
    'wl.note': 'Load index = the officer\'s open cases divided by the average in the same region (1.0× is an even share). Suggestions appear when the busiest and the lightest officer differ by 3 or more cases; only cases still in scrutiny are proposed.',
    'wl.no_officers': 'No officers in scope',
    'wl.select_all': 'Select all',
    'wl.select_none': 'Clear selection',
    'wl.apply': 'Apply selected ({n})',
    'wl.apply_title': 'Apply suggested moves ({n})',
    'wl.apply_intro': 'The selected cases are reassigned and each new holder is notified. This is recorded in the audit trail.',
    'wl.reason_label': 'Reason for rebalancing',
    'wl.reason_hint': 'Recorded against every moved case.',
    'wl.default_reason': 'Workload balancing suggested by the portal and approved by the supervisor',
    'wl.applied': 'Cases reassigned: {n}',
    'wl.balanced': 'The workload is balanced',
    'wl.balanced_text': 'No officer is carrying 3 or more cases more than a colleague in the same region.',
    'wl.move_pick': 'Select this move: {ref}',
    'wl.from': 'from',
    'wl.to': 'to',
  },
  hi: {
    'wl.title': 'कार्यभार',
    'wl.subtitle': 'संवीक्षा और ईवीसी-निर्धारण की कतारें कितनी समान बँटी हैं, और संतुलन के लिए सुझाए गए बदलाव',
    'wl.officers': 'अधिकारी',
    'wl.officers_sub': 'प्रत्येक क्षेत्रीय अधिकारी के पास खुले संवीक्षा व ईवीसी-निर्धारण मामले',
    'wl.suggestions': 'पुनर्संतुलन के सुझाव',
    'wl.suggestions_sub': 'पोर्टल सुझाता है; हर बदलाव आप स्वीकृत करते हैं।',
    'wl.region': 'क्षेत्र',
    'wl.k_officers': 'क्षेत्रीय अधिकारी',
    'wl.k_open': 'धारित खुले मामले',
    'wl.k_overdue': 'अतिदेय',
    'wl.k_moves': 'सुझाए गए बदलाव',
    'wl.col_officer': 'अधिकारी',
    'wl.col_region': 'क्षेत्र',
    'wl.col_open': 'खुले',
    'wl.col_overdue': 'अतिदेय',
    'wl.col_verify': 'सत्यापन हेतु (क्षेत्र)',
    'wl.col_load': 'भार सूचकांक',
    'wl.note': 'भार सूचकांक = अधिकारी के खुले मामले ÷ उसी क्षेत्र का औसत (1.0× यानी बराबर हिस्सा)। जब सबसे व्यस्त और सबसे कम व्यस्त अधिकारी में 3 या अधिक मामलों का अंतर हो तब सुझाव आते हैं; केवल संवीक्षाधीन मामले सुझाए जाते हैं।',
    'wl.no_officers': 'दायरे में कोई अधिकारी नहीं',
    'wl.select_all': 'सभी चुनें',
    'wl.select_none': 'चयन हटाएँ',
    'wl.apply': 'चुने हुए लागू करें ({n})',
    'wl.apply_title': 'सुझाए गए बदलाव लागू करें ({n})',
    'wl.apply_intro': 'चुने हुए मामले पुनः नियत होंगे और प्रत्येक नए धारक को सूचना मिलेगी। यह ऑडिट ट्रेल में दर्ज होगा।',
    'wl.reason_label': 'पुनर्संतुलन का कारण',
    'wl.reason_hint': 'हर स्थानांतरित मामले के साथ दर्ज होगा।',
    'wl.default_reason': 'कार्यभार संतुलन: पोर्टल द्वारा सुझाया और पर्यवेक्षक द्वारा स्वीकृत',
    'wl.applied': 'पुनः नियत मामले: {n}',
    'wl.balanced': 'कार्यभार संतुलित है',
    'wl.balanced_text': 'कोई अधिकारी अपने क्षेत्र के सहकर्मी से 3 या अधिक मामले ज़्यादा नहीं संभाल रहा।',
    'wl.move_pick': 'यह बदलाव चुनें: {ref}',
    'wl.from': 'से',
    'wl.to': 'को',
  },
});

const { user, meta } = await initPage({
  roles: ['rd', 'bureau'],
  active: 'workload',
  title: 'wl.title',
  subtitle: 'wl.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'wl.title' }],
});

const SHOW_REGION = !['rd'].includes(user.role);
const f = { region: getParam('region') || '' };
let data = null;
const picked = new Set();
const key = (m) => `${m.application.id}:${m.to.id}`;

const filtersCard = $('#filters-card');
const formEl = $('#filters');
const applyBtn = $('#apply');
const selectAllBtn = $('#select-all');

function buildFilters() {
  filtersCard.hidden = !SHOW_REGION;
  if (!SHOW_REGION) return;
  mount(formEl, field({
    label: t('wl.region'), id: 'f-region',
    control: select([{ value: '', label: t('common.all'), selected: !f.region }, ...meta.regions.map((r) => ({ value: r.code, label: `${regionName(r)} (${r.code})`, selected: f.region === r.code }))], { name: 'region' }),
  }));
}
formEl.addEventListener('submit', (e) => e.preventDefault());
formEl.addEventListener('change', () => { f.region = formEl.elements.region.value; setParams({ region: f.region || null }); picked.clear(); load(); });

function renderKpis() {
  const officers = data.officers;
  mount($('#kpis'),
    kpi({ label: t('wl.k_officers'), value: fmtNum(officers.length), color: '' }),
    kpi({ label: t('wl.k_open'), value: fmtNum(officers.reduce((a, o) => a + o.open, 0)), color: 'info' }),
    kpi({ label: t('wl.k_overdue'), value: fmtNum(officers.reduce((a, o) => a + o.overdue, 0)), color: 'danger' }),
    kpi({ label: t('wl.k_moves'), value: fmtNum(data.suggestions.length), color: 'saffron' }));
}

function renderOfficers() {
  const rows = [...data.officers].sort((a, b) => a.region.localeCompare(b.region) || b.load_index - a.load_index);
  renderTable($('#officers'), {
    columns: [
      { key: 'name', label: t('wl.col_officer'), render: (o) => `<div class="cell-main">${esc(o.user.name)}</div><div class="cell-sub">${esc(roleLabel(o.user.role))} · ${esc(o.user.designation)}</div>` },
      { key: 'region', label: t('wl.col_region'), render: (o) => { const r = meta.regions.find((x) => x.code === o.region); return esc(r ? `${regionName(r)} (${o.region})` : o.region); } },
      { key: 'open', label: t('wl.col_open'), align: 'right', render: (o) => esc(String(o.open)) },
      { key: 'overdue', label: t('wl.col_overdue'), align: 'right', render: (o) => (o.overdue ? `<span class="badge b-danger">${esc(String(o.overdue))}</span>` : '0') },
      { key: 'verify', label: t('wl.col_verify'), align: 'right', render: (o) => esc(String(o.verify_pending_region ?? 0)) },
      {
        key: 'load', label: t('wl.col_load'),
        render: (o) => `<div class="wl-load"><div class="meter ${meterClass(o.load_index)}" role="img" aria-label="${esc(t('wl.col_load'))}: ${esc(o.load_index.toFixed(2))}"><span style="width:${Math.min(100, Math.round((o.load_index / 2) * 100))}%"></span></div><b>${esc(o.load_index.toFixed(2))}×</b></div>`,
      },
    ],
    rows,
    empty: { icon: 'users', title: t('wl.no_officers') },
  });
  $('#note').textContent = t('wl.note');
}

function updateApply() {
  const n = picked.size;
  applyBtn.disabled = n === 0;
  applyBtn.innerHTML = `${icon('check-circle', 16)} ${esc(t('wl.apply', { n }))}`;
  const all = data && data.suggestions.length && picked.size === data.suggestions.length;
  selectAllBtn.innerHTML = esc(all ? t('wl.select_none') : t('wl.select_all'));
  selectAllBtn.disabled = !data || !data.suggestions.length;
}

function renderSuggestions() {
  const box = $('#suggestions');
  if (!data.suggestions.length) {
    emptyState(box, { icon: 'check-circle', title: t('wl.balanced'), text: t('wl.balanced_text') });
    updateApply();
    return;
  }
  mount(box, el('div', { class: 'list-divided' }, data.suggestions.map((m, i) => {
    const id = `mv-${i}`;
    const cb = el('input', { type: 'checkbox', id, checked: picked.has(key(m)) || null, 'aria-label': t('wl.move_pick', { ref: m.application.ref_no }) });
    cb.addEventListener('change', () => { if (cb.checked) picked.add(key(m)); else picked.delete(key(m)); updateApply(); });
    return el('div', { class: 'wl-move' }, cb,
      el('label', { class: 'li-main', for: id },
        el('div', { class: 'li-title', html: `<a href="${esc(site(`staff/application.html?id=${m.application.id}`))}">${esc(m.application.ref_no)}</a> · ${esc(m.application.institution)} ${daysChip(m.application.days_left)}` }),
        el('div', { class: 'wl-arrow', html: `<span>${esc(m.from.name)}</span> ${icon('arrow-right', 16)} <span>${esc(m.to.name)}</span> <span class="badge b-slate">${esc(m.region)}</span>` }),
        el('div', { class: 'li-sub' }, pick(m.reason.en, m.reason.hi))));
  })));
  updateApply();
}

function render() {
  if (!data) return;
  renderKpis();
  renderOfficers();
  renderSuggestions();
}

selectAllBtn.addEventListener('click', () => {
  if (!data) return;
  const all = picked.size === data.suggestions.length;
  picked.clear();
  if (!all) data.suggestions.forEach((m) => picked.add(key(m)));
  renderSuggestions();
});

applyBtn.addEventListener('click', async () => {
  const moves = data.suggestions.filter((m) => picked.has(key(m)));
  if (!moves.length) return;
  const reason = await askText({
    title: t('wl.apply_title', { n: moves.length }), intro: t('wl.apply_intro'), label: t('wl.reason_label'), hint: t('wl.reason_hint'),
    value: t('wl.default_reason'), confirmLabel: t('common.confirm'), minLen: 5,
  });
  if (reason === null) return;
  await withBusy(applyBtn, async () => {
    try {
      const res = await api.post('/workload/apply', { moves: moves.map((m) => ({ application_id: m.application.id, to_user_id: m.to.id })), reason });
      picked.clear();
      toast(t('wl.applied', { n: res.moved.length }), 'success');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
});

async function load() {
  loading($('#officers'));
  try {
    data = await api.get('/workload', { region: SHOW_REGION ? f.region || undefined : undefined });
    render();
  } catch (err) {
    errorState($('#officers'), err, load);
  }
}

onLang(() => { buildFilters(); render(); });
buildFilters();
load();
