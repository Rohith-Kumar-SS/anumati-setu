// Rulebook: current version, version history, friendly editor + advanced JSON, what-if preview, publish (admin only).
import { initPage } from '../assets/js/layout.js';
import { api } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import {
  $, el, esc, mount, loading, errorState, renderTable, kpi, toast, withBusy, confirmDialog, fmtDate, fmtDateTime, fmtNum,
  getParam, icon,
} from '../assets/js/ui.js';
import { field, inputEl, checkEl } from '../staff/c-common.js';

extend({
  en: {
    'rul.title': 'Rulebook',
    'rul.subtitle': 'Timelines, reminders, escalation and routes are data, not code. Change them here, preview the effect on open cases, then publish a new version.',
    'rul.in_force': 'Version in force',
    'rul.version_n': 'Version {n}',
    'rul.published_by': 'Published by',
    'rul.published_on': 'Published on',
    'rul.open_on_version': '{n} open applications still follow this version',
    'rul.initial': 'Initial rulebook (system)',
    'rul.versions': 'Version history',
    'rul.col_version': 'Version',
    'rul.col_note': 'Note',
    'rul.col_by': 'Published by',
    'rul.col_at': 'Published on',
    'rul.col_open_flag': 'Applied to open cases',
    'rul.col_open': 'Open applications on it',
    'rul.editor': 'Edit a draft',
    'rul.draft_banner': 'Draft loaded from the link: EVC completion set to 21 days and "apply to open applications" switched on. The preview below shows the effect before anything is published.',
    'rul.sec_sla': 'Stage timelines (days)',
    'rul.sla.SCRUTINY': 'Scrutiny',
    'rul.sla.RETURNED': 'Institution reply window',
    'rul.sla.EVC_SCHEDULE': 'Fix the EVC visit date',
    'rul.sla.EVC_COMPLETE': 'Complete the EVC visit and report',
    'rul.sla.EVC_COMPLETE_NEW': 'EVC for a new institution',
    'rul.sla.COMMITTEE': 'SAC/SHC recommendation',
    'rul.sla.DECISION': 'Final decision',
    'rul.sla.VERIFY': 'Verify evidence or a renewal',
    'rul.sec_alerts': 'Reminders and escalation',
    'rul.f_approach_days': 'Reminder to the holder before a deadline (days)',
    'rul.f_esc_aicte': 'AICTE-side items: days after the due date for levels 1, 2 and 3',
    'rul.f_esc_inst': 'Institution-side items: days after the due date for levels 1, 2 and 3',
    'rul.level_n': 'Level {n}',
    'rul.f_rem_undertaking': 'Undertaking reminders (days before the due date)',
    'rul.f_rem_document': 'Document expiry reminders (days before expiry)',
    'rul.f_rem_reply': 'Deficiency reply reminders (days before the due date)',
    'rul.list_hint': 'Whole numbers separated by commas, for example 30, 15, 7, 1',
    'rul.sec_evc': 'Expert visit (EVC) settings',
    'rul.f_evc_min_notice_days': 'Minimum notice before a visit (days)',
    'rul.f_evc_panel_size': 'Panel size (members)',
    'rul.f_evc_exclude_same_state': 'Exclude experts from the institution\'s own state',
    'rul.sec_docs': 'Documents and notices',
    'rul.f_expiring_window_days': 'A document is "expiring soon" within (days)',
    'rul.f_compliance_notice_level': 'Escalation level at which a compliance notice letter is issued',
    'rul.sec_routes': 'Route for each application type',
    'rul.f_routes_hint': 'Routes are the fixed sequences of stages; every route ends with the final decision.',
    'rul.advanced': 'Advanced: edit the whole rulebook as JSON',
    'rul.advanced_hint': 'Also lets you change deficiency codes and the stages of each route. Switch off to return to the form.',
    'rul.json_label': 'Rulebook JSON',
    'rul.json_error': 'The JSON could not be read: {msg}',
    'rul.list_error': 'Check the highlighted lists: use whole numbers separated by commas.',
    'rul.apply_open': 'Also apply to open applications (their due dates are recomputed)',
    'rul.preview': 'Preview impact',
    'rul.reset': 'Reset to the version in force',
    'rul.prev_title': 'Preview: what would change',
    'rul.prev_none': 'No difference from the version in force.',
    'rul.col_setting': 'Setting',
    'rul.col_was': 'Now',
    'rul.col_new': 'Would become',
    'rul.impact_title': 'Impact on open cases',
    'rul.imp_affected': 'Open items affected',
    'rul.imp_overdue': 'Would become overdue',
    'rul.imp_approaching': 'Would become due soon',
    'rul.imp_evc_late': 'EVC scheduling that would become late',
    'rul.imp_open_items': 'Open items in total',
    'rul.applies_open': 'Applies to open and new applications',
    'rul.applies_new': 'Applies to new applications only',
    'rul.examples': 'Examples of changed due dates',
    'rul.col_ref': 'Application',
    'rul.col_inst': 'Institution',
    'rul.col_stage': 'Stage',
    'rul.col_old_due': 'Due now',
    'rul.col_new_due': 'Would be due',
    'rul.prev_error': 'The draft was refused',
    'rul.publish_title': 'Publish a new version',
    'rul.publish_note': 'What changed and why (for example the circular it follows)',
    'rul.publish_hint': 'Recorded in the version history and the audit trail. Publishing cannot be undone, but you can publish another version.',
    'rul.publish_btn': 'Publish version {n}',
    'rul.publish_confirm': 'Publish rulebook version {n}? New applications will follow it from now on{open}.',
    'rul.publish_confirm_open': ', and the due dates of open applications will be recomputed',
    'rul.publish_done': 'Rulebook version {n} published.',
    'rul.publish_need_note': 'Write the note (at least 5 characters) before publishing.',
    'rul.bureau_only': 'You can edit a draft and preview its impact. Only the administrator can publish a new version.',
    'rul.yes': 'Yes',
    'rul.no': 'No',
    'rul.sec_path.app_types': 'Route',
    'rul.f_route_changed': 'Route: {label}',
  },
  hi: {
    'rul.title': 'नियम-पुस्तिका',
    'rul.subtitle': 'समय-सीमाएँ, अनुस्मारक, वृद्धि और मार्ग कोड नहीं, डेटा हैं। यहाँ बदलें, खुले मामलों पर प्रभाव का पूर्वावलोकन करें, फिर नया संस्करण प्रकाशित करें।',
    'rul.in_force': 'लागू संस्करण',
    'rul.version_n': 'संस्करण {n}',
    'rul.published_by': 'प्रकाशित करने वाले',
    'rul.published_on': 'प्रकाशन तिथि',
    'rul.open_on_version': 'इस संस्करण पर अब भी {n} खुले आवेदन हैं',
    'rul.initial': 'प्रारंभिक नियम-पुस्तिका (सिस्टम)',
    'rul.versions': 'संस्करण इतिहास',
    'rul.col_version': 'संस्करण',
    'rul.col_note': 'टिप्पणी',
    'rul.col_by': 'प्रकाशित करने वाले',
    'rul.col_at': 'प्रकाशन तिथि',
    'rul.col_open_flag': 'खुले मामलों पर लागू',
    'rul.col_open': 'इस पर खुले आवेदन',
    'rul.editor': 'मसौदा संपादित करें',
    'rul.draft_banner': 'लिंक से मसौदा लोड हुआ: ईवीसी पूर्णता 21 दिन और "खुले आवेदनों पर लागू करें" चालू। कुछ भी प्रकाशित करने से पहले नीचे पूर्वावलोकन प्रभाव दिखाता है।',
    'rul.sec_sla': 'चरण की समय-सीमा (दिन)',
    'rul.sla.SCRUTINY': 'संवीक्षा',
    'rul.sla.RETURNED': 'संस्था के उत्तर की अवधि',
    'rul.sla.EVC_SCHEDULE': 'ईवीसी दौरे की तिथि तय करना',
    'rul.sla.EVC_COMPLETE': 'ईवीसी दौरा और रिपोर्ट पूर्ण करना',
    'rul.sla.EVC_COMPLETE_NEW': 'नई संस्था के लिए ईवीसी',
    'rul.sla.COMMITTEE': 'एसएसी/एसएचसी की अनुशंसा',
    'rul.sla.DECISION': 'अंतिम निर्णय',
    'rul.sla.VERIFY': 'साक्ष्य या नवीनीकरण का सत्यापन',
    'rul.sec_alerts': 'अनुस्मारक और वृद्धि',
    'rul.f_approach_days': 'समय-सीमा से पहले धारक को अनुस्मारक (दिन)',
    'rul.f_esc_aicte': 'एआईसीटीई-पक्ष के मामले: नियत तिथि के कितने दिन बाद स्तर 1, 2 और 3',
    'rul.f_esc_inst': 'संस्था-पक्ष के मामले: नियत तिथि के कितने दिन बाद स्तर 1, 2 और 3',
    'rul.level_n': 'स्तर {n}',
    'rul.f_rem_undertaking': 'वचनबद्धता अनुस्मारक (नियत तिथि से कितने दिन पहले)',
    'rul.f_rem_document': 'दस्तावेज़ समाप्ति अनुस्मारक (समाप्ति से कितने दिन पहले)',
    'rul.f_rem_reply': 'कमी के उत्तर के अनुस्मारक (नियत तिथि से कितने दिन पहले)',
    'rul.list_hint': 'अल्पविराम से अलग पूर्ण संख्याएँ, जैसे 30, 15, 7, 1',
    'rul.sec_evc': 'विशेषज्ञ दौरा (ईवीसी) की सेटिंग',
    'rul.f_evc_min_notice_days': 'दौरे से पहले न्यूनतम सूचना (दिन)',
    'rul.f_evc_panel_size': 'पैनल का आकार (सदस्य)',
    'rul.f_evc_exclude_same_state': 'संस्था के अपने राज्य के विशेषज्ञ बाहर रखें',
    'rul.sec_docs': 'दस्तावेज़ और सूचनाएँ',
    'rul.f_expiring_window_days': 'दस्तावेज़ इतने दिनों में समाप्त होने पर "शीघ्र समाप्त" माना जाए (दिन)',
    'rul.f_compliance_notice_level': 'जिस वृद्धि स्तर पर अनुपालन सूचना पत्र जारी हो',
    'rul.sec_routes': 'प्रत्येक आवेदन प्रकार का मार्ग',
    'rul.f_routes_hint': 'मार्ग चरणों के निर्धारित क्रम हैं; हर मार्ग अंतिम निर्णय पर समाप्त होता है।',
    'rul.advanced': 'उन्नत: पूरी नियम-पुस्तिका JSON के रूप में संपादित करें',
    'rul.advanced_hint': 'इससे कमी-कोड और प्रत्येक मार्ग के चरण भी बदले जा सकते हैं। फ़ॉर्म पर लौटने के लिए इसे बंद करें।',
    'rul.json_label': 'नियम-पुस्तिका JSON',
    'rul.json_error': 'JSON पढ़ा नहीं जा सका: {msg}',
    'rul.list_error': 'चिह्नित सूचियाँ जाँचें: अल्पविराम से अलग पूर्ण संख्याएँ लिखें।',
    'rul.apply_open': 'खुले आवेदनों पर भी लागू करें (उनकी नियत तिथियाँ पुनः गणना होंगी)',
    'rul.preview': 'प्रभाव का पूर्वावलोकन',
    'rul.reset': 'लागू संस्करण पर वापस जाएँ',
    'rul.prev_title': 'पूर्वावलोकन: क्या बदलेगा',
    'rul.prev_none': 'लागू संस्करण से कोई अंतर नहीं।',
    'rul.col_setting': 'सेटिंग',
    'rul.col_was': 'अभी',
    'rul.col_new': 'बन जाएगा',
    'rul.impact_title': 'खुले मामलों पर प्रभाव',
    'rul.imp_affected': 'प्रभावित खुले मामले',
    'rul.imp_overdue': 'अतिदेय हो जाएँगे',
    'rul.imp_approaching': 'शीघ्र नियत हो जाएँगे',
    'rul.imp_evc_late': 'ईवीसी निर्धारण जो विलंबित हो जाएगा',
    'rul.imp_open_items': 'कुल खुले मामले',
    'rul.applies_open': 'खुले और नए, दोनों आवेदनों पर लागू',
    'rul.applies_new': 'केवल नए आवेदनों पर लागू',
    'rul.examples': 'बदली नियत तिथियों के उदाहरण',
    'rul.col_ref': 'आवेदन',
    'rul.col_inst': 'संस्था',
    'rul.col_stage': 'चरण',
    'rul.col_old_due': 'अभी नियत',
    'rul.col_new_due': 'नियत होगी',
    'rul.prev_error': 'मसौदा स्वीकार नहीं हुआ',
    'rul.publish_title': 'नया संस्करण प्रकाशित करें',
    'rul.publish_note': 'क्या बदला और क्यों (जैसे किस परिपत्र के अनुसार)',
    'rul.publish_hint': 'संस्करण इतिहास और ऑडिट ट्रेल में दर्ज होगा। प्रकाशन वापस नहीं लिया जा सकता, पर आप दूसरा संस्करण प्रकाशित कर सकते हैं।',
    'rul.publish_btn': 'संस्करण {n} प्रकाशित करें',
    'rul.publish_confirm': 'नियम-पुस्तिका संस्करण {n} प्रकाशित करें? नए आवेदन अब इसी का पालन करेंगे{open}।',
    'rul.publish_confirm_open': ', और खुले आवेदनों की नियत तिथियाँ पुनः गणना की जाएँगी',
    'rul.publish_done': 'नियम-पुस्तिका संस्करण {n} प्रकाशित हो गया।',
    'rul.publish_need_note': 'प्रकाशित करने से पहले टिप्पणी लिखें (कम से कम 5 अक्षर)।',
    'rul.bureau_only': 'आप मसौदा संपादित कर उसके प्रभाव का पूर्वावलोकन कर सकते हैं। नया संस्करण केवल प्रशासक प्रकाशित कर सकता है।',
    'rul.yes': 'हाँ',
    'rul.no': 'नहीं',
    'rul.sec_path.app_types': 'मार्ग',
    'rul.f_route_changed': 'मार्ग: {label}',
  },
});

