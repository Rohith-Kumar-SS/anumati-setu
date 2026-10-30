// Undertaking register: filter, inspect evidence, verify (RO/RD) and extend (RD/Authority).
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, mount, loading, errorState, renderTable, pagination, modal, toast, withBusy, dl, timeline,
  fmtDate, fmtDateTime, daysChip, utBadge, escBadge, verifyBadge, getParam, setParams, debounce, icon,
} from '../assets/js/ui.js';
import {
  isHQ, regionOptions, regionName, field, selectEl, inputEl, checkEl, fileLink, instCell, actionLabel, askNote,
} from './c-common.js';

extend({
  en: {
    'utr.title': 'Undertaking register',
    'utr.subtitle': 'Time-bound conditions attached to approvals: who owes what, by when, and what has been verified',
    'utr.q': 'Search',
    'utr.q_ph': 'Reference, condition or institution',
    'utr.status': 'Status',
    'utr.st_all': 'All statuses',
    'utr.st_pending': 'Awaiting evidence (incl. overdue)',
    'utr.st_submitted': 'Evidence submitted',
    'utr.st_verified': 'Fulfilled',
    'utr.overdue_only': 'Overdue only',
    'utr.all_categories': 'All categories',
    'utr.chip_all': 'All',
    'utr.chip_overdue': 'Overdue',
    'utr.chip_pending': 'Awaiting evidence',
    'utr.chip_submitted': 'Evidence submitted',
    'utr.chip_verified': 'Fulfilled',
    'utr.col_rej': 'Evidence rejected',
    'utr.col_app': 'Application',
    'utr.empty': 'No undertakings match these filters',
    'utr.modal_title': 'Undertaking {ref}',
    'utr.original_due': 'Original due date',
    'utr.created': 'Recorded',
    'utr.submitted': 'Evidence submitted on',
    'utr.verified': 'Verified on',
    'utr.verified_by': 'Verified by',
    'utr.officer_note': 'Officer note',
    'utr.extensions': 'Extensions of the due date',
    'utr.ext_line': 'From {from} to {to}',
    'utr.evidence': 'Evidence',
    'utr.no_evidence': 'No evidence has been uploaded yet.',
    'utr.col_file': 'File',
    'utr.col_uploaded': 'Uploaded',
    'utr.col_verification': 'Verification',
    'utr.col_by': 'Checked by',
    'utr.history': 'History',
    'utr.accept': 'Accept evidence',
    'utr.reject': 'Reject evidence',
    'utr.extend': 'Extend due date',
    'utr.accept_title': 'Accept the evidence',
    'utr.accept_label': 'Note for the record (optional)',
    'utr.accept_hint': 'The undertaking will be marked as fulfilled and escalations will close.',
    'utr.reject_title': 'Reject the evidence',
    'utr.reject_label': 'Why is the evidence not acceptable?',
    'utr.reject_hint': 'The institution will see this reason and can upload new evidence. The undertaking goes back to "awaiting evidence".',
    'utr.extend_title': 'Extend the due date',
    'utr.new_due': 'New due date',
    'utr.new_due_hint': 'Must be after the current due date ({date}) and within one year of the original date.',
    'utr.ext_reason': 'Reason for the extension',
    'utr.ext_reason_hint': 'Recorded in the audit trail and sent to the institution.',
    'utr.ext_required': 'Choose a new date and write the reason (at least 5 characters).',
    'utr.done_accept': 'Evidence accepted: the undertaking is fulfilled.',
    'utr.done_reject': 'Evidence returned to the institution with your reason.',
    'utr.done_extend': 'Due date extended.',
    'utr.verify_wait': 'Evidence is waiting for verification.',
  },
  hi: {
    'utr.title': 'वचनबद्धता रजिस्टर',
    'utr.subtitle': 'अनुमोदनों से जुड़ी समयबद्ध शर्तें: किसे क्या, कब तक देना है और क्या सत्यापित हो चुका है',
    'utr.q': 'खोजें',
    'utr.q_ph': 'संदर्भ, शर्त या संस्था',
    'utr.status': 'स्थिति',
    'utr.st_all': 'सभी स्थितियाँ',
    'utr.st_pending': 'साक्ष्य प्रतीक्षित (अतिदेय सहित)',
    'utr.st_submitted': 'साक्ष्य प्रस्तुत',
    'utr.st_verified': 'पूर्ण',
    'utr.overdue_only': 'केवल अतिदेय',
    'utr.all_categories': 'सभी श्रेणियाँ',
    'utr.chip_all': 'सभी',
    'utr.chip_overdue': 'अतिदेय',
    'utr.chip_pending': 'साक्ष्य प्रतीक्षित',
    'utr.chip_submitted': 'साक्ष्य प्रस्तुत',
    'utr.chip_verified': 'पूर्ण',
    'utr.col_rej': 'साक्ष्य अस्वीकृत',
    'utr.col_app': 'आवेदन',
    'utr.empty': 'इन फ़िल्टरों से कोई वचनबद्धता नहीं मिली',
    'utr.modal_title': 'वचनबद्धता {ref}',
    'utr.original_due': 'मूल नियत तिथि',
    'utr.created': 'दर्ज की गई',
    'utr.submitted': 'साक्ष्य प्रस्तुत किया',
    'utr.verified': 'सत्यापन की तिथि',
    'utr.verified_by': 'सत्यापित करने वाले',
    'utr.officer_note': 'अधिकारी की टिप्पणी',
    'utr.extensions': 'नियत तिथि में विस्तार',
    'utr.ext_line': '{from} से {to} तक',
    'utr.evidence': 'साक्ष्य',
    'utr.no_evidence': 'अभी कोई साक्ष्य अपलोड नहीं हुआ है।',
    'utr.col_file': 'फ़ाइल',
    'utr.col_uploaded': 'अपलोड',
    'utr.col_verification': 'सत्यापन',
    'utr.col_by': 'जाँचकर्ता',
    'utr.history': 'इतिहास',
    'utr.accept': 'साक्ष्य स्वीकार करें',
    'utr.reject': 'साक्ष्य अस्वीकार करें',
    'utr.extend': 'नियत तिथि बढ़ाएँ',
    'utr.accept_title': 'साक्ष्य स्वीकार करें',
    'utr.accept_label': 'रिकॉर्ड के लिए टिप्पणी (वैकल्पिक)',
    'utr.accept_hint': 'वचनबद्धता पूर्ण मानी जाएगी और संबंधित वृद्धियाँ बंद हो जाएँगी।',
    'utr.reject_title': 'साक्ष्य अस्वीकार करें',
    'utr.reject_label': 'साक्ष्य स्वीकार्य क्यों नहीं है?',
    'utr.reject_hint': 'संस्था को यह कारण दिखेगा और वह नया साक्ष्य अपलोड कर सकेगी। वचनबद्धता फिर से "साक्ष्य प्रतीक्षित" हो जाएगी।',
    'utr.extend_title': 'नियत तिथि बढ़ाएँ',
    'utr.new_due': 'नई नियत तिथि',
    'utr.new_due_hint': 'वर्तमान नियत तिथि ({date}) के बाद की और मूल तिथि से एक वर्ष के भीतर की होनी चाहिए।',
    'utr.ext_reason': 'विस्तार का कारण',
    'utr.ext_reason_hint': 'ऑडिट ट्रेल में दर्ज होगा और संस्था को भेजा जाएगा।',
    'utr.ext_required': 'नई तिथि चुनें और कारण लिखें (कम से कम 5 अक्षर)।',
    'utr.done_accept': 'साक्ष्य स्वीकार: वचनबद्धता पूर्ण।',
    'utr.done_reject': 'आपके कारण सहित साक्ष्य संस्था को लौटा दिया गया।',
    'utr.done_extend': 'नियत तिथि बढ़ा दी गई।',
    'utr.verify_wait': 'साक्ष्य सत्यापन की प्रतीक्षा में है।',
  },
});

