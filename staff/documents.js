// Document validity monitor: prescribed documents per institution, expiry status, renewals awaiting verification.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, mount, loading, errorState, renderTable, pagination, modal, toast, withBusy, dl,
  fmtDate, fmtDateTime, daysChip, validityBadge, verifyBadge, getParam, setParams, debounce, icon,
} from '../assets/js/ui.js';
import {
  isHQ, regionOptions, regionName, field, selectEl, inputEl, checkEl, fileLink, instCell, askNote, docStatusLabel, docTypeLabel,
} from './c-common.js';

extend({
  en: {
    'docm.title': 'Document validity',
    'docm.subtitle': 'Prescribed documents of every institution: what is valid, expiring or expired, and renewals waiting for verification',
    'docm.q': 'Search',
    'docm.q_ph': 'Institution, permanent ID or title',
    'docm.all_types': 'All documents',
    'docm.any_validity': 'Any validity',
    'docm.v_renewal': 'Renewal awaiting check',
    'docm.verify_only': 'Verification pending only',
    'docm.chip_all': 'All',
    'docm.chip_valid': 'Valid',
    'docm.chip_expiring': 'Expiring soon',
    'docm.chip_expired': 'Expired',
    'docm.chip_noexp': 'No expiry',
    'docm.chip_renewal': 'Renewal awaiting check',
    'docm.chip_verify': 'Needs verification',
    'docm.col_doc': 'Document',
    'docm.col_renewal': 'Renewal',
    'docm.empty': 'No documents match these filters',
    'docm.modal_title': 'Document: {type}',
    'docm.title_f': 'Title',
    'docm.uploaded': 'Uploaded',
    'docm.replaces': 'Replaces copy',
    'docm.verified_by': 'Checked by',
    'docm.verified_on': 'Checked on',
    'docm.officer_note': 'Officer note',
    'docm.file': 'File',
    'docm.versions': 'All versions of this document',
    'docm.this': 'Shown above',
    'docm.accept': 'Accept document',
    'docm.reject': 'Reject document',
    'docm.accept_title': 'Accept the document',
    'docm.accept_label': 'Note for the record (optional)',
    'docm.accept_hint_renewal': 'The renewed copy becomes the current one and the earlier copy is marked as replaced.',
    'docm.accept_hint': 'The document is marked as verified.',
    'docm.reject_title': 'Reject the document',
    'docm.reject_label': 'Why is the document not acceptable?',
    'docm.reject_hint': 'The institution will see this reason and must upload a corrected copy.',
    'docm.done_accept': 'Document accepted.',
    'docm.done_reject': 'Document rejected; the institution has been told why.',
    'docm.verify_wait': 'This copy is waiting for verification.',
    'docm.open_inst': 'Institution profile',
  },
  hi: {
    'docm.title': 'दस्तावेज़ वैधता',
    'docm.subtitle': 'प्रत्येक संस्था के निर्धारित दस्तावेज़: कौन-से वैध, शीघ्र समाप्त होने वाले या समाप्त हैं, और सत्यापन की प्रतीक्षा में नवीनीकरण',
    'docm.q': 'खोजें',
    'docm.q_ph': 'संस्था, स्थायी आईडी या शीर्षक',
    'docm.all_types': 'सभी दस्तावेज़',
    'docm.any_validity': 'कोई भी वैधता',
    'docm.v_renewal': 'नवीनीकरण जाँच हेतु प्रतीक्षित',
    'docm.verify_only': 'केवल सत्यापन लंबित',
    'docm.chip_all': 'सभी',
    'docm.chip_valid': 'वैध',
    'docm.chip_expiring': 'शीघ्र समाप्त',
    'docm.chip_expired': 'समाप्त',
    'docm.chip_noexp': 'कोई समाप्ति नहीं',
    'docm.chip_renewal': 'नवीनीकरण जाँच हेतु प्रतीक्षित',
    'docm.chip_verify': 'सत्यापन आवश्यक',
    'docm.col_doc': 'दस्तावेज़',
    'docm.col_renewal': 'नवीनीकरण',
    'docm.empty': 'इन फ़िल्टरों से कोई दस्तावेज़ नहीं मिला',
    'docm.modal_title': 'दस्तावेज़: {type}',
    'docm.title_f': 'शीर्षक',
    'docm.uploaded': 'अपलोड',
    'docm.replaces': 'जिस प्रति को बदलता है',
    'docm.verified_by': 'जाँचकर्ता',
    'docm.verified_on': 'जाँच की तिथि',
    'docm.officer_note': 'अधिकारी की टिप्पणी',
    'docm.file': 'फ़ाइल',
    'docm.versions': 'इस दस्तावेज़ के सभी संस्करण',
    'docm.this': 'ऊपर दिखाया गया',
    'docm.accept': 'दस्तावेज़ स्वीकार करें',
    'docm.reject': 'दस्तावेज़ अस्वीकार करें',
    'docm.accept_title': 'दस्तावेज़ स्वीकार करें',
    'docm.accept_label': 'रिकॉर्ड के लिए टिप्पणी (वैकल्पिक)',
    'docm.accept_hint_renewal': 'नवीनीकृत प्रति वर्तमान प्रति बन जाएगी और पहले वाली प्रति "प्रतिस्थापित" चिह्नित होगी।',
    'docm.accept_hint': 'दस्तावेज़ सत्यापित चिह्नित किया जाएगा।',
    'docm.reject_title': 'दस्तावेज़ अस्वीकार करें',
    'docm.reject_label': 'दस्तावेज़ स्वीकार्य क्यों नहीं है?',
    'docm.reject_hint': 'संस्था को यह कारण दिखेगा और उसे सुधारी हुई प्रति अपलोड करनी होगी।',
    'docm.done_accept': 'दस्तावेज़ स्वीकार किया गया।',
    'docm.done_reject': 'दस्तावेज़ अस्वीकृत; संस्था को कारण बता दिया गया है।',
    'docm.verify_wait': 'यह प्रति सत्यापन की प्रतीक्षा में है।',
    'docm.open_inst': 'संस्था प्रोफ़ाइल',
  },
});