const { user } = await initPage({
  roles: ['admin', 'bureau'],
  active: 'rules',
  title: 'rul.title',
  subtitle: 'rul.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'staff/dashboard.html' }, { label: 'nav.rules' }],
});

const isAdmin = user.role === 'admin';
const SLA_KEYS = ['SCRUTINY', 'RETURNED', 'EVC_SCHEDULE', 'EVC_COMPLETE', 'EVC_COMPLETE_NEW', 'COMMITTEE', 'DECISION', 'VERIFY'];

let data = null; // GET /rules
let draft = null; // working copy of rules (form mode)
let advanced = false;
let jsonText = '';
let applyOpen = false;
let preview = null; // {res, applyOpen} | {error}
let badLists = new Set();
let fromLink = false;

const clone = (o) => JSON.parse(JSON.stringify(o));
const getAt = (o, path) => path.reduce((a, k) => (a == null ? undefined : a[k]), o);
function setAt(o, path, v) {
  let cur = o;
  path.slice(0, -1).forEach((k) => { if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {}; cur = cur[k]; });
  cur[path[path.length - 1]] = v;
}

/* ---------------------------------------------------------------- current version + history */
const byName = (rv) => (rv.published_by ? rv.published_by.name : t('rul.initial'));
const yesNo = (v) => (v ? t('rul.yes') : t('rul.no'));