const { user, meta } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'committee', 'authority'],
  active: 'undertakings',
  title: 'utr.title',
  subtitle: 'utr.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.undertakings' }],
});

const HQ = isHQ(user);
const canVerify = ['ro', 'rd'].includes(user.role);
const canExtend = ['rd', 'authority'].includes(user.role);
const PAGE_SIZE = 25;
const f = {
  q: getParam('q') || '',
  status: getParam('status') || '',
  category: getParam('category') || '',
  region: HQ ? (getParam('region') || '') : '',
  overdue: getParam('overdue') === '1',
  page: Number(getParam('page')) || 1,
};
let last = null;

function syncUrl() {
  setParams({
    q: f.q, status: f.status, category: f.category, region: f.region,
    overdue: f.overdue ? '1' : null, page: f.page > 1 ? String(f.page) : null,
  });
}

/* ---------------------------------------------------------------- filters */
const reload = debounce(() => { f.page = 1; load(); }, 300);

function renderFilters() {
  const statusOpts = [['', t('utr.st_all')], ['PENDING', t('utr.st_pending')], ['SUBMITTED', t('utr.st_submitted')], ['VERIFIED', t('utr.st_verified')]];
  const catOpts = [['', t('utr.all_categories')], ...Object.entries(meta?.ut_categories || {}).map(([k, v]) => [k, tl(v)])];
  mount($('#filters'),
    field('f-q', t('utr.q'), el('div', { class: 'input-icon' }, el('span', { class: 'icon', html: icon('search', 16) }),
      inputEl('f-q', { type: 'search', value: f.q, placeholder: t('utr.q_ph'), onInput: (v) => { f.q = v; reload(); } }))),
    field('f-status', t('utr.status'), selectEl('f-status', statusOpts, f.status, (v) => { f.status = v; f.overdue = false; f.page = 1; load(); })),
    field('f-cat', t('f.category'), selectEl('f-cat', catOpts, f.category, (v) => { f.category = v; f.page = 1; load(); })),
    HQ ? field('f-region', t('f.region'), selectEl('f-region', [['', t('cc.all_regions')], ...regionOptions(meta)], f.region, (v) => { f.region = v; f.page = 1; load(); })) : null,
    el('div', { class: 'field' }, el('span', { class: 'label', 'aria-hidden': 'true', html: '&nbsp;' }),
      checkEl('f-overdue', t('utr.overdue_only'), f.overdue, (v) => { f.overdue = v; if (v) f.status = ''; f.page = 1; load(); })));
}

