// Shared helpers for the monitoring / compliance / admin pages (page builder C only).
// Not a kernel file: it only composes kernel helpers (ui.js, i18n.js, api.js) and adds bilingual labels for
// codes that the API returns as plain codes (audit actions, notification templates, document statuses ...).
import { getLang, t, tl, extend, has } from '../assets/js/i18n.js';
import { apiUrl, getToken } from '../assets/js/api.js';
import { el, esc, icon, fmtBytes, modal } from '../assets/js/ui.js';

extend({
  en: {
    'cc.all_regions': 'All regions',
    'cc.all': 'All',
    'cc.yes': 'Yes',
    'cc.no': 'No',
    'cc.score': 'Compliance score',
    'cc.new_inst': 'New institution',
    'cc.open_file': 'Open file',
    'cc.sha': 'SHA-256',
    'cc.hq_note': 'Showing all regions',
    'cc.docst.CURRENT': 'Current',
    'cc.docst.RENEWAL': 'Renewal (awaiting check)',
    'cc.docst.SUPERSEDED': 'Replaced by a newer copy',
    'cc.docst.REJECTED': 'Rejected',
    'cc.renewal_pending': 'Renewal received',
    'cc.by': 'by',
    'cc.rejected_n': 'Rejected {n}×',
    'cc.back_inst': 'Back to institutions',
    'cc.view_case': 'Open case',
    'cc.open_inst': 'Institution profile',
    'cc.fulfilled_late_n': '{n} undertaking(s) fulfilled late',
    'cc.note_required': 'Please write a note of at least 5 characters.',
    'cc.cancel': 'Cancel',
    'cc.itype.Engineering': 'Engineering',
    'cc.itype.Management': 'Management',
    'cc.itype.Pharmacy': 'Pharmacy',
    'cc.itype.Architecture': 'Architecture',
    'cc.itype.Polytechnic': 'Polytechnic',
    'cc.itype.Computer Applications': 'Computer Applications',
    'cc.itype.Hotel Management': 'Hotel Management',
    'cc.reason.expired': 'expired',
    'cc.reason.expiring': 'expiring soon',
    'cc.reason.overdue': 'overdue',

    'cc.act.APP_DECIDED': 'Final decision recorded',
    'cc.act.APP_REASSIGNED': 'Case reassigned',
    'cc.act.APP_RESPONDED': 'Institution replied to a deficiency',
    'cc.act.APP_RETURNED': 'Returned to the institution',
    'cc.act.APP_REVERTED': 'Sent back to an earlier stage',
    'cc.act.APP_SUBMITTED': 'Application submitted',
    'cc.act.AUTO_ADVANCED': 'Moved to the next stage automatically',
    'cc.act.AUTO_ASSIGNED': 'Assigned to an officer automatically',
    'cc.act.AUTO_RESUMED': 'Stage clock resumed',
    'cc.act.AUTO_ROUTED': 'Route chosen automatically',
    'cc.act.CLOCK_SET': 'Demo clock moved',
    'cc.act.COMMITTEE_RECORDED': 'Committee recommendation recorded',
    'cc.act.DAILY_JOB': 'Daily job run',
    'cc.act.DEMO_RESET': 'Demo data reset',
    'cc.act.DEMO_SCENARIO': 'Judge scenario run',
    'cc.act.DOC_IMPORTED': 'Document imported',
    'cc.act.DOC_REJECTED': 'Document rejected',
    'cc.act.DOC_RENEWAL_SUBMITTED': 'Renewal uploaded',
    'cc.act.DOC_UPLOADED': 'Document uploaded',
    'cc.act.DOC_VERIFIED': 'Document verified',
    'cc.act.ESCALATED': 'Escalation raised',
    'cc.act.ESCALATION_ACK': 'Escalation acknowledged',
    'cc.act.EVC_REPORTED': 'EVC report submitted',
    'cc.act.EVC_RESCHEDULED': 'EVC visit rescheduled',
    'cc.act.EVC_SCHEDULED': 'EVC visit scheduled',
    'cc.act.EVIDENCE_REJECTED': 'Evidence rejected',
    'cc.act.EVIDENCE_SUBMITTED': 'Evidence submitted',
    'cc.act.INTEGRATION_IMPORT': 'Mock feed imported',
    'cc.act.LETTER_ISSUED': 'Letter issued',
    'cc.act.LOGIN': 'Signed in',
    'cc.act.LOGOUT': 'Signed out',
    'cc.act.NOTE_ADDED': 'Note added',
    'cc.act.REMINDER_SENT': 'Reminder sent',
    'cc.act.RULES_PUBLISHED': 'Rulebook published',
    'cc.act.SCRUTINY_COMPLETED': 'Scrutiny completed',
    'cc.act.UNDERTAKING_CREATED': 'Undertaking recorded',
    'cc.act.UNDERTAKING_EXTENDED': 'Undertaking extended',
    'cc.act.UNDERTAKING_VERIFIED': 'Undertaking verified',
    'cc.act.USER_CREATED': 'User created',
    'cc.act.USER_UPDATED': 'User updated',

    'cc.tpl.APP_RECEIVED': 'Application received',
    'cc.tpl.DEADLINE_REMINDER': 'Deadline reminder',
    'cc.tpl.DECISION': 'Decision',
    'cc.tpl.DEFICIENCY': 'Deficiency notice',
    'cc.tpl.DOC_EXPIRY_REMINDER': 'Document expiry reminder',
    'cc.tpl.DOC_REJECTED': 'Document not accepted',
    'cc.tpl.DOC_VERIFIED': 'Document verified',
    'cc.tpl.ESCALATION_L1': 'Escalation, level 1',
    'cc.tpl.ESCALATION_L2': 'Escalation, level 2',
    'cc.tpl.ESCALATION_L3': 'Escalation, level 3',
    'cc.tpl.EVC_ASSIGNED': 'EVC assigned',
    'cc.tpl.EVC_INTIMATION': 'EVC visit intimation',
    'cc.tpl.EVC_REPORT_REMINDER': 'EVC report reminder',
    'cc.tpl.EVC_SCHEDULE_REMINDER': 'EVC scheduling reminder',
    'cc.tpl.EVIDENCE_REJECTED': 'Evidence not accepted',
    'cc.tpl.NEW_IN_QUEUE': 'New case in the queue',
    'cc.tpl.REPLY_RECEIVED': 'Reply received',
    'cc.tpl.REPLY_REMINDER': 'Reply reminder',
    'cc.tpl.UNDERTAKING_CREATED': 'Undertaking recorded',
    'cc.tpl.UNDERTAKING_EXTENDED': 'Undertaking extended',
    'cc.tpl.UNDERTAKING_REMINDER': 'Undertaking reminder',
    'cc.tpl.UNDERTAKING_VERIFIED': 'Undertaking verified',
    'cc.tpl.VERIFY_PENDING': 'Verification pending',
  },
  hi: {
    'cc.all_regions': 'सभी क्षेत्र',
    'cc.all': 'सभी',
    'cc.yes': 'हाँ',
    'cc.no': 'नहीं',
    'cc.score': 'अनुपालन अंक',
    'cc.new_inst': 'नई संस्था',
    'cc.open_file': 'फ़ाइल खोलें',
    'cc.sha': 'SHA-256',
    'cc.hq_note': 'सभी क्षेत्र दिखाए जा रहे हैं',
    'cc.docst.CURRENT': 'वर्तमान',
    'cc.docst.RENEWAL': 'नवीनीकरण (जाँच लंबित)',
    'cc.docst.SUPERSEDED': 'नई प्रति से प्रतिस्थापित',
    'cc.docst.REJECTED': 'अस्वीकृत',
    'cc.renewal_pending': 'नवीनीकरण प्राप्त',
    'cc.by': 'द्वारा',
    'cc.rejected_n': '{n} बार अस्वीकृत',
    'cc.back_inst': 'संस्थाओं की सूची पर लौटें',
    'cc.view_case': 'मामला खोलें',
    'cc.open_inst': 'संस्था प्रोफ़ाइल',
    'cc.fulfilled_late_n': '{n} वचनबद्धता(एँ) देर से पूर्ण',
    'cc.note_required': 'कृपया कम से कम 5 अक्षरों की टिप्पणी लिखें।',
    'cc.cancel': 'रद्द करें',
    'cc.itype.Engineering': 'अभियांत्रिकी',
    'cc.itype.Management': 'प्रबंधन',
    'cc.itype.Pharmacy': 'फार्मेसी',
    'cc.itype.Architecture': 'वास्तुकला',
    'cc.itype.Polytechnic': 'पॉलिटेक्निक',
    'cc.itype.Computer Applications': 'कंप्यूटर अनुप्रयोग',
    'cc.itype.Hotel Management': 'होटल प्रबंधन',
    'cc.st.Andhra Pradesh': 'आंध्र प्रदेश',
    'cc.st.Assam': 'असम',
    'cc.st.Bihar': 'बिहार',
    'cc.st.Chhattisgarh': 'छत्तीसगढ़',
    'cc.st.Delhi': 'दिल्ली',
    'cc.st.Goa': 'गोवा',
    'cc.st.Gujarat': 'गुजरात',
    'cc.st.Haryana': 'हरियाणा',
    'cc.st.Himachal Pradesh': 'हिमाचल प्रदेश',
    'cc.st.Jharkhand': 'झारखंड',
    'cc.st.Karnataka': 'कर्नाटक',
    'cc.st.Kerala': 'केरल',
    'cc.st.Madhya Pradesh': 'मध्य प्रदेश',
    'cc.st.Maharashtra': 'महाराष्ट्र',
    'cc.st.Meghalaya': 'मेघालय',
    'cc.st.Odisha': 'ओडिशा',
    'cc.st.Punjab': 'पंजाब',
    'cc.st.Rajasthan': 'राजस्थान',
    'cc.st.Tamil Nadu': 'तमिलनाडु',
    'cc.st.Telangana': 'तेलंगाना',
    'cc.st.Uttar Pradesh': 'उत्तर प्रदेश',
    'cc.st.Uttarakhand': 'उत्तराखंड',
    'cc.st.West Bengal': 'पश्चिम बंगाल',
    'cc.reason.expired': 'समाप्त',
    'cc.reason.expiring': 'शीघ्र समाप्त होने वाला',
    'cc.reason.overdue': 'अतिदेय',

    'cc.act.APP_DECIDED': 'अंतिम निर्णय दर्ज',
    'cc.act.APP_REASSIGNED': 'मामला पुनः आवंटित',
    'cc.act.APP_RESPONDED': 'संस्था ने कमी का उत्तर दिया',
    'cc.act.APP_RETURNED': 'संस्था को लौटाया गया',
    'cc.act.APP_REVERTED': 'पिछले चरण में वापस भेजा गया',
    'cc.act.APP_SUBMITTED': 'आवेदन प्रस्तुत',
    'cc.act.AUTO_ADVANCED': 'अगले चरण में स्वतः भेजा गया',
    'cc.act.AUTO_ASSIGNED': 'अधिकारी को स्वतः आवंटित',
    'cc.act.AUTO_RESUMED': 'चरण की समय-सीमा पुनः चालू',
    'cc.act.AUTO_ROUTED': 'मार्ग स्वतः निर्धारित',
    'cc.act.CLOCK_SET': 'डेमो घड़ी आगे बढ़ाई गई',
    'cc.act.COMMITTEE_RECORDED': 'समिति की अनुशंसा दर्ज',
    'cc.act.DAILY_JOB': 'दैनिक कार्य चलाया गया',
    'cc.act.DEMO_RESET': 'डेमो डेटा रीसेट',
    'cc.act.DEMO_SCENARIO': 'जज परिदृश्य चलाया गया',
    'cc.act.DOC_IMPORTED': 'दस्तावेज़ आयातित',
    'cc.act.DOC_REJECTED': 'दस्तावेज़ अस्वीकृत',
    'cc.act.DOC_RENEWAL_SUBMITTED': 'नवीनीकरण अपलोड',
    'cc.act.DOC_UPLOADED': 'दस्तावेज़ अपलोड',
    'cc.act.DOC_VERIFIED': 'दस्तावेज़ सत्यापित',
    'cc.act.ESCALATED': 'वृद्धि (एस्केलेशन) की गई',
    'cc.act.ESCALATION_ACK': 'वृद्धि की पावती दी गई',
    'cc.act.EVC_REPORTED': 'ईवीसी रिपोर्ट प्रस्तुत',
    'cc.act.EVC_RESCHEDULED': 'ईवीसी दौरा पुनर्निर्धारित',
    'cc.act.EVC_SCHEDULED': 'ईवीसी दौरा निर्धारित',
    'cc.act.EVIDENCE_REJECTED': 'साक्ष्य अस्वीकृत',
    'cc.act.EVIDENCE_SUBMITTED': 'साक्ष्य प्रस्तुत',
    'cc.act.INTEGRATION_IMPORT': 'नकली (मॉक) फ़ीड आयात',
    'cc.act.LETTER_ISSUED': 'पत्र जारी',
    'cc.act.LOGIN': 'साइन इन',
    'cc.act.LOGOUT': 'साइन आउट',
    'cc.act.NOTE_ADDED': 'टिप्पणी जोड़ी गई',
    'cc.act.REMINDER_SENT': 'अनुस्मारक भेजा गया',
    'cc.act.RULES_PUBLISHED': 'नियम-पुस्तिका प्रकाशित',
    'cc.act.SCRUTINY_COMPLETED': 'संवीक्षा पूर्ण',
    'cc.act.UNDERTAKING_CREATED': 'वचनबद्धता दर्ज',
    'cc.act.UNDERTAKING_EXTENDED': 'वचनबद्धता की अवधि बढ़ाई गई',
    'cc.act.UNDERTAKING_VERIFIED': 'वचनबद्धता सत्यापित',
    'cc.act.USER_CREATED': 'उपयोगकर्ता बनाया गया',
    'cc.act.USER_UPDATED': 'उपयोगकर्ता अद्यतन',

    'cc.tpl.APP_RECEIVED': 'आवेदन प्राप्त',
    'cc.tpl.DEADLINE_REMINDER': 'समय-सीमा अनुस्मारक',
    'cc.tpl.DECISION': 'निर्णय',
    'cc.tpl.DEFICIENCY': 'कमी सूचना',
    'cc.tpl.DOC_EXPIRY_REMINDER': 'दस्तावेज़ समाप्ति अनुस्मारक',
    'cc.tpl.DOC_REJECTED': 'दस्तावेज़ स्वीकार नहीं',
    'cc.tpl.DOC_VERIFIED': 'दस्तावेज़ सत्यापित',
    'cc.tpl.ESCALATION_L1': 'वृद्धि, स्तर 1',
    'cc.tpl.ESCALATION_L2': 'वृद्धि, स्तर 2',
    'cc.tpl.ESCALATION_L3': 'वृद्धि, स्तर 3',
    'cc.tpl.EVC_ASSIGNED': 'ईवीसी नियुक्त',
    'cc.tpl.EVC_INTIMATION': 'ईवीसी दौरा सूचना',
    'cc.tpl.EVC_REPORT_REMINDER': 'ईवीसी रिपोर्ट अनुस्मारक',
    'cc.tpl.EVC_SCHEDULE_REMINDER': 'ईवीसी निर्धारण अनुस्मारक',
    'cc.tpl.EVIDENCE_REJECTED': 'साक्ष्य स्वीकार नहीं',
    'cc.tpl.NEW_IN_QUEUE': 'कतार में नया मामला',
    'cc.tpl.REPLY_RECEIVED': 'उत्तर प्राप्त',
    'cc.tpl.REPLY_REMINDER': 'उत्तर अनुस्मारक',
    'cc.tpl.UNDERTAKING_CREATED': 'वचनबद्धता दर्ज',
    'cc.tpl.UNDERTAKING_EXTENDED': 'वचनबद्धता बढ़ाई गई',
    'cc.tpl.UNDERTAKING_REMINDER': 'वचनबद्धता अनुस्मारक',
    'cc.tpl.UNDERTAKING_VERIFIED': 'वचनबद्धता सत्यापित',
    'cc.tpl.VERIFY_PENDING': 'सत्यापन लंबित',
  },
});