function renderCurrent() {
  const cur = data.current;
  const openOnCur = (data.versions.find((v) => v.version === cur.version) || {}).open_applications || 0;
  const box = $('#current');
  box.hidden = false;
  const verBox = el('div');
  mount(box, el('div', { class: 'grid g-1-2' },
    el('div', { class: 'card accent-top accent-green' },
      el('div', { class: 'card-head' }, el('h2', {}, t('rul.in_force'))),
      el('div', { class: 'card-body' },
        el('div', { style: { fontSize: '2.2rem', fontWeight: '800', lineHeight: '1' } }, t('rul.version_n', { n: cur.version })),
        el('p', { class: 'mt-2' }, cur.note),
        el('div', { class: 'small text-2' }, `${t('rul.published_by')}: ${byName(cur)}`),
        el('div', { class: 'small text-2' }, `${t('rul.published_on')}: ${fmtDateTime(cur.published_at)}`),
        el('div', { class: 'small text-2 mt-1' }, t('rul.open_on_version', { n: openOnCur })))),
    el('div', { class: 'card' }, el('div', { class: 'card-head' }, el('h2', {}, t('rul.versions'))), verBox)));
  renderTable(verBox, {
    columns: [
      { key: 'version', label: t('rul.col_version'), render: (v) => `<strong>${esc(v.version)}</strong>${v.version === cur.version ? ` <span class="badge b-success">${esc(t('rul.in_force'))}</span>` : ''}` },
      { key: 'note', label: t('rul.col_note'), render: (v) => `<div style="max-width:340px">${esc(v.note)}</div>` },
      { key: 'by', label: t('rul.col_by'), render: (v) => esc(byName(v)) },
      { key: 'at', label: t('rul.col_at'), render: (v) => `<span style="white-space:nowrap">${esc(fmtDate(v.published_at))}</span>` },
      { key: 'apply_to_open', label: t('rul.col_open_flag'), align: 'center', render: (v) => esc(yesNo(v.apply_to_open)) },
      { key: 'open_applications', label: t('rul.col_open'), align: 'right', render: (v) => esc(v.open_applications) },
    ],
    rows: data.versions,
    compact: true,
  });
}

