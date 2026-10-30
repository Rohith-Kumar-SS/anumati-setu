// Institution compliance: undertakings (upload evidence) and prescribed documents (upload renewal / missing document).
import { initPage } from '../assets/js/layout.js';
import { api, apiUrl, getToken, site } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import { $, el, esc, icon, mount, renderTable, tabs, modal, toast, fmtDate, fmtDateTime, fmtBytes, loading, emptyState, errorState,
  daysChip, utBadge, validityBadge, verifyBadge, setParams, getParam } from '../assets/js/ui.js';

extend({
  en: {
    'comp.title': 'Compliance',
    'comp.subtitle': 'Undertakings with due dates, and the documents prescribed for your institution',
    'comp.tab_ut': 'Undertakings',
    'comp.tab_doc': 'Documents',
    'comp.ut_empty': 'No undertakings',
    'comp.ut_empty_text': 'Conditions attached to an approval will appear here with their due dates.',
    'comp.app': 'Application',
    'comp.due': 'Due',
    'comp.orig_due': 'originally {date}',
    'comp.rejected': 'Your evidence was rejected {n} time(s). Officer\'s note: {note}',
    'comp.rejected_nonote': 'Your evidence was rejected {n} time(s).',
    'comp.submitted': 'Evidence submitted on {date}. An officer will verify it.',
    'comp.fulfilled': 'Fulfilled on {date}.',
    'comp.fulfilled_on_time': 'On time',
    'comp.fulfilled_late': 'Late',
    'comp.ext': 'Due date extended from {from} to {to} by {by}: {reason}',
    'comp.upload_ev': 'Upload evidence',
    'comp.ev_title': 'Evidence for {ref}',
    'comp.ev_note': 'Note for the officer',
    'comp.ev_note_hint': 'Say what the file shows. It is kept with the evidence.',
    'comp.ev_file': 'Evidence file',
    'comp.ev_file_hint': 'A file already rejected for this undertaking cannot be sent again.',
    'comp.ev_need_file': 'Please choose the evidence file.',
    'comp.ev_send': 'Upload',
    'comp.ev_sent': 'Evidence uploaded. An officer will verify it.',
    'comp.doc_note_missing': 'Not on record yet',
    'comp.doc_upload_missing': 'Upload a missing document',
    'comp.doc_empty': 'No documents on record',
    'comp.doc_empty_text': 'Upload the prescribed documents to start tracking their validity.',
    'comp.doc_col_doc': 'Document',
    'comp.doc_col_valid': 'Valid until',
    'comp.doc_col_validity': 'Validity',
    'comp.doc_col_verif': 'Verification',
    'comp.doc_col_file': 'File',
    'comp.doc_col_act': 'Action',
    'comp.no_expiry': 'No expiry',
    'comp.renewal_row': 'Renewal submitted',
    'comp.renewal_waiting': 'Renewal waiting for verification',
    'comp.renew': 'Upload renewal',
    'comp.renew_title': 'Upload renewal: {doc}',
    'comp.new_title': 'Upload a document',
    'comp.f_type': 'Document type',
    'comp.f_title': 'Title (optional)',
    'comp.f_from': 'Valid from',
    'comp.f_until': 'Valid until',
    'comp.f_until_req': 'Valid until (required for this type)',
    'comp.f_until_none': 'This type does not expire',
    'comp.f_file': 'Document file',
    'comp.f_from_hint': 'The date from which the document is valid.',
    'comp.f_until_hint': 'Must be after {date}, the date of the document now on record.',
    'comp.f_file_hint': 'A file identical to an earlier copy of this document is refused.',
    'comp.need_from': 'Please enter the valid-from date.',
    'comp.need_until': 'Please enter the valid-until date.',
    'comp.need_type': 'Please choose the document type.',
    'comp.need_file': 'Please choose the document file.',
    'comp.doc_sent': 'Document uploaded. An officer will verify it.',
    'comp.upload': 'Upload',
    'comp.c.RENEWAL_PENDING': 'Renewal pending',
    'comp.view_file': 'View file',
    'comp.choose': 'Choose…',
  },
  hi: {
    'comp.title': 'अनुपालन',
    'comp.subtitle': 'नियत तिथियों वाली वचनबद्धताएँ और आपकी संस्था के लिए निर्धारित दस्तावेज़',
    'comp.tab_ut': 'वचनबद्धताएँ',
    'comp.tab_doc': 'दस्तावेज़',
    'comp.ut_empty': 'कोई वचनबद्धता नहीं',
    'comp.ut_empty_text': 'अनुमोदन से जुड़ी शर्तें अपनी नियत तिथियों सहित यहाँ दिखेंगी।',
    'comp.app': 'आवेदन',
    'comp.due': 'नियत',
    'comp.orig_due': 'मूल तिथि {date}',
    'comp.rejected': 'आपका साक्ष्य {n} बार अस्वीकृत हुआ। अधिकारी की टिप्पणी: {note}',
    'comp.rejected_nonote': 'आपका साक्ष्य {n} बार अस्वीकृत हुआ।',
    'comp.submitted': '{date} को साक्ष्य प्रस्तुत किया गया। अधिकारी उसका सत्यापन करेंगे।',
    'comp.fulfilled': '{date} को पूर्ण हुई।',
    'comp.fulfilled_on_time': 'समय पर',
    'comp.fulfilled_late': 'विलंब से',
    'comp.ext': 'नियत तिथि {from} से बढ़ाकर {to} की गई ({by} द्वारा): {reason}',
    'comp.upload_ev': 'साक्ष्य अपलोड करें',
    'comp.ev_title': '{ref} का साक्ष्य',
    'comp.ev_note': 'अधिकारी के लिए टिप्पणी',
    'comp.ev_note_hint': 'बताएँ कि फ़ाइल क्या दर्शाती है। यह साक्ष्य के साथ सुरक्षित रहती है।',
    'comp.ev_file': 'साक्ष्य की फ़ाइल',
    'comp.ev_file_hint': 'इस वचनबद्धता के लिए पहले अस्वीकृत हो चुकी फ़ाइल दोबारा नहीं भेजी जा सकती।',
    'comp.ev_need_file': 'कृपया साक्ष्य की फ़ाइल चुनें।',
    'comp.ev_send': 'अपलोड करें',
    'comp.ev_sent': 'साक्ष्य अपलोड हो गया। अधिकारी उसका सत्यापन करेंगे।',
    'comp.doc_note_missing': 'अभी अभिलेख में नहीं',
    'comp.doc_upload_missing': 'छूटा हुआ दस्तावेज़ अपलोड करें',
    'comp.doc_empty': 'अभिलेख में कोई दस्तावेज़ नहीं',
    'comp.doc_empty_text': 'वैधता की निगरानी शुरू करने के लिए निर्धारित दस्तावेज़ अपलोड करें।',
    'comp.doc_col_doc': 'दस्तावेज़',
    'comp.doc_col_valid': 'वैध तिथि तक',
    'comp.doc_col_validity': 'वैधता',
    'comp.doc_col_verif': 'सत्यापन',
    'comp.doc_col_file': 'फ़ाइल',
    'comp.doc_col_act': 'कार्रवाई',
    'comp.no_expiry': 'कोई समाप्ति नहीं',
    'comp.renewal_row': 'नवीनीकरण प्रस्तुत',
    'comp.renewal_waiting': 'नवीनीकरण का सत्यापन लंबित',
    'comp.renew': 'नवीनीकरण अपलोड करें',
    'comp.renew_title': 'नवीनीकरण अपलोड करें: {doc}',
    'comp.new_title': 'दस्तावेज़ अपलोड करें',
    'comp.f_type': 'दस्तावेज़ का प्रकार',
    'comp.f_title': 'शीर्षक (वैकल्पिक)',
    'comp.f_from': 'वैध तिथि से',
    'comp.f_until': 'वैध तिथि तक',
    'comp.f_until_req': 'वैध तिथि तक (इस प्रकार के लिए अनिवार्य)',
    'comp.f_until_none': 'इस प्रकार की कोई समाप्ति नहीं होती',
    'comp.f_file': 'दस्तावेज़ की फ़ाइल',
    'comp.f_from_hint': 'वह तिथि जिससे दस्तावेज़ वैध है।',
    'comp.f_until_hint': '{date} के बाद की होनी चाहिए, जो अभिलेख में मौजूद दस्तावेज़ की तिथि है।',
    'comp.f_file_hint': 'इस दस्तावेज़ की पहले की प्रति जैसी ही फ़ाइल अस्वीकार कर दी जाती है।',
    'comp.need_from': 'कृपया वैध-तिथि-से दर्ज करें।',
    'comp.need_until': 'कृपया वैध-तिथि-तक दर्ज करें।',
    'comp.need_type': 'कृपया दस्तावेज़ का प्रकार चुनें।',
    'comp.need_file': 'कृपया दस्तावेज़ की फ़ाइल चुनें।',
    'comp.doc_sent': 'दस्तावेज़ अपलोड हो गया। अधिकारी उसका सत्यापन करेंगे।',
    'comp.upload': 'अपलोड करें',
    'comp.c.RENEWAL_PENDING': 'नवीनीकरण लंबित',
    'comp.view_file': 'फ़ाइल देखें',
    'comp.choose': 'चुनें…',
  },
});