const { user, meta } = await initPage({
  roles: ['ro', 'rd', 'bureau', 'committee', 'authority'],
  active: 'documents',
  title: 'docm.title',
  subtitle: 'docm.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.documents' }],
});

const HQ = isHQ(user);
const canVerify = ['ro', 'rd'].includes(user.role);
const PAGE_SIZE = 25;
const PRESCRIBED = Object.keys(meta?.doc_types || {}).filter((k) => !['EVIDENCE', 'RESPONSE'].includes(k));
const f = {
  q: getParam('q') || '',
  doc_type: getParam('doc_type') || '',
  validity: getParam('validity') || '',
  pending: getParam('verification') === 'PENDING',
  region: HQ ? (getParam('region') || '') : '',
  page: Number(getParam('page')) || 1,
};
let last = null;

function syncUrl() {
  setParams({
    q: f.q, doc_type: f.doc_type, validity: f.validity, verification: f.pending ? 'PENDING' : null,
    region: f.region, page: f.page > 1 ? String(f.page) : null,
  });
}

const reload = debounce(() => { f.page = 1; load(); }, 300);

function renderFilters() {
  const typeOpts = [['', t('docm.all_types')], ...PRESCRIBED.map((k) => [k, docTypeLabel(meta, k)])];
  const valOpts = [['', t('docm.any_validity')], ['VALID', t('validity.VALID')], ['EXPIRING', t('validity.EXPIRING')],
    ['EXPIRED', t('validity.EXPIRED')], ['NO_EXPIRY', t('validity.NO_EXPIRY')], ['RENEWAL_PENDING', t('docm.v_renewal')]];
  mount($('#filters'),
    field('f-q', t('docm.q'), el('div', { class: 'input-icon' }, el('span', { class: 'icon', html: icon('search', 16) }),
      inputEl('f-q', { type: 'search', value: f.q, placeholder: t('docm.q_ph'), onInput: (v) => { f.q = v; reload(); } }))),
    field('f-type', t('f.doc_type'), selectEl('f-type', typeOpts, f.doc_type, (v) => { f.doc_type = v; f.page = 1; load(); })),
    field('f-validity', t('f.validity'), selectEl('f-validity', valOpts, f.validity, (v) => { f.validity = v; f.page = 1; load(); })),
    HQ ? field('f-region', t('f.region'), selectEl('f-region', [['', t('cc.all_regions')], ...regionOptions(meta)], f.region, (v) => { f.region = v; f.page = 1; load(); })) : null,
    el('div', { class: 'field' }, el('span', { class: 'label', 'aria-hidden': 'true', html: '&nbsp;' }),
      checkEl('f-pending', t('docm.verify_only'), f.pending, (v) => { f.pending = v; f.page = 1; load(); })));
}