/* ---------------------------------------------------------------- editor form */
function num(path, label, hint) {
  const id = `r-${path.join('-')}`;
  const v = getAt(draft, path);
  return field(id, label, inputEl(id, {
    type: 'number', value: v ?? '', attrs: { min: '0', step: '1', inputmode: 'numeric' },
    onInput: (x) => setAt(draft, path, x === '' ? '' : Number(x)),
  }), hint);
}

function list(path, label) {
  const id = `r-${path.join('-')}`;
  const input = inputEl(id, { value: (getAt(draft, path) || []).join(', '), attrs: { inputmode: 'numeric' } });
  const key = path.join('.');
  input.addEventListener('input', () => {
    const parts = input.value.split(',').map((s) => s.trim()).filter((s) => s !== '');
    const nums = parts.map(Number);
    if (parts.length && nums.every((n) => Number.isInteger(n) && n >= 0)) {
      setAt(draft, path, nums); badLists.delete(key); input.classList.remove('invalid');
    } else {
      badLists.add(key); input.classList.add('invalid');
    }
  });
  return field(id, label, input, t('rul.list_hint'));
}

function triple(path, label) {
  const vals = getAt(draft, path) || [0, 0, 0];
  const gid = `r-${path.join('-')}`;
  const inputs = [0, 1, 2].map((i) => {
    const id = `${gid}-${i}`;
    return field(id, t('rul.level_n', { n: i + 1 }), inputEl(id, {
      type: 'number', value: vals[i] ?? '', attrs: { min: '0', step: '1', inputmode: 'numeric' },
      onInput: (x) => { const arr = [...(getAt(draft, path) || [0, 0, 0])]; arr[i] = x === '' ? '' : Number(x); setAt(draft, path, arr); },
    }));
  });
  return el('fieldset', { class: 'wide', style: { border: '0', padding: '0', margin: '0', minWidth: '0' } },
    el('legend', { class: 'label', style: { padding: '0', marginBottom: '6px' } }, label), el('div', { class: 'triple' }, inputs));
}