const { meta } = await initPage({ roles: ['institution'], active: 'compliance', title: 'comp.title', subtitle: 'comp.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'institution/dashboard.html' }, { label: 'comp.title' }] });

// meta.doc_types also lists the internal types EVIDENCE and RESPONSE; only these six are prescribed documents.
const PRESCRIBED = ['LEASE', 'FIRE_NOC', 'STABILITY', 'AFFILIATION', 'LAND_USE', 'OCCUPANCY'];
const body = $('#comp-body');
const state = { uts: null, docs: null, error: null, tab: getParam('tab') === 'documents' ? 'documents' : 'undertakings' };
const fileUrl = (f) => apiUrl(`/files/${f.id}`, { token: getToken() });
const field = (labelText, input, hint, idFor, required) => el('div', { class: 'field' },
  el('label', { for: idFor }, labelText, required ? el('span', { class: 'req', 'aria-hidden': 'true' }, '*') : null), input, hint ? el('div', { class: 'hint' }, hint) : null);
const errBox = () => el('div', { role: 'alert', 'aria-live': 'assertive' });
const showErr = (box, msg) => mount(box, msg ? el('div', { class: 'alert danger' }, el('span', { class: 'icon', html: icon('alert-circle', 18) }), el('div', {}, msg)) : null);
const addDays = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); const dt = new Date(Date.UTC(y, m - 1, d + n)); return dt.toISOString().slice(0, 10); };