function renderChips() {
  const c = last?.counts || {};
  const total = (c.OVERDUE || 0) + (c.PENDING || 0) + (c.SUBMITTED || 0) + (c.VERIFIED || 0);
  const defs = [
    ['all', t('utr.chip_all'), total, !f.status && !f.overdue, () => { f.status = ''; f.overdue = false; }],
    ['overdue', t('utr.chip_overdue'), c.OVERDUE || 0, f.overdue, () => { f.status = ''; f.overdue = true; }],
    ['pending', t('utr.chip_pending'), (c.PENDING || 0) + (c.OVERDUE || 0), f.status === 'PENDING' && !f.overdue, () => { f.status = 'PENDING'; f.overdue = false; }],
    ['submitted', t('utr.chip_submitted'), c.SUBMITTED || 0, f.status === 'SUBMITTED' && !f.overdue, () => { f.status = 'SUBMITTED'; f.overdue = false; }],
    ['verified', t('utr.chip_verified'), c.VERIFIED || 0, f.status === 'VERIFIED' && !f.overdue, () => { f.status = 'VERIFIED'; f.overdue = false; }],
  ];
  mount($('#chips'), defs.map(([key, label, n, active, apply]) => el('button', {
    type: 'button', class: active ? 'active' : '', 'aria-pressed': active ? 'true' : 'false',
    onclick: () => { apply(); f.page = 1; renderFilters(); load(); },
  }, el('span', {}, label), el('b', {}, String(n)))));
}

/* ---------------------------------------------------------------- list */
function renderList() {
  if (!last) return;
  renderChips();
  renderTable($('#list'), {
    columns: [
      { key: 'ref_no', label: t('f.ref_no'), render: (u) => `<span class="mono" style="white-space:nowrap">${esc(u.ref_no)}</span>` },
      { key: 'institution', label: t('f.institution'), render: (u) => instCell(meta, u.institution) },
      { key: 'condition', label: t('f.condition'), render: (u) => `<div class="cond">${esc(u.condition)}</div>${u.application ? `<div class="cell-sub">${esc(t('utr.col_app'))}: ${esc(u.application.ref_no)}</div>` : ''}` },
      { key: 'category', label: t('f.category'), render: (u) => esc(tl(u.category_label)) },
      { key: 'due_date', label: t('f.due'), render: (u) => `<div style="white-space:nowrap">${esc(fmtDate(u.due_date))}</div>${u.status === 'PENDING' ? daysChip(u.days_left) : ''}` },
      { key: 'status', label: t('f.status'), render: (u) => utBadge(u.status, u.overdue) },
      { key: 'escalation_level', label: t('f.escalation'), render: (u) => (u.status === 'VERIFIED' ? '—' : escBadge(u.escalation_level)) },
      { key: 'rejections', label: t('utr.col_rej'), align: 'center', render: (u) => (u.rejections ? `<span class="badge b-warning">${esc(t('cc.rejected_n', { n: u.rejections }))}</span>` : '—') },
    ],
    rows: last.items,
    onRowClick: (u) => openDetail(u.id),
    rowClass: (u) => (u.overdue ? 'row-danger' : ''),
    empty: { icon: 'file-check', title: t('utr.empty'), text: t('common.no_records_hint') },
  });
  pagination($('#pager'), { page: last.page, pageSize: last.page_size, total: last.total, onChange: (p) => { f.page = p; load(); } });
}