function group(legend, ...children) {
  return el('fieldset', { class: 'rule-group' }, el('legend', {}, legend), ...children);
}

function renderEditor() {
  $('#editor-card').hidden = false;
  $('#editor-title').textContent = t('rul.editor');
  const form = $('#editor');
  $('#draft-banner').replaceChildren(...(fromLink ? [el('div', { class: 'alert info draft-banner' }, el('span', { class: 'icon', html: icon('info', 18) }), el('div', {}, t('rul.draft_banner')))] : []));
  const parts = [];

  // advanced toggle always on top
  const adv = checkEl('r-advanced', t('rul.advanced'), advanced, (on) => {
    if (on) {
      jsonText = JSON.stringify(draft, null, 2);
      advanced = true;
    } else {
      try { draft = JSON.parse($('#r-json').value); advanced = false; badLists.clear(); } catch (e) { toast(t('rul.json_error', { msg: e.message }), 'error'); $('#r-advanced').checked = true; return; }
    }
    renderEditor();
  });
  parts.push(el('div', { class: 'mb-2' }, adv, el('div', { class: 'hint' }, t('rul.advanced_hint'))));

  if (advanced) {
    const ta = el('textarea', { class: 'textarea json-area', id: 'r-json', rows: 22, spellcheck: 'false' });
    ta.value = jsonText;
    ta.addEventListener('input', () => { jsonText = ta.value; });
    parts.push(field('r-json', t('rul.json_label'), ta));
  } else {
    parts.push(
      group(t('rul.sec_sla'), el('div', { class: 'rule-grid' }, SLA_KEYS.filter((k) => getAt(draft, ['sla_days', k]) !== undefined).map((k) => num(['sla_days', k], t(`rul.sla.${k}`))))),
      group(t('rul.sec_alerts'), el('div', { class: 'rule-grid' },
        num(['approach_days'], t('rul.f_approach_days')),
        triple(['escalation_days', 'aicte'], t('rul.f_esc_aicte')),
        triple(['escalation_days', 'institution'], t('rul.f_esc_inst')),
        list(['reminders', 'undertaking'], t('rul.f_rem_undertaking')),
        list(['reminders', 'document'], t('rul.f_rem_document')),
        list(['reminders', 'reply'], t('rul.f_rem_reply')))),
      group(t('rul.sec_evc'), el('div', { class: 'rule-grid' },
        num(['evc_min_notice_days'], t('rul.f_evc_min_notice_days')),
        num(['evc_panel_size'], t('rul.f_evc_panel_size')),
        el('div', { class: 'field' }, el('span', { class: 'label', 'aria-hidden': 'true', html: '&nbsp;' }),
          checkEl('r-evc-same', t('rul.f_evc_exclude_same_state'), !!draft.evc_exclude_same_state, (v) => { draft.evc_exclude_same_state = v; })))),
      group(t('rul.sec_docs'), el('div', { class: 'rule-grid' },
        num(['expiring_window_days'], t('rul.f_expiring_window_days')),
        num(['compliance_notice_level'], t('rul.f_compliance_notice_level')))),
      group(t('rul.sec_routes'), el('p', { class: 'muted small mt-0' }, t('rul.f_routes_hint')), el('div', { class: 'rule-grid' },
        Object.keys(draft.app_types || {}).map((k) => {
          const id = `r-route-${k}`;
          const sel = el('select', { class: 'select', id });
          for (const [rk, rv] of Object.entries(draft.routes || {})) {
            const o = el('option', { value: rk }, `${tl(rv.label)}`);
            if (rk === draft.app_types[k].route) o.selected = true;
            sel.appendChild(o);
          }
          sel.addEventListener('change', () => { draft.app_types[k].route = sel.value; });
          return field(id, tl(draft.app_types[k].label), sel);
        }))));
  }

  const open = checkEl('r-apply-open', t('rul.apply_open'), applyOpen, (v) => { applyOpen = v; });
  parts.push(el('div', { class: 'editor-actions' },
    el('button', { class: 'btn', type: 'button', id: 'r-preview', html: `${icon('eye', 16)} ${esc(t('rul.preview'))}`, onclick: (e) => runPreview(e.currentTarget) }),
    el('button', { class: 'btn secondary', type: 'button', html: `${icon('refresh', 16)} ${esc(t('rul.reset'))}`, onclick: resetDraft }),
    open));
  mount(form, parts);
  form.onsubmit = (e) => e.preventDefault();
}