/* ------------------------------------------------------------------ undertakings */
function evidenceModal(u) {
  const note = el('textarea', { class: 'textarea', id: 'ev-note', rows: 4 });
  const file = el('input', { class: 'input', id: 'ev-file', type: 'file' });
  const err = errBox();
  modal({
    title: t('comp.ev_title', { ref: u.ref_no }),
    body: el('div', { class: 'stack' },
      el('p', { class: 'text-2 mb-0' }, u.condition),
      field(t('comp.ev_note'), note, t('comp.ev_note_hint'), 'ev-note'),
      field(t('comp.ev_file'), file, t('comp.ev_file_hint'), 'ev-file', true), err),
    actions: [
      { label: t('common.cancel'), variant: 'secondary' },
      {
        label: t('comp.ev_send'), variant: 'primary', onClick: async () => {
          showErr(err, null);
          if (!file.files[0]) { showErr(err, t('comp.ev_need_file')); file.focus(); return false; }
          const fd = new FormData();
          fd.append('note', note.value.trim());
          fd.append('file', file.files[0], file.files[0].name);
          try { await api.upload(`/undertakings/${u.id}/evidence`, fd); } catch (e) { showErr(err, e.message); return false; }
          toast(t('comp.ev_sent'), 'success');
          await load(false);
          return true;
        },
      },
    ],
  });
}