function renderChips() {
  const c = last?.counts || {};
  const total = (c.VALID || 0) + (c.EXPIRING || 0) + (c.EXPIRED || 0) + (c.NO_EXPIRY || 0);
  const defs = [
    ['all', t('docm.chip_all'), total, !f.validity && !f.pending, () => { f.validity = ''; f.pending = false; }],
    ['VALID', t('docm.chip_valid'), c.VALID || 0, f.validity === 'VALID' && !f.pending, () => { f.validity = 'VALID'; f.pending = false; }],
    ['EXPIRING', t('docm.chip_expiring'), c.EXPIRING || 0, f.validity === 'EXPIRING' && !f.pending, () => { f.validity = 'EXPIRING'; f.pending = false; }],
    ['EXPIRED', t('docm.chip_expired'), c.EXPIRED || 0, f.validity === 'EXPIRED' && !f.pending, () => { f.validity = 'EXPIRED'; f.pending = false; }],
    ['NO_EXPIRY', t('docm.chip_noexp'), c.NO_EXPIRY || 0, f.validity === 'NO_EXPIRY' && !f.pending, () => { f.validity = 'NO_EXPIRY'; f.pending = false; }],
    ['RENEWAL_PENDING', t('docm.chip_renewal'), c.RENEWAL_PENDING || 0, f.validity === 'RENEWAL_PENDING' && !f.pending, () => { f.validity = 'RENEWAL_PENDING'; f.pending = false; }],
    ['VERIFY', t('docm.chip_verify'), c.VERIFY_PENDING || 0, f.pending, () => { f.validity = ''; f.pending = true; }],
  ];
  mount($('#chips'), defs.map(([key, label, n, active, apply]) => el('button', {
    type: 'button', class: active ? 'active' : '', 'aria-pressed': active ? 'true' : 'false',
    onclick: () => { apply(); f.page = 1; renderFilters(); load(); },
  }, el('span', {}, label), el('b', {}, String(n)))));
}

function renderList() {
  if (!last) return;
  renderChips();
  renderTable($('#list'), {
    columns: [
      { key: 'institution', label: t('f.institution'), render: (d) => instCell(meta, d.institution) },
      { key: 'doc_type', label: t('docm.col_doc'), render: (d) => `<div class="cell-main">${esc(tl(d.doc_type_label))}</div><div class="cell-sub">${esc(d.title || '')}</div>` },
      { key: 'valid_until', label: t('f.valid_until'), render: (d) => (d.valid_until
        ? `<div style="white-space:nowrap">${esc(fmtDate(d.valid_until))}</div>${daysChip(d.days_left)}` : '—') },
      { key: 'validity', label: t('f.validity'), render: (d) => validityBadge(d.validity) },
      { key: 'verification', label: t('f.verification'), render: (d) => verifyBadge(d.verification) },
      { key: 'status', label: t('f.status'), render: (d) => esc(docStatusLabel(d.status)) },
      { key: 'renewal_pending', label: t('docm.col_renewal'), render: (d) => (d.renewal_pending ? `<span class="badge b-teal">${esc(t('cc.renewal_pending'))}</span>` : '—') },
    ],
    rows: last.items,
    onRowClick: (d) => openDetail(d.id),
    rowClass: (d) => (d.validity === 'EXPIRED' && d.status === 'CURRENT' ? 'row-danger' : d.verification === 'PENDING' ? 'row-warning' : ''),
    empty: { icon: 'file-check', title: t('docm.empty'), text: t('common.no_records_hint') },
  });
  pagination($('#pager'), { page: last.page, pageSize: last.page_size, total: last.total, onChange: (p) => { f.page = p; load(); } });
}

async function load() {
  syncUrl();
  loading($('#list'));
  mount($('#pager'));
  try {
    last = await api.get('/documents', {
      q: f.q || undefined, doc_type: f.doc_type || undefined, validity: f.validity || undefined,
      verification: f.pending ? 'PENDING' : undefined, region: f.region || undefined, page: f.page, page_size: PAGE_SIZE,
    });
    renderList();
  } catch (err) {
    errorState($('#list'), err, load);
  }
}