function resetDraft() {
  draft = clone(data.current.rules);
  advanced = false; badLists.clear(); preview = null; fromLink = false; applyOpen = false;
  renderEditor(); renderPreview();
}

function currentRules() {
  if (advanced) return JSON.parse($('#r-json').value);
  return draft;
}

/* ---------------------------------------------------------------- preview */
const SEC_PATH = {
  sla_days: (k) => `${t('rul.sec_sla')}: ${t(`rul.sla.${k}`, { _default: k })}`,
  escalation_days: (k) => `${k === 'aicte' ? t('rul.f_esc_aicte') : t('rul.f_esc_inst')}`,
  reminders: (k) => t(`rul.f_rem_${k}`, { _default: k }),
};

function pathLabel(path) {
  const [a, b, c] = path.split('.');
  if (SEC_PATH[a] && b) return SEC_PATH[a](b);
  if (a === 'app_types' && b) {
    const lbl = (draft?.app_types?.[b] || data.current.rules.app_types?.[b])?.label;
    return t('rul.f_route_changed', { label: lbl ? tl(lbl) : b });
  }
  return t(`rul.f_${path}`, { _default: path });
}

function valueText(path, v) {
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'boolean') return yesNo(v);
  if (path.endsWith('.route')) {
    const r = (draft?.routes || data.current.rules.routes)?.[v];
    return r ? tl(r.label) : String(v);
  }
  return v === null || v === undefined ? '—' : String(v);
}