function utCard(u) {
  const status = u.status;
  const extInfo = (u.extensions || []).map((x) => el('li', {}, t('comp.ext', { from: fmtDate(x.from), to: fmtDate(x.to), by: x.by || '—', reason: x.reason || '' })));
  return el('article', { class: 'card ut-card', 'aria-label': u.ref_no },
    el('div', { class: 'card-body' },
      el('div', { class: 'row between' },
        el('div', { class: 'row' }, el('span', { class: 'mono', style: { fontWeight: '700' } }, u.ref_no), el('span', { class: 'badge b-slate' }, tl(u.category_label))),
        el('span', { html: utBadge(status, u.overdue) })),
      el('div', { class: 'ut-cond' }, u.condition),
      el('div', { class: 'ut-meta' },
        u.application ? el('span', {}, `${t('comp.app')}: `, el('a', { href: site(`institution/application.html?id=${u.application.id}`), class: 'mono' }, u.application.ref_no)) : null,
        el('span', {}, `${t('comp.due')}: ${fmtDate(u.due_date)} `, status !== 'VERIFIED' ? el('span', { html: daysChip(u.days_left) }) : null),
        u.original_due && u.original_due !== u.due_date ? el('span', { class: 'muted' }, t('comp.orig_due', { date: fmtDate(u.original_due) })) : null),
      status === 'PENDING' && u.rejections > 0 ? el('div', { class: 'alert warning', style: { marginTop: '10px' } }, el('span', { class: 'icon', html: icon('alert', 18) }),
        el('div', {}, u.verify_note ? t('comp.rejected', { n: u.rejections, note: u.verify_note }) : t('comp.rejected_nonote', { n: u.rejections }))) : null,
      status === 'SUBMITTED' ? el('div', { class: 'alert info', style: { marginTop: '10px' } }, el('span', { class: 'icon', html: icon('hourglass', 18) }), el('div', {}, t('comp.submitted', { date: fmtDate(u.submitted_at) }))) : null,
      status === 'VERIFIED' ? el('div', { class: 'alert success', style: { marginTop: '10px' } }, el('span', { class: 'icon', html: icon('check-circle', 18) }),
        el('div', {}, t('comp.fulfilled', { date: fmtDate(u.verified_at) }), ' ', u.fulfilled_on_time === true ? t('comp.fulfilled_on_time') : u.fulfilled_on_time === false ? t('comp.fulfilled_late') : '')) : null,
      extInfo.length ? el('ul', { class: 'ut-ext' }, extInfo) : null),
    status === 'PENDING' ? el('div', { class: 'card-foot' }, el('button', { class: 'btn', type: 'button', onclick: () => evidenceModal(u), html: `${icon('upload', 16)}<span>${esc(t('comp.upload_ev'))}</span>` })) : null);
}

function utPanel(panel) {
  const { items, counts } = state.uts;
  if (!items.length) { emptyState(panel, { icon: 'target', title: t('comp.ut_empty'), text: t('comp.ut_empty_text') }); return; }
  const order = ['OVERDUE', 'PENDING', 'SUBMITTED', 'VERIFIED'];
  mount(panel,
    el('div', { class: 'count-chips' }, order.filter((k) => counts && counts[k]).map((k) => el('span', { class: 'chip' }, t(`ut.${k}`), el('strong', {}, String(counts[k]))))),
    el('div', { class: 'grid g-2' }, items.map(utCard)));
}