async function load() {
  syncUrl();
  loading($('#list'));
  mount($('#pager'));
  try {
    last = await api.get('/undertakings', {
      q: f.q || undefined, status: f.status || undefined, category: f.category || undefined,
      region: f.region || undefined, overdue: f.overdue ? 1 : undefined, page: f.page, page_size: PAGE_SIZE,
    });
    renderList();
  } catch (err) {
    errorState($('#list'), err, load);
  }
}

/* ---------------------------------------------------------------- detail modal */
const HIST_TONE = { UNDERTAKING_VERIFIED: 'success', EVIDENCE_REJECTED: 'danger', UNDERTAKING_EXTENDED: 'warning', ESCALATED: 'danger' };

function renderDetail(wrap, ut) {
  const pairs = [
    [t('f.ref_no'), `<span class="mono">${esc(ut.ref_no)}</span>`],
    [t('f.institution'), `<a href="${esc(site(`staff/institution.html?id=${ut.institution.id}`))}">${esc(ut.institution.name)}</a><div class="cell-sub">${esc(ut.institution.pid)} · ${esc(regionName(meta, ut.institution.region))}</div>`],
    [t('utr.col_app'), ut.application ? `<a href="${esc(site(`staff/application.html?id=${ut.application.id}`))}" class="mono">${esc(ut.application.ref_no)}</a>` : '—'],
    [t('f.category'), esc(tl(ut.category_label))],
    [t('f.status'), utBadge(ut.status, ut.overdue)],
    [t('f.due'), `${esc(fmtDate(ut.due_date))} ${ut.status === 'PENDING' ? daysChip(ut.days_left) : ''}`],
    ut.original_due && ut.original_due !== ut.due_date ? [t('utr.original_due'), esc(fmtDate(ut.original_due))] : null,
    [t('f.escalation'), ut.status === 'VERIFIED' ? '—' : escBadge(ut.escalation_level)],
    [t('utr.created'), esc(fmtDateTime(ut.created_at))],
    ut.submitted_at ? [t('utr.submitted'), esc(fmtDateTime(ut.submitted_at))] : null,
    ut.verified_at ? [t('utr.verified'), esc(fmtDateTime(ut.verified_at))] : null,
    ut.verified_by ? [t('utr.verified_by'), esc(ut.verified_by.name || ut.verified_by)] : null,
    ut.rejections ? [t('utr.col_rej'), `<span class="badge b-warning">${esc(t('cc.rejected_n', { n: ut.rejections }))}</span>`] : null,
  ];
  const evBox = el('div');
  const histBox = el('div');
  const nodes = [
    el('div', { class: 'alert info', style: { marginBottom: '12px' } }, el('span', { class: 'icon', html: icon('file-check', 18) }), el('div', {}, ut.condition)),
    dl(pairs, { cols: 2 }),
    ut.verify_note ? el('div', { class: 'alert warning mt-2' }, el('span', { class: 'icon', html: icon('alert', 18) }),
      el('div', {}, el('div', { class: 'a-title' }, t('utr.officer_note')), ut.verify_note)) : null,
  ];
  if ((ut.extensions || []).length) {
    nodes.push(el('h4', {}, t('utr.extensions')),
      el('ul', { class: 'list-plain' }, ut.extensions.map((x) => el('li', { class: 'mb-0', style: { marginBottom: '6px' } },
        el('strong', {}, t('utr.ext_line', { from: fmtDate(x.from), to: fmtDate(x.to) })),
        el('div', { class: 'text-2 small' }, `${x.reason || ''}${x.by ? ` — ${x.by}` : ''}${x.at ? `, ${fmtDateTime(x.at)}` : ''}`)))));
  }
  nodes.push(el('h4', {}, t('utr.evidence')), evBox, el('h4', {}, t('utr.history')), histBox);

  // actions
  const actions = [];
  if (canVerify && ut.status === 'SUBMITTED') {
    actions.push(el('button', { class: 'btn success', type: 'button', html: `${icon('check', 16)} ${esc(t('utr.accept'))}`, onclick: (e) => verify(e.currentTarget, ut, 'ACCEPT', wrap) }));
    actions.push(el('button', { class: 'btn outline-danger', type: 'button', html: `${icon('x', 16)} ${esc(t('utr.reject'))}`, onclick: (e) => verify(e.currentTarget, ut, 'REJECT', wrap) }));
  }
  if (canExtend && ut.status !== 'VERIFIED') {
    actions.push(el('button', { class: 'btn secondary', type: 'button', html: `${icon('calendar', 16)} ${esc(t('utr.extend'))}`, onclick: () => extendDialog(ut, wrap) }));
  }
  if (actions.length) nodes.push(el('div', { class: 'ut-actions' }, actions));
  mount(wrap, el('div', { class: 'ut-detail' }, nodes));

  renderTable(evBox, {
    columns: [
      { key: 'file', label: t('utr.col_file'), render: (d) => fileLink(d.file) },
      { key: 'uploaded_at', label: t('utr.col_uploaded'), render: (d) => esc(fmtDateTime(d.uploaded_at)) },
      { key: 'verification', label: t('utr.col_verification'), render: (d) => verifyBadge(d.verification) },
      { key: 'verified_by', label: t('utr.col_by'), render: (d) => (d.verified_by ? `<div>${esc(d.verified_by.name)}</div><div class="cell-sub">${esc(d.verify_note || '')}</div>` : '—') },
    ],
    rows: ut.evidence || [],
    empty: { icon: 'inbox', title: t('utr.no_evidence') },
    compact: true,
  });
  timeline(histBox, (ut.history || []).map((h) => ({
    title: actionLabel(h.action),
    meta: `${h.actor_name || t('common.system')} · ${fmtDateTime(h.at)}`,
    body: h.summary,
    tone: HIST_TONE[h.action] || '',
  })));
}