function renderPreview() {
  const box = $('#preview');
  if (!preview) { mount(box); return; }
  if (preview.error) {
    mount(box, el('div', { class: 'alert danger' }, el('span', { class: 'icon', html: icon('alert-circle', 20) }),
      el('div', {}, el('div', { class: 'a-title' }, t('rul.prev_error')), preview.error)));
    return;
  }
  const { changes, impact } = preview.res;
  const chBox = el('div');
  const exBox = el('div');
  const tiles = el('div', { class: 'impact-grid' },
    kpi({ label: t('rul.imp_affected'), value: fmtNum(impact.affected_open), color: 'info', iconName: 'layers' }),
    kpi({ label: t('rul.imp_overdue'), value: fmtNum(impact.newly_overdue), color: impact.newly_overdue ? 'danger' : 'success', iconName: 'alert' }),
    kpi({ label: t('rul.imp_approaching'), value: fmtNum(impact.newly_approaching), color: impact.newly_approaching ? 'warning' : 'success', iconName: 'clock' }),
    kpi({ label: t('rul.imp_evc_late'), value: fmtNum(impact.evc_newly_late_to_schedule), color: impact.evc_newly_late_to_schedule ? 'orange' : 'success', iconName: 'calendar' }),
    kpi({ label: t('rul.imp_open_items'), value: fmtNum(impact.open_items), color: 'slate', iconName: 'list' }));
  mount(box, el('div', { class: 'card accent-top accent-saffron' },
    el('div', { class: 'card-head' }, el('h2', {}, t('rul.prev_title')), el('span', { class: 'badge b-info' }, preview.applyOpen ? t('rul.applies_open') : t('rul.applies_new'))),
    el('div', { class: 'card-body' },
      chBox,
      el('h3', { style: { margin: '18px 0 10px', fontSize: '1rem' } }, t('rul.impact_title')),
      tiles,
      (impact.examples || []).length ? [el('h3', { style: { margin: '6px 0 8px', fontSize: '.95rem' } }, t('rul.examples')), exBox] : null)));
  renderTable(chBox, {
    columns: [
      { key: 'path', label: t('rul.col_setting'), render: (c) => `<span class="change-path">${esc(pathLabel(c.path))}</span><div class="cell-sub mono">${esc(c.path)}</div>` },
      { key: 'old', label: t('rul.col_was'), render: (c) => `<span class="val-old">${esc(valueText(c.path, c.old))}</span>` },
      { key: 'new', label: t('rul.col_new'), render: (c) => `<span class="val-new">${esc(valueText(c.path, c.new))}</span>` },
    ],
    rows: changes,
    empty: { icon: 'check-circle', title: t('rul.prev_none') },
    compact: true,
  });
  if ((impact.examples || []).length) {
    renderTable(exBox, {
      columns: [
        { key: 'ref_no', label: t('rul.col_ref'), render: (x) => `<span class="mono">${esc(x.ref_no)}</span>` },
        { key: 'institution', label: t('rul.col_inst'), render: (x) => esc(x.institution) },
        { key: 'stage', label: t('rul.col_stage'), render: (x) => esc(t(`stage.${x.stage}`, { _default: x.stage })) },
        { key: 'old_due', label: t('rul.col_old_due'), render: (x) => esc(fmtDate(x.old_due)) },
        { key: 'new_due', label: t('rul.col_new_due'), render: (x) => `<strong>${esc(fmtDate(x.new_due))}</strong>` },
      ],
      rows: impact.examples,
      compact: true,
    });
  }
}