/* ---------------------------------------------------------------- detail modal */
function renderDetail(wrap, doc) {
  const pairs = [
    [t('f.institution'), `<a href="${esc(site(`staff/institution.html?id=${doc.institution.id}`))}">${esc(doc.institution.name)}</a><div class="cell-sub">${esc(doc.institution.pid)} · ${esc(regionName(meta, doc.institution.region))}</div>`],
    [t('f.doc_type'), esc(tl(doc.doc_type_label))],
    [t('docm.title_f'), esc(doc.title || '—')],
    [t('f.status'), esc(docStatusLabel(doc.status))],
    [t('f.valid_from'), esc(fmtDate(doc.valid_from))],
    [t('f.valid_until'), doc.valid_until ? `${esc(fmtDate(doc.valid_until))} ${daysChip(doc.days_left)}` : '—'],
    [t('f.validity'), validityBadge(doc.validity)],
    [t('f.verification'), verifyBadge(doc.verification)],
    [t('docm.uploaded'), esc(fmtDateTime(doc.uploaded_at))],
    doc.replaces_id ? [t('docm.replaces'), `#${esc(doc.replaces_id)}`] : null,
    doc.verified_by ? [t('docm.verified_by'), esc(doc.verified_by.name)] : null,
    doc.verified_at ? [t('docm.verified_on'), esc(fmtDateTime(doc.verified_at))] : null,
    [t('docm.file'), fileLink(doc.file)],
  ];
  const nodes = [dl(pairs, { cols: 2 })];
  if (doc.verify_note) {
    nodes.push(el('div', { class: 'alert warning mt-2' }, el('span', { class: 'icon', html: icon('alert', 18) }),
      el('div', {}, el('div', { class: 'a-title' }, t('docm.officer_note')), doc.verify_note)));
  }
  if (canVerify && doc.verification === 'PENDING') {
    nodes.push(el('div', { class: 'alert info mt-2' }, el('span', { class: 'icon', html: icon('info', 18) }), el('div', {}, t('docm.verify_wait'))));
  }
  const verBox = el('div');
  nodes.push(el('h4', {}, t('docm.versions')), verBox);
  if (canVerify && doc.verification === 'PENDING') {
    nodes.push(el('div', { class: 'doc-actions' },
      el('button', { class: 'btn success', type: 'button', html: `${icon('check', 16)} ${esc(t('docm.accept'))}`, onclick: (e) => verify(e.currentTarget, doc, 'ACCEPT', wrap) }),
      el('button', { class: 'btn outline-danger', type: 'button', html: `${icon('x', 16)} ${esc(t('docm.reject'))}`, onclick: (e) => verify(e.currentTarget, doc, 'REJECT', wrap) })));
  }
  mount(wrap, el('div', { class: 'doc-detail' }, nodes));
  renderTable(verBox, {
    columns: [
      { key: 'file', label: t('docm.file'), render: (v) => fileLink(v.file) },
      { key: 'uploaded_at', label: t('docm.uploaded'), render: (v) => esc(fmtDateTime(v.uploaded_at)) },
      { key: 'valid_until', label: t('f.valid_until'), render: (v) => (v.valid_until ? `${esc(fmtDate(v.valid_from))} → ${esc(fmtDate(v.valid_until))}` : '—') },
      { key: 'validity', label: t('f.validity'), render: (v) => (v.status === 'CURRENT' || v.status === 'RENEWAL' ? validityBadge(v.validity) : '—') },
      { key: 'verification', label: t('f.verification'), render: (v) => `${verifyBadge(v.verification)}${v.verify_note ? `<div class="cell-sub">${esc(v.verify_note)}</div>` : ''}` },
      { key: 'status', label: t('f.status'), render: (v) => `${esc(docStatusLabel(v.status))}${v.id === doc.id ? `<div class="cell-sub">${esc(t('docm.this'))}</div>` : ''}` },
    ],
    rows: doc.versions || [doc],
    rowClass: (v) => (v.id === doc.id ? 'this-version' : ''),
    compact: true,
  });
}

let detailModal = null;
async function openDetail(id) {
  setParams({ id: String(id) });
  const wrap = el('div', {}, el('div', { class: 'loading' }, el('span', { class: 'spinner' }), t('common.loading')));
  detailModal?.close?.();
  detailModal = modal({ title: t('common.details'), body: wrap, size: 'xwide', onClose: () => { setParams({ id: null }); detailModal = null; } });
  try {
    const doc = await api.get(`/documents/${id}`);
    detailModal.root.querySelector('h3').textContent = t('docm.modal_title', { type: tl(doc.doc_type_label) });
    renderDetail(wrap, doc);
  } catch (err) {
    errorState(wrap, err, () => openDetail(id));
  }
}

async function verify(btn, doc, decision, wrap) {
  const accept = decision === 'ACCEPT';
  const note = await askNote({
    title: t(accept ? 'docm.accept_title' : 'docm.reject_title'),
    label: t(accept ? 'docm.accept_label' : 'docm.reject_label'),
    hint: accept ? t(doc.status === 'RENEWAL' ? 'docm.accept_hint_renewal' : 'docm.accept_hint') : t('docm.reject_hint'),
    required: !accept,
    confirmLabel: t(accept ? 'docm.accept' : 'docm.reject'),
    variant: accept ? 'success' : 'danger',
  });
  if (note === null) return;
  try {
    const out = await withBusy(btn, () => api.post(`/documents/${doc.id}/verify`, { decision, note }));
    toast(t(accept ? 'docm.done_accept' : 'docm.done_reject'), 'success');
    renderDetail(wrap, out);
    load();
  } catch (e) {
    toast(e.message, 'error');
  }
}

renderFilters();
onLang(() => { renderFilters(); renderList(); });
await load();
const openId = getParam('id');
if (openId) openDetail(Number(openId));