/* ------------------------------------------------------------------ documents */
function docModal({ renew = null, types }) {
  const typeSel = el('select', { class: 'select', id: 'doc-type' }, renew
    ? el('option', { value: renew.doc_type }, tl(renew.doc_type_label))
    : [el('option', { value: '' }, t('comp.choose')), ...types.map((k) => el('option', { value: k }, tl(meta.doc_types[k])))]);
  if (renew) typeSel.disabled = true;
  const title = el('input', { class: 'input', id: 'doc-title', type: 'text', maxlength: 200, autocomplete: 'off' });
  const from = el('input', { class: 'input', id: 'doc-from', type: 'date', value: meta.today });
  const until = el('input', { class: 'input', id: 'doc-until', type: 'date' });
  if (renew && renew.valid_until) until.min = addDays(renew.valid_until, 1);
  const file = el('input', { class: 'input', id: 'doc-file', type: 'file' });
  const untilLabel = el('label', { for: 'doc-until' });
  const untilHint = el('div', { class: 'hint' });
  const err = errBox();
  const expires = () => !!(meta.doc_types[typeSel.value] && meta.doc_types[typeSel.value].expires);
  const syncUntil = () => {
    const exp = expires();
    until.disabled = !exp && !!typeSel.value;
    if (until.disabled) until.value = '';
    mount(untilLabel, exp || !typeSel.value ? t('comp.f_until_req') : t('comp.f_until'));
    untilHint.textContent = !typeSel.value || exp ? (renew && renew.valid_until ? t('comp.f_until_hint', { date: fmtDate(renew.valid_until) }) : '') : t('comp.f_until_none');
  };
  typeSel.addEventListener('change', syncUntil);
  syncUntil();
  modal({
    title: renew ? t('comp.renew_title', { doc: tl(renew.doc_type_label) }) : t('comp.new_title'),
    size: 'wide',
    body: el('div', { class: 'stack' },
      el('div', { class: 'form-grid' },
        field(t('comp.f_type'), typeSel, null, 'doc-type', true),
        field(t('comp.f_title'), title, null, 'doc-title'),
        field(t('comp.f_from'), from, t('comp.f_from_hint'), 'doc-from', true),
        el('div', { class: 'field' }, untilLabel, until, untilHint),
        el('div', { class: 'field full' }, el('label', { for: 'doc-file' }, t('comp.f_file'), el('span', { class: 'req', 'aria-hidden': 'true' }, '*')), file, el('div', { class: 'hint' }, t('comp.f_file_hint')))),
      err),
    actions: [
      { label: t('common.cancel'), variant: 'secondary' },
      {
        label: t('comp.upload'), variant: 'primary', onClick: async () => {
          showErr(err, null);
          if (!typeSel.value) { showErr(err, t('comp.need_type')); typeSel.focus(); return false; }
          if (!from.value) { showErr(err, t('comp.need_from')); from.focus(); return false; }
          if (expires() && !until.value) { showErr(err, t('comp.need_until')); until.focus(); return false; }
          if (!file.files[0]) { showErr(err, t('comp.need_file')); file.focus(); return false; }
          const fd = new FormData();
          fd.append('doc_type', typeSel.value);
          fd.append('title', title.value.trim());
          fd.append('valid_from', from.value);
          if (until.value && !until.disabled) fd.append('valid_until', until.value);
          if (renew) fd.append('replaces_id', String(renew.id));
          fd.append('file', file.files[0], file.files[0].name);
          try { await api.upload('/documents', fd); } catch (e) { showErr(err, e.message); return false; }
          toast(t('comp.doc_sent'), 'success');
          await load(false);
          return true;
        },
      },
    ],
  });
}