async function runPreview(btn) {
  let rules;
  try {
    rules = currentRules();
  } catch (e) {
    preview = { error: t('rul.json_error', { msg: e.message }) }; renderPreview(); return;
  }
  if (!advanced && badLists.size) { preview = { error: t('rul.list_error') }; renderPreview(); return; }
  try {
    const res = await withBusy(btn, () => api.post('/rules/preview', { rules, apply_to_open: applyOpen }));
    preview = { res, applyOpen };
  } catch (e) {
    preview = { error: e.message };
  }
  renderPreview();
  $('#preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------------------------------------------------------------- publish (admin) */
function renderPublish() {
  const card = $('#publish-card');
  card.hidden = false;
  $('#publish-title').textContent = t('rul.publish_title');
  const body = $('#publish-body');
  if (!isAdmin) {
    mount(body, el('div', { class: 'alert info' }, el('span', { class: 'icon', html: icon('info', 18) }), el('div', {}, t('rul.bureau_only'))));
    return;
  }
  const next = data.current.version + 1;
  const note = el('textarea', { class: 'textarea', id: 'p-note', rows: 3 });
  const err = el('div', { class: 'error', style: { fontSize: '.85rem', color: 'var(--as-danger)', fontWeight: '500' }, hidden: true }, t('rul.publish_need_note'));
  mount(body, el('div', { class: 'stack' },
    field('p-note', t('rul.publish_note'), note, t('rul.publish_hint')), err,
    el('div', {}, el('button', { class: 'btn saffron', type: 'button', html: `${icon('upload', 16)} ${esc(t('rul.publish_btn', { n: next }))}`, onclick: (e) => publish(e.currentTarget, note, err, next) }))));
}

async function publish(btn, note, err, next) {
  err.hidden = true;
  let rules;
  try { rules = currentRules(); } catch (e) { toast(t('rul.json_error', { msg: e.message }), 'error'); return; }
  if (!advanced && badLists.size) { toast(t('rul.list_error'), 'error'); return; }
  if (note.value.trim().length < 5) { err.hidden = false; note.focus(); return; }
  const ok = await confirmDialog(t('rul.publish_confirm', { n: next, open: applyOpen ? t('rul.publish_confirm_open') : '' }), { title: t('rul.publish_title'), confirmLabel: t('rul.publish_btn', { n: next }), variant: 'primary' });
  if (!ok) return;
  try {
    const rv = await withBusy(btn, () => api.post('/rules/publish', { rules, note: note.value.trim(), apply_to_open: applyOpen }));
    toast(t('rul.publish_done', { n: rv.version ?? next }), 'success');
    preview = null; fromLink = false;
    await load();
  } catch (e) {
    toast(e.message, 'error');
  }
}

/* ---------------------------------------------------------------- load */
function renderAll() {
  if (!data) return;
  renderCurrent();
  renderEditor();
  renderPreview();
  renderPublish();
}

async function load(first = false) {
  if (first) loading($('#state'));
  try {
    data = await api.get('/rules');
    mount($('#state'));
    draft = clone(data.current.rules);
    advanced = false; badLists.clear();
    if (first && getParam('draft') === 'evc21') {
      draft.sla_days.EVC_COMPLETE = 21;
      applyOpen = true;
      fromLink = true;
    } else {
      applyOpen = false; fromLink = false;
    }
    renderAll();
    if (first && fromLink) await runPreview(null);
  } catch (err) {
    errorState($('#state'), err, () => load(first));
  }
}

onLang(() => {
  if (!data) return;
  // keep what the user typed in advanced mode and in the draft
  if (advanced && $('#r-json')) jsonText = $('#r-json').value;
  renderAll();
});
await load(true);