/** Roles that see all regions (no region scoping on the server). */
export const HQ_ROLES = ['bureau', 'committee', 'authority', 'admin'];
export const isHQ = (user) => !!user && HQ_ROLES.includes(user.role);

const humanize = (code) => {
  const s = String(code || '').replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const actionLabel = (code) => t(`cc.act.${code}`, { _default: humanize(code) });
export const templateLabel = (code) => t(`cc.tpl.${code}`, { _default: humanize(code) });
export const instTypeLabel = (v) => t(`cc.itype.${v}`, { _default: v || '—' });
export const stateLabel = (v) => t(`cc.st.${v}`, { _default: v || '' });
export const docStatusLabel = (s) => t(`cc.docst.${s}`, { _default: humanize(s) });

/** Region name in the current language from meta.regions, or from an inline {code,name,name_hi} object. */
export function regionName(meta, r) {
  if (!r) return '—';
  const code = typeof r === 'string' ? r : r.code;
  const found = (meta?.regions || []).find((x) => x.code === code || x.name === code);
  const src = found || (typeof r === 'object' ? r : null);
  if (!src) return String(r);
  return getLang() === 'hi' && src.name_hi ? src.name_hi : src.name;
}

export const regionOptions = (meta) => (meta?.regions || []).map((r) => [r.code, regionName(meta, r)]);

export function docTypeLabel(meta, code) {
  const d = meta?.doc_types?.[code];
  return d ? tl(d) : (code || '—');
}

/** Localise an English doc-type label coming from a report row ("Fire safety NOC") using meta.doc_types. */
export function docTypeByEnglish(meta, en) {
  const d = Object.values(meta?.doc_types || {}).find((x) => x.en === en);
  return d ? tl(d) : en;
}

export function stageByEnglish(meta, en) {
  const s = Object.values(meta?.stages || {}).find((x) => x.en === en);
  return s ? tl(s) : en;
}

/** Compliance-score reasons come from the API as English sentences; map the three known patterns. */
export function reasonText(reason, meta) {
  if (getLang() !== 'hi') return reason;
  let m = String(reason).match(/^(.+) (expired|expiring)$/);
  if (m) {
    const d = Object.values(meta?.doc_types || {}).find((x) => x.en === m[1]);
    if (d) return `${d.hi}: ${t(`cc.reason.${m[2]}`)}`;
  }
  m = String(reason).match(/^(UT-[\w-]+) overdue$/);
  if (m) return `${m[1]}: ${t('cc.reason.overdue')}`;
  m = String(reason).match(/^(\d+) undertaking\(s\) fulfilled late$/);
  if (m) return t('cc.fulfilled_late_n', { n: m[1] });
  return reason;
}

/* ------------------------------------------------------------------ small DOM builders */
export function field(id, label, control, hint) {
  return el('div', { class: 'field' }, el('label', { for: id }, label), control, hint ? el('div', { class: 'hint' }, hint) : null);
}

/** <select class="select"> from [[value,label],...]; first option normally ['', 'All']. */
export function selectEl(id, options, value, onChange) {
  const s = el('select', { class: 'select', id });
  for (const [v, l] of options) {
    const o = el('option', { value: v }, l);
    if (String(v) === String(value ?? '')) o.selected = true;
    s.appendChild(o);
  }
  if (onChange) s.addEventListener('change', () => onChange(s.value));
  return s;
}

export function inputEl(id, { type = 'text', value = '', placeholder = '', onInput, attrs = {} } = {}) {
  const i = el('input', { class: 'input', id, type, placeholder, ...attrs });
  i.value = value ?? '';
  if (onInput) i.addEventListener('input', () => onInput(i.value));
  return i;
}

export function checkEl(id, label, checked, onChange) {
  const i = el('input', { type: 'checkbox', id });
  i.checked = !!checked;
  if (onChange) i.addEventListener('change', () => onChange(i.checked));
  return el('label', { class: 'check', for: id }, i, el('span', {}, label));
}

/**
 * Ask for a note in a bilingual dialog (the kernel promptDialog shows an English "Required").
 * Resolves the trimmed text, or null when cancelled. `required` => at least 5 characters.
 */
export function askNote({ title, label, hint, required = true, confirmLabel, variant = 'primary', value = '' } = {}) {
  return new Promise((resolve) => {
    let done = false;
    const ta = el('textarea', { class: 'textarea', id: 'ask-note', rows: 4 });
    ta.value = value;
    const err = el('div', { class: 'error', hidden: true }, t('cc.note_required'));
    modal({
      title,
      body: el('div', { class: 'field' }, el('label', { for: 'ask-note' }, label), ta, hint ? el('div', { class: 'hint' }, hint) : null, err),
      actions: [
        { label: t('cc.cancel'), onClick: () => { done = true; resolve(null); } },
        {
          label: confirmLabel || t('common.confirm'),
          variant,
          onClick: () => {
            const v = ta.value.trim();
            if (required && v.length < 5) { err.hidden = false; ta.classList.add('invalid'); ta.focus(); return false; }
            done = true; resolve(v); return true;
          },
        },
      ],
      onClose: () => { if (!done) resolve(null); },
    });
  });
}

/* ------------------------------------------------------------------ files and hashes */
export const shortHash = (h, n = 12) => (h ? `${String(h).slice(0, n)}…` : '—');

/** Auth-aware URL of an uploaded file (the API sends file.url as "/api/files/<id>"; apiUrl adds /api itself). */
export function fileHref(f, download = false) {
  return apiUrl(`/files/${f.id}`, { token: getToken(), download: download ? 1 : undefined });
}

export function fileLink(f) {
  if (!f) return el('span', { class: 'muted' }, '—');
  return el('div', {},
    el('a', { href: fileHref(f), target: '_blank', rel: 'noopener', class: 'cell-main' }, f.filename || t('cc.open_file')),
    el('div', { class: 'cell-sub mono', title: f.sha256 || '' }, `${t('cc.sha')} ${shortHash(f.sha256, 10)} · ${fmtBytes(f.size)}`));
}

/* ------------------------------------------------------------------ meters */
export function scoreMeter(score, { width = 96 } = {}) {
  if (score === null || score === undefined) return el('span', { class: 'muted' }, '—');
  const tone = score >= 85 ? '' : score >= 60 ? 'warning' : 'danger';
  return el('div', { class: 'row nowrap', style: { gap: '8px' } },
    el('div', { class: `meter ${tone}`, style: { width: `${width}px` }, role: 'img', 'aria-label': `${t('cc.score')}: ${score}/100` },
      el('span', { style: { width: `${Math.max(2, score)}%` } })),
    el('strong', { class: 'num' }, String(score)));
}

/** "Institution name" cell: name + city/region line. */
export function instCell(meta, inst) {
  if (!inst) return '—';
  return `<div class="cell-main">${esc(inst.name)}</div><div class="cell-sub">${esc([inst.city, inst.region ? regionName(meta, inst.region) : ''].filter(Boolean).join(' · '))}</div>`;
}

export { icon, has };