function docPanel(panel) {
  const { items, counts } = state.docs;
  const onRecord = new Set(items.map((d) => d.doc_type));
  const missing = PRESCRIBED.filter((k) => meta.doc_types[k] && !onRecord.has(k));
  const host = el('div');
  renderTable(host, {
    empty: { icon: 'file-check', title: t('comp.doc_empty'), text: t('comp.doc_empty_text') },
    columns: [
      { key: 'doc_type', label: t('comp.doc_col_doc'), render: (d) => `<span class="cell-main">${esc(tl(d.doc_type_label))}</span><div class="cell-sub">${esc(d.title || '')}</div>${d.status === 'RENEWAL' ? `<span class="badge b-info">${esc(t('comp.renewal_row'))}</span>` : ''}${d.renewal_pending ? `<span class="badge b-info">${esc(t('comp.renewal_waiting'))}</span>` : ''}` },
      { key: 'valid_until', label: t('comp.doc_col_valid'), render: (d) => (d.valid_until ? `${esc(fmtDate(d.valid_until))}<div style="margin-top:3px">${d.status === 'RENEWAL' ? '' : daysChip(d.days_left)}</div>` : `<span class="muted">${esc(t('comp.no_expiry'))}</span>`) },
      { key: 'validity', label: t('comp.doc_col_validity'), render: (d) => (d.status === 'RENEWAL' ? '—' : validityBadge(d.validity)) },
      { key: 'verification', label: t('comp.doc_col_verif'), render: (d) => `${verifyBadge(d.verification)}${d.verification === 'REJECTED' && d.verify_note ? `<div class="doc-note">${esc(d.verify_note)}</div>` : ''}` },
      { key: 'file', label: t('comp.doc_col_file'), render: (d) => (d.file ? el('a', { href: fileUrl(d.file), target: '_blank', rel: 'noopener', 'aria-label': `${t('comp.view_file')}: ${d.file.filename}` }, `${d.file.filename.length > 26 ? `${d.file.filename.slice(0, 24)}…` : d.file.filename} (${fmtBytes(d.file.size)})`) : '—') },
      {
        key: 'act', label: t('comp.doc_col_act'), render: (d) => {
          const can = d.status === 'CURRENT' && ['EXPIRING', 'EXPIRED'].includes(d.validity) && !d.renewal_pending;
          if (!can) return '';
          return el('button', { class: 'btn sm', type: 'button', onclick: () => docModal({ renew: d }), html: `${icon('upload', 15)}<span>${esc(t('comp.renew'))}</span>` });
        },
      },
    ],
    rows: items,
  });
  const order = ['VALID', 'EXPIRING', 'EXPIRED', 'NO_EXPIRY', 'RENEWAL_PENDING'];
  mount(panel,
    el('div', { class: 'count-chips' }, order.filter((k) => counts && counts[k]).map((k) => el('span', { class: 'chip' }, k === 'RENEWAL_PENDING' ? t('comp.c.RENEWAL_PENDING') : t(`validity.${k}`), el('strong', {}, String(counts[k]))))),
    missing.length ? el('div', { class: 'alert saffron', style: { marginBottom: '14px' } }, el('span', { class: 'icon', html: icon('info', 18) }),
      el('div', { class: 'row between grow' },
        el('div', { class: 'missing' }, el('strong', {}, `${t('comp.doc_note_missing')}:`), missing.map((k) => el('span', { class: 'chip' }, tl(meta.doc_types[k])))),
        el('button', { class: 'btn sm', type: 'button', onclick: () => docModal({ types: missing }), html: `${icon('plus', 15)}<span>${esc(t('comp.doc_upload_missing'))}</span>` }))) : null,
    el('div', { class: 'card' }, host));
}

/* ------------------------------------------------------------------ page */
function render() {
  if (state.error) { errorState(body, state.error, () => load(true)); return; }
  if (!state.uts || !state.docs) { loading(body); return; }
  mount(body, el('div', { id: 'comp-tabs' }));
  tabs($('#comp-tabs'), [
    { key: 'undertakings', label: t('comp.tab_ut'), icon: 'target', count: state.uts.total, render: utPanel },
    { key: 'documents', label: t('comp.tab_doc'), icon: 'file-check', count: state.docs.total, render: docPanel },
  ], { active: state.tab, onChange: (k) => { state.tab = k; setParams({ tab: k === 'undertakings' ? null : k }); } });
}

async function load(showSpinner = true) {
  if (showSpinner) loading(body);
  try {
    const [uts, docs] = await Promise.all([api.get('/undertakings', { page_size: 100 }), api.get('/documents', { page_size: 100 })]);
    state.uts = uts; state.docs = docs; state.error = null;
  } catch (e) {
    state.error = e;
  }
  render();
}

onLang(render);
load();