let detailModal = null;
async function openDetail(id) {
  setParams({ id: String(id) });
  const wrap = el('div', {}, el('div', { class: 'loading' }, el('span', { class: 'spinner' }), t('common.loading')));
  detailModal?.close?.();
  detailModal = modal({ title: t('utr.modal_title', { ref: '' }).trim(), body: wrap, size: 'xwide', onClose: () => { setParams({ id: null }); detailModal = null; } });
  try {
    const ut = await api.get(`/undertakings/${id}`);
    detailModal.root.querySelector('h3').textContent = t('utr.modal_title', { ref: ut.ref_no });
    renderDetail(wrap, ut);
  } catch (err) {
    errorState(wrap, err, () => openDetail(id));
  }
}

async function verify(btn, ut, decision, wrap) {
  const accept = decision === 'ACCEPT';
  const note = await askNote({
    title: t(accept ? 'utr.accept_title' : 'utr.reject_title'),
    label: t(accept ? 'utr.accept_label' : 'utr.reject_label'),
    hint: t(accept ? 'utr.accept_hint' : 'utr.reject_hint'),
    required: !accept,
    confirmLabel: t(accept ? 'utr.accept' : 'utr.reject'),
    variant: accept ? 'success' : 'danger',
  });
  if (note === null) return;
  try {
    const out = await withBusy(btn, () => api.post(`/undertakings/${ut.id}/verify`, { decision, note }));
    toast(t(accept ? 'utr.done_accept' : 'utr.done_reject'), 'success');
    renderDetail(wrap, out);
    load();
  } catch (e) {
    toast(e.message, 'error');
  }
}

function extendDialog(ut, wrap) {
  const next = new Date(`${ut.due_date}T00:00:00`);
  next.setDate(next.getDate() + 1);
  const min = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
  const date = inputEl('x-date', { type: 'date', attrs: { min } });
  const reason = el('textarea', { class: 'textarea', id: 'x-reason', rows: 3 });
  const err = el('div', { class: 'error', style: { fontSize: '.85rem', color: 'var(--as-danger)', fontWeight: '500' }, hidden: true }, t('utr.ext_required'));
  modal({
    title: t('utr.extend_title'),
    body: el('div', { class: 'stack' },
      field('x-date', t('utr.new_due'), date, t('utr.new_due_hint', { date: fmtDate(ut.due_date) })),
      field('x-reason', t('utr.ext_reason'), reason, t('utr.ext_reason_hint')),
      err),
    actions: [
      { label: t('cc.cancel') },
      {
        label: t('utr.extend'), variant: 'primary',
        onClick: async () => {
          if (!date.value || reason.value.trim().length < 5) { err.hidden = false; return false; }
          const out = await api.post(`/undertakings/${ut.id}/extend`, { new_due_date: date.value, reason: reason.value.trim() });
          toast(t('utr.done_extend'), 'success');
          renderDetail(wrap, out);
          load();
          return true;
        },
      },
    ],
  });
}

renderFilters();
onLang(() => { renderFilters(); renderList(); });
await load();
const openId = getParam('id');
if (openId) openDetail(Number(openId));
