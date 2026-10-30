// Workflow action dialogs of the case workspace. Every dialog posts to the API, then hands the returned AppDetail
// back to the page through ctx.onDone(detail, tabKey, message). Server refusals are shown as toasts (modal keeps open).
import { api } from '../assets/js/api.js';
import { t, tl, extend } from '../assets/js/i18n.js';
import { el, esc, icon, modal, loading, errorState, fmtDate, severityBadge } from '../assets/js/ui.js';
import {
  field, input, textarea, select, errorLine, pick, discLabel, stateName, reasonText, roleLabel,
} from './casekit.js';

extend({
  en: {
    'act.complete': 'Complete scrutiny',
    'act.complete.intro': 'You are confirming that scrutiny of this application is complete. The case will move automatically to: {next}.',
    'act.complete.warn': 'The automatic pre-check found items you may want to look at first:',
    'act.complete.note': 'Scrutiny note (optional)',
    'act.complete.done': 'Scrutiny completed: the case moved to the next stage',
    'act.return': 'Return to institution',
    'act.return.intro': 'Select what is missing. A deficiency letter is issued automatically, the AICTE stage clock pauses and the institution gets a window to reply.',
    'act.return.items': 'Deficiencies',
    'act.return.item_text': 'Detail for the institution (optional)',
    'act.return.reason': 'Reason for returning',
    'act.return.reason_hint': 'Written to the institution in the letter (at least 5 characters).',
    'act.return.days': 'Reply period (days)',
    'act.return.days_hint': 'Between 1 and 60 days.',
    'act.return.pick_one': 'Select at least one deficiency.',
    'act.return.days_bad': 'The reply period must be between 1 and 60 days.',
    'act.return.confirm': 'Return application',
    'act.return.done': 'Returned to the institution: letter issued, stage clock paused',
    'act.revert': 'Send back to an earlier stage',
    'act.revert.intro': 'The case returns to an earlier stage of its route and is placed in that stage\'s queue again.',
    'act.revert.stage': 'Send back to',
    'act.revert.reason': 'Reason for sending it back',
    'act.revert.reason_hint': 'At least 5 characters. It is recorded in the case notes and the audit trail.',
    'act.revert.evc_warn': 'The scheduled expert visit will be cancelled.',
    'act.revert.confirm': 'Send back',
    'act.revert.done': 'Sent back to: {stage}',
    'act.evc': 'Schedule expert visit',
    'act.evc.resched': 'Reschedule expert visit',
    'act.evc.loading': 'Asking the scheduling assistant…',
    'act.evc.sug': 'Suggested by the scheduling assistant',
    'act.evc.sug_line': 'Earliest common free date: {date}. Schedule by {by}; visit to be completed by {done}.',
    'act.evc.sug_late': 'The earliest free date is after the complete-by date, so an override reason will be needed.',
    'act.evc.sug_none': 'The assistant could not find a date on which a full panel is free. Choose the panel and date yourself.',
    'act.evc.convener': 'Convener',
    'act.evc.use': 'Use the suggestion',
    'act.evc.excluded': 'Excluded automatically (conflict of interest)',
    'act.evc.excluded_none': 'No expert was excluded.',
    'act.evc.considered': '{n} experts were considered; discipline needed: {disc}.',
    'act.evc.date': 'Visit date',
    'act.evc.date_hint': 'Complete-by date: {date}.',
    'act.evc.panel': 'Panel',
    'act.evc.panel_count': 'Selected {n} of {size}',
    'act.evc.col_pick': 'Pick',
    'act.evc.col_expert': 'Expert',
    'act.evc.col_disc': 'Discipline',
    'act.evc.col_state': 'Home state',
    'act.evc.col_visits': 'Visits (60 days)',
    'act.evc.col_next': 'Next visit',
    'act.evc.col_conv': 'Convener',
    'act.evc.col_flags': 'Checks',
    'act.evc.suggested': 'Suggested',
    'act.evc.conflict': 'Conflict of interest',
    'act.evc.unavailable': 'Unavailable on this date',
    'act.evc.override': 'Reason for overriding',
    'act.evc.override_hint': 'Needed only if you pick an expert with a conflict, a date outside the allowed window or with too little notice. It is recorded in the audit trail.',
    'act.evc.err_date': 'Choose the visit date.',
    'act.evc.err_panel': 'Choose exactly {size} experts for the panel.',
    'act.evc.err_conv': 'Choose a senior expert from the panel as convener.',
    'act.evc.err_conflict': 'These need an override reason: {list}',
    'act.evc.err_late': 'the date is after the complete-by date ({date})',
    'act.evc.confirm': 'Schedule visit',
    'act.evc.done': 'Expert visit scheduled: intimation letter issued',
    'act.report': 'File EVC report',
    'act.report.visit': 'Visit held on {date}; panel convener files the report.',
    'act.report.rec': 'Recommendation',
    'act.report.findings': 'Findings',
    'act.report.findings_hint': 'At least 10 characters.',
    'act.report.conditions': 'Proposed conditions',
    'act.report.conditions_hint': 'Required when you recommend with conditions. Each becomes a tracked undertaking if the authority approves with conditions.',
    'act.report.confirm': 'File report',
    'act.report.done': 'EVC report filed: the case moved to the next stage',
    'act.committee': 'Record committee recommendation',
    'act.committee.which': 'Committee',
    'act.committee.date': 'Meeting date',
    'act.committee.date_hint': 'The date cannot be in the future.',
    'act.committee.rec': 'Recommendation',
    'act.committee.remarks': 'Remarks',
    'act.committee.remarks_hint': 'At least 5 characters.',
    'act.committee.confirm': 'Record recommendation',
    'act.committee.done': 'Committee recommendation recorded: the case moved to the decision stage',
    'act.decide': 'Record decision',
    'act.decide.intro': 'This is the final decision of the competent authority. It closes the application and issues a signed letter to the institution.',
    'act.decide.context': 'What the recommending bodies said',
    'act.decide.ctx_none': 'No EVC report or committee recommendation is on record for this application.',
    'act.decide.ctx_evc': 'EVC',
    'act.decide.ctx_com': 'Committee',
    'act.decide.outcome': 'Decision',
    'act.decide.remarks': 'Remarks',
    'act.decide.remarks_reject': 'Reasons for rejection',
    'act.decide.remarks_hint': 'Shown to the institution in the letter.',
    'act.decide.conds': 'Undertakings (conditions)',
    'act.decide.conds_hint': 'Each condition becomes a tracked undertaking; its due date is counted from today.',
    'act.decide.confirm': 'Record decision',
    'act.decide.done': 'Decision recorded: signed letter issued',
    'act.decide.pick': 'Choose a decision.',
    'act.decide.remarks_needed': 'Please write the reasons for rejection (at least 5 characters).',
    'act.reassign': 'Reassign case',
    'act.reassign.intro': 'Move this case to another officer who can hold the current stage.',
    'act.reassign.to': 'New holder',
    'act.reassign.open': '{n} open',
    'act.reassign.current': 'current holder',
    'act.reassign.reason': 'Reason for reassigning',
    'act.reassign.reason_hint': 'At least 5 characters. Recorded in the audit trail.',
    'act.reassign.confirm': 'Reassign',
    'act.reassign.done': 'Case reassigned',
    'act.reassign.pick': 'Choose an officer.',
    'act.cond.item': 'Condition {n}',
    'act.cond.text': 'Condition text',
    'act.cond.category': 'Category',
    'act.cond.days': 'Due in (days)',
    'act.cond.add': 'Add a condition',
    'act.cond.remove_short': 'Remove',
    'act.cond.remove': 'Remove condition {n}',
    'act.cond.need_one': 'Add at least one condition.',
    'act.cond.days_bad': 'Each condition needs a due period of 1 to 730 days.',
    'act.reason_short': 'Please write at least {n} characters in "{field}".',
    'act.committee.SAC': 'SAC',
    'act.committee.SHC': 'SHC',
    'act.sev_note': 'These are system findings, not decisions.',
  },
  hi: {
    'act.complete': 'संवीक्षा पूर्ण करें',
    'act.complete.intro': 'आप पुष्टि कर रहे हैं कि इस आवेदन की संवीक्षा पूर्ण हो गई है। मामला स्वतः अगले चरण में जाएगा: {next}।',
    'act.complete.warn': 'स्वचालित पूर्व-जाँच में ये बिंदु मिले हैं, जिन्हें आप पहले देखना चाहेंगे:',
    'act.complete.note': 'संवीक्षा टिप्पणी (वैकल्पिक)',
    'act.complete.done': 'संवीक्षा पूर्ण: मामला अगले चरण में गया',
    'act.return': 'संस्था को लौटाएँ',
    'act.return.intro': 'जो अनुपलब्ध है उसे चुनें। कमी पत्र स्वतः जारी होगा, एआईसीटीई की चरण-घड़ी रुक जाएगी और संस्था को उत्तर देने की अवधि मिलेगी।',
    'act.return.items': 'कमियाँ',
    'act.return.item_text': 'संस्था के लिए विवरण (वैकल्पिक)',
    'act.return.reason': 'लौटाने का कारण',
    'act.return.reason_hint': 'पत्र में संस्था को लिखा जाएगा (कम से कम 5 अक्षर)।',
    'act.return.days': 'उत्तर की अवधि (दिन)',
    'act.return.days_hint': '1 से 60 दिनों के बीच।',
    'act.return.pick_one': 'कम से कम एक कमी चुनें।',
    'act.return.days_bad': 'उत्तर की अवधि 1 से 60 दिनों के बीच होनी चाहिए।',
    'act.return.confirm': 'आवेदन लौटाएँ',
    'act.return.done': 'संस्था को लौटाया गया: पत्र जारी, चरण-घड़ी रुकी',
    'act.revert': 'पिछले चरण में वापस भेजें',
    'act.revert.intro': 'मामला अपने मार्ग के किसी पिछले चरण में लौटेगा और उस चरण की कतार में फिर से रखा जाएगा।',
    'act.revert.stage': 'वापस भेजें',
    'act.revert.reason': 'वापस भेजने का कारण',
    'act.revert.reason_hint': 'कम से कम 5 अक्षर। यह मामले की टिप्पणियों और ऑडिट ट्रेल में दर्ज होगा।',
    'act.revert.evc_warn': 'निर्धारित विशेषज्ञ दौरा रद्द हो जाएगा।',
    'act.revert.confirm': 'वापस भेजें',
    'act.revert.done': 'वापस भेजा गया: {stage}',
    'act.evc': 'विशेषज्ञ दौरा निर्धारित करें',
    'act.evc.resched': 'विशेषज्ञ दौरा पुनः निर्धारित करें',
    'act.evc.loading': 'निर्धारण सहायक से पूछा जा रहा है…',
    'act.evc.sug': 'निर्धारण सहायक का सुझाव',
    'act.evc.sug_line': 'सबसे पहली साझा खाली तिथि: {date}। निर्धारण की अंतिम तिथि {by}; दौरा {done} तक पूर्ण होना है।',
    'act.evc.sug_late': 'सबसे पहली खाली तिथि पूर्णता की अंतिम तिथि के बाद है, इसलिए अधिभावी कारण देना होगा।',
    'act.evc.sug_none': 'सहायक को ऐसी तिथि नहीं मिली जब पूरा पैनल खाली हो। पैनल और तिथि स्वयं चुनें।',
    'act.evc.convener': 'संयोजक',
    'act.evc.use': 'सुझाव अपनाएँ',
    'act.evc.excluded': 'स्वतः बाहर रखे गए (हितों का टकराव)',
    'act.evc.excluded_none': 'किसी विशेषज्ञ को बाहर नहीं रखा गया।',
    'act.evc.considered': '{n} विशेषज्ञों पर विचार हुआ; आवश्यक विषय-क्षेत्र: {disc}।',
    'act.evc.date': 'दौरे की तिथि',
    'act.evc.date_hint': 'पूर्णता की अंतिम तिथि: {date}।',
    'act.evc.panel': 'पैनल',
    'act.evc.panel_count': '{size} में से {n} चुने गए',
    'act.evc.col_pick': 'चुनें',
    'act.evc.col_expert': 'विशेषज्ञ',
    'act.evc.col_disc': 'विषय-क्षेत्र',
    'act.evc.col_state': 'गृह राज्य',
    'act.evc.col_visits': 'दौरे (60 दिन)',
    'act.evc.col_next': 'अगला दौरा',
    'act.evc.col_conv': 'संयोजक',
    'act.evc.col_flags': 'जाँच',
    'act.evc.suggested': 'सुझाया गया',
    'act.evc.conflict': 'हितों का टकराव',
    'act.evc.unavailable': 'इस तिथि पर अनुपलब्ध',
    'act.evc.override': 'अधिभावी (ओवरराइड) का कारण',
    'act.evc.override_hint': 'केवल तब आवश्यक जब आप टकराव वाला विशेषज्ञ, अनुमत सीमा से बाहर की तिथि या कम सूचना अवधि चुनें। यह ऑडिट ट्रेल में दर्ज होगा।',
    'act.evc.err_date': 'दौरे की तिथि चुनें।',
    'act.evc.err_panel': 'पैनल के लिए ठीक {size} विशेषज्ञ चुनें।',
    'act.evc.err_conv': 'पैनल में से एक वरिष्ठ विशेषज्ञ को संयोजक चुनें।',
    'act.evc.err_conflict': 'इनके लिए अधिभावी कारण चाहिए: {list}',
    'act.evc.err_late': 'तिथि पूर्णता की अंतिम तिथि ({date}) के बाद है',
    'act.evc.confirm': 'दौरा निर्धारित करें',
    'act.evc.done': 'विशेषज्ञ दौरा निर्धारित: सूचना पत्र जारी',
    'act.report': 'ईवीसी रिपोर्ट दाखिल करें',
    'act.report.visit': 'दौरा {date} को हुआ; रिपोर्ट पैनल के संयोजक दाखिल करते हैं।',
    'act.report.rec': 'अनुशंसा',
    'act.report.findings': 'निष्कर्ष',
    'act.report.findings_hint': 'कम से कम 10 अक्षर।',
    'act.report.conditions': 'प्रस्तावित शर्तें',
    'act.report.conditions_hint': 'शर्तों सहित अनुशंसा करने पर आवश्यक। प्राधिकारी के सशर्त अनुमोदन पर प्रत्येक शर्त ट्रैक की जाने वाली वचनबद्धता बनती है।',
    'act.report.confirm': 'रिपोर्ट दाखिल करें',
    'act.report.done': 'ईवीसी रिपोर्ट दाखिल: मामला अगले चरण में गया',
    'act.committee': 'समिति की अनुशंसा दर्ज करें',
    'act.committee.which': 'समिति',
    'act.committee.date': 'बैठक की तिथि',
    'act.committee.date_hint': 'तिथि भविष्य की नहीं हो सकती।',
    'act.committee.rec': 'अनुशंसा',
    'act.committee.remarks': 'टिप्पणी',
    'act.committee.remarks_hint': 'कम से कम 5 अक्षर।',
    'act.committee.confirm': 'अनुशंसा दर्ज करें',
    'act.committee.done': 'समिति की अनुशंसा दर्ज: मामला निर्णय चरण में गया',
    'act.decide': 'निर्णय दर्ज करें',
    'act.decide.intro': 'यह सक्षम प्राधिकारी का अंतिम निर्णय है। इससे आवेदन बंद होगा और संस्था को हस्ताक्षरित पत्र जारी होगा।',
    'act.decide.context': 'अनुशंसा करने वाले निकायों ने क्या कहा',
    'act.decide.ctx_none': 'इस आवेदन के लिए कोई ईवीसी रिपोर्ट या समिति अनुशंसा दर्ज नहीं है।',
    'act.decide.ctx_evc': 'ईवीसी',
    'act.decide.ctx_com': 'समिति',
    'act.decide.outcome': 'निर्णय',
    'act.decide.remarks': 'टिप्पणी',
    'act.decide.remarks_reject': 'अस्वीकृति के कारण',
    'act.decide.remarks_hint': 'पत्र में संस्था को दिखाया जाएगा।',
    'act.decide.conds': 'वचनबद्धताएँ (शर्तें)',
    'act.decide.conds_hint': 'प्रत्येक शर्त ट्रैक की जाने वाली वचनबद्धता बनती है; उसकी नियत तिथि आज से गिनी जाती है।',
    'act.decide.confirm': 'निर्णय दर्ज करें',
    'act.decide.done': 'निर्णय दर्ज: हस्ताक्षरित पत्र जारी',
    'act.decide.pick': 'निर्णय चुनें।',
    'act.decide.remarks_needed': 'कृपया अस्वीकृति के कारण लिखें (कम से कम 5 अक्षर)।',
    'act.reassign': 'मामला पुनः नियत करें',
    'act.reassign.intro': 'इस मामले को किसी अन्य अधिकारी को सौंपें जो वर्तमान चरण संभाल सकता हो।',
    'act.reassign.to': 'नया धारक',
    'act.reassign.open': '{n} खुले',
    'act.reassign.current': 'वर्तमान धारक',
    'act.reassign.reason': 'पुनः नियत करने का कारण',
    'act.reassign.reason_hint': 'कम से कम 5 अक्षर। ऑडिट ट्रेल में दर्ज होगा।',
    'act.reassign.confirm': 'पुनः नियत करें',
    'act.reassign.done': 'मामला पुनः नियत किया गया',
    'act.reassign.pick': 'अधिकारी चुनें।',
    'act.cond.item': 'शर्त {n}',
    'act.cond.text': 'शर्त का विवरण',
    'act.cond.category': 'श्रेणी',
    'act.cond.days': 'नियत (दिनों में)',
    'act.cond.add': 'शर्त जोड़ें',
    'act.cond.remove_short': 'हटाएँ',
    'act.cond.remove': 'शर्त {n} हटाएँ',
    'act.cond.need_one': 'कम से कम एक शर्त जोड़ें।',
    'act.cond.days_bad': 'प्रत्येक शर्त की नियत अवधि 1 से 730 दिन होनी चाहिए।',
    'act.reason_short': '"{field}" में कम से कम {n} अक्षर लिखें।',
    'act.committee.SAC': 'एसएसी',
    'act.committee.SHC': 'एसएचसी',
    'act.sev_note': 'ये प्रणाली के निष्कर्ष हैं, निर्णय नहीं।',
  },
});

const today = (ctx) => ctx.meta.today;
const post = async (ctx, path, body, doneKey, tab, vars) => {
  const res = await api.post(`/applications/${ctx.app.id}${path}`, body);
  ctx.onDone(res, tab, t(doneKey, vars));
};
const stepIndex = (app) => app.route_steps.findIndex((s) => s.state === 'current' || s.state === 'returned');

/** Open one of the workflow dialogs. */
export function openAction(kind, ctx) {
  const map = {
    complete_scrutiny: completeScrutiny, return: returnToInstitution, revert, schedule_evc: scheduleEvc,
    evc_report: evcReport, committee: committeeRecord, decide, reassign,
  };
  return map[kind](ctx);
}

export const ACTION_LABEL = {
  complete_scrutiny: 'act.complete', return: 'act.return', revert: 'act.revert', schedule_evc: 'act.evc', evc_report: 'act.report',
  committee: 'act.committee', decide: 'act.decide', reassign: 'act.reassign',
};

/* ------------------------------------------------------------------ complete scrutiny */
function completeScrutiny(ctx) {
  const { app } = ctx;
  const steps = app.route_steps;
  const next = steps[stepIndex(app) + 1];
  const note = textarea({ rows: 3 });
  const flagged = (app.precheck || []).filter((p) => p.severity === 'high' || p.severity === 'medium');
  const body = el('div', { class: 'stack' },
    el('p', { class: 'mb-0' }, t('act.complete.intro', { next: next ? tl(next.label) : '—' })),
    flagged.length ? el('div', { class: 'alert warning' }, el('span', { class: 'icon', html: icon('alert', 18) }),
      el('div', {}, el('div', { class: 'a-title' }, t('act.complete.warn')),
        el('ul', { class: 'list-plain mb-0' }, flagged.map((p) => el('li', { html: `${severityBadge(p.severity)} ${esc(pick(p.en, p.hi))}` }))),
        el('div', { class: 'small' }, t('act.sev_note')))) : null,
    field({ label: t('act.complete.note'), control: note }));
  modal({
    title: t('act.complete'), body,
    actions: [
      { label: t('common.cancel') },
      { label: t('act.complete'), variant: 'success', onClick: () => post(ctx, '/complete', { note: note.value.trim() }, 'act.complete.done', 'overview') },
    ],
  });
}

/* ------------------------------------------------------------------ return */
function returnToInstitution(ctx) {
  const { meta } = ctx;
  const codes = Object.keys(meta.deficiency_codes);
  const err = errorLine();
  const rows = codes.map((code) => {
    const cb = el('input', { type: 'checkbox', name: 'code', value: code, id: `rc-${code}` });
    const txt = input({ type: 'text', id: `rt-${code}`, maxlength: 400, disabled: true, 'aria-label': `${tl(meta.deficiency_codes[code])}: ${t('act.return.item_text')}`, placeholder: t('act.return.item_text') });
    cb.addEventListener('change', () => { txt.disabled = !cb.checked; if (cb.checked) txt.focus(); });
    return { code, cb, txt, node: el('div', { class: 'stack sm' }, el('label', { class: 'check', for: `rc-${code}` }, cb, el('span', {}, el('b', {}, code), ' · ', tl(meta.deficiency_codes[code]))), txt) };
  });
  const reason = textarea({ rows: 3 });
  const days = input({ type: 'number', min: 1, max: 60, value: meta.sla_days.RETURNED });
  const body = el('div', { class: 'stack' },
    el('p', { class: 'mb-0' }, t('act.return.intro')),
    el('fieldset', { class: 'stack', style: { border: 0, padding: 0, margin: 0, minWidth: 0 } },
      el('legend', { class: 'label' }, t('act.return.items')),
      rows.map((r) => r.node)),
    el('div', { class: 'form-grid' },
      field({ label: t('act.return.reason'), control: reason, hint: t('act.return.reason_hint'), required: true, full: true }),
      field({ label: t('act.return.days'), control: days, hint: t('act.return.days_hint'), required: true })),
    err);
  modal({
    title: t('act.return'), body, size: 'wide',
    actions: [
      { label: t('common.cancel') },
      {
        label: t('act.return.confirm'), variant: 'warning', onClick: () => {
          err.hide();
          const items = rows.filter((r) => r.cb.checked).map((r) => ({ code: r.code, text: r.txt.value.trim() }));
          if (!items.length) { err.show(t('act.return.pick_one')); return false; }
          if (reason.value.trim().length < 5) { err.show(t('act.reason_short', { n: 5, field: t('act.return.reason') })); reason.focus(); return false; }
          const d = Number(days.value);
          if (!(d >= 1 && d <= 60)) { err.show(t('act.return.days_bad')); days.focus(); return false; }
          return post(ctx, '/return', { items, reason: reason.value.trim(), reply_days: d }, 'act.return.done', 'deficiencies');
        },
      },
    ],
  });
}

/* ------------------------------------------------------------------ revert */
function revert(ctx) {
  const { app } = ctx;
  const idx = stepIndex(app);
  const earlier = app.route_steps.slice(0, Math.max(idx, 0));
  const to = select(earlier.map((s) => ({ value: s.stage, label: tl(s.label) })));
  const reason = textarea({ rows: 3 });
  const err = errorLine();
  const body = el('div', { class: 'stack' },
    el('p', { class: 'mb-0' }, t('act.revert.intro')),
    app.stage === 'EVC' ? el('div', { class: 'alert warning' }, el('span', { class: 'icon', html: icon('alert', 18) }), el('div', {}, t('act.revert.evc_warn'))) : null,
    field({ label: t('act.revert.stage'), control: to, required: true }),
    field({ label: t('act.revert.reason'), control: reason, hint: t('act.revert.reason_hint'), required: true }),
    err);
  modal({
    title: t('act.revert'), body,
    actions: [
      { label: t('common.cancel') },
      {
        label: t('act.revert.confirm'), variant: 'warning', onClick: () => {
          err.hide();
          if (reason.value.trim().length < 5) { err.show(t('act.reason_short', { n: 5, field: t('act.revert.reason') })); reason.focus(); return false; }
          const label = to.options[to.selectedIndex].textContent;
          return post(ctx, '/revert', { to_stage: to.value, reason: reason.value.trim() }, 'act.revert.done', 'timeline', { stage: label });
        },
      },
    ],
  });
}

/* ------------------------------------------------------------------ conditions editor (EVC report, decision) */
export function conditionsEditor(meta, initial = []) {
  let list = initial.map((c) => ({ text: c.text || '', category: c.category || 'OTHER', due_days: c.due_days || 90 }));
  if (!list.length) list.push({ text: '', category: 'OTHER', due_days: 90 });
  const host = el('div', { class: 'stack' });
  const err = errorLine();
  const cats = Object.keys(meta.ut_categories);

  function read() {
    host.querySelectorAll('[data-row]').forEach((row, i) => {
      list[i] = {
        text: row.querySelector('[data-k=text]').value,
        category: row.querySelector('[data-k=category]').value,
        due_days: row.querySelector('[data-k=days]').value,
      };
    });
  }
  function draw() {
    host.replaceChildren();
    list.forEach((c, i) => {
      const text = input({ type: 'text', maxlength: 500, value: c.text, 'data-k': 'text' });
      const cat = select(cats.map((k) => ({ value: k, label: tl(meta.ut_categories[k]), selected: k === c.category })), { 'data-k': 'category' });
      const days = input({ type: 'number', min: 1, max: 730, value: c.due_days, 'data-k': 'days' });
      host.appendChild(el('div', { class: 'card', 'data-row': '1' }, el('div', { class: 'card-body' },
        el('div', { class: 'row between' },
          el('b', {}, t('act.cond.item', { n: i + 1 })),
          el('button', { class: 'btn sm ghost', type: 'button', 'aria-label': t('act.cond.remove', { n: i + 1 }), html: `${icon('trash', 14)} ${esc(t('act.cond.remove_short'))}`, onclick: () => { read(); list.splice(i, 1); draw(); } })),
        el('div', { class: 'form-grid' },
          field({ label: t('act.cond.text'), control: text, full: true }),
          field({ label: t('act.cond.category'), control: cat }),
          field({ label: t('act.cond.days'), control: days })))));
    });
    host.appendChild(el('div', {}, el('button', { class: 'btn sm secondary', type: 'button', html: `${icon('plus', 14)} ${esc(t('act.cond.add'))}`, onclick: () => { read(); list.push({ text: '', category: 'OTHER', due_days: 90 }); draw(); host.querySelectorAll('[data-k=text]').item(list.length - 1)?.focus(); } })));
    host.appendChild(err);
  }
  draw();
  return {
    node: host,
    /** Returns the cleaned list, or null (and shows the error) when something is wrong. */
    value({ required = false } = {}) {
      read();
      err.hide();
      const out = [];
      for (const c of list) {
        if (!String(c.text).trim()) continue;
        const d = Number(c.due_days);
        if (!(d >= 1 && d <= 730)) { err.show(t('act.cond.days_bad')); return null; }
        out.push({ text: String(c.text).trim(), category: c.category, due_days: d });
      }
      if (required && !out.length) { err.show(t('act.cond.need_one')); return null; }
      return out;
    },
  };
}

/* ------------------------------------------------------------------ schedule EVC */
function scheduleEvc(ctx) {
  const { app, meta } = ctx;
  const size = Number(meta.evc_panel_size || 3);
  const resched = app.state === 'EVC_SCHEDULED';
  const bodyHost = el('div', { class: 'stack' });
  let ready = null;
  const m = modal({
    title: resched ? t('act.evc.resched') : t('act.evc'), body: bodyHost, size: 'xwide',
    actions: [
      { label: t('common.cancel') },
      {
        label: t('act.evc.confirm'), variant: 'primary', onClick: () => {
          if (!ready) return false;
          return ready.submit();
        },
      },
    ],
  });
  loading(bodyHost, t('act.evc.loading'));
  Promise.all([api.get(`/applications/${app.id}/evc/suggest`), api.get('/evc/experts')]).then(([sug, ex]) => {
    ready = buildEvcForm(ctx, bodyHost, sug, ex.items.filter((e) => e.active), size);
  }).catch((e) => { errorState(bodyHost, e); });
  return m;
}

function buildEvcForm(ctx, host, sug, experts, size) {
  const { app } = ctx;
  const visit = app.evc;
  const excl = new Map(sug.excluded.map((x) => [x.user.id, x.reason]));
  const sugIds = new Set(sug.panel.map((p) => p.user.id));
  const sugConvener = (sug.panel.find((p) => p.convener) || {}).user;
  const selected = new Set(sugIds);
  let convener = sugConvener ? sugConvener.id : null;
  if (visit && visit.status === 'SCHEDULED' && visit.panel.length) {
    selected.clear(); visit.panel.forEach((u) => selected.add(u.id)); convener = visit.convener ? visit.convener.id : null;
  }
  const dateInput = input({ type: 'date', min: today(ctx), value: (visit && visit.visit_date) || sug.date || '' });
  const override = textarea({ rows: 3 });
  const err = errorLine();
  const counter = el('div', { class: 'small muted', 'aria-live': 'polite' });
  const tbody = el('tbody');
  const rowsById = new Map();

  const sorted = [...experts].sort((a, b) => (excl.has(a.user.id) - excl.has(b.user.id)) || (sugIds.has(b.user.id) - sugIds.has(a.user.id))
    || ((b.discipline === sug.discipline) - (a.discipline === sug.discipline)) || (a.visits_60d - b.visits_60d) || a.user.name.localeCompare(b.user.name));

  function unavailable(e) {
    const d = dateInput.value;
    return !!d && (e.unavailable || []).some(([a, b]) => a <= d && d <= b);
  }
  function refresh() {
    counter.textContent = t('act.evc.panel_count', { n: selected.size, size });
    for (const e of sorted) {
      const r = rowsById.get(e.user.id);
      const on = selected.has(e.user.id);
      r.cb.checked = on;
      r.cb.disabled = !on && selected.size >= size;
      r.radio.disabled = !on || !e.senior;
      r.radio.checked = on && convener === e.user.id;
      r.flags.replaceChildren(...[
        sugIds.has(e.user.id) ? el('span', { class: 'badge b-success' }, t('act.evc.suggested')) : null,
        excl.has(e.user.id) ? el('div', {}, el('span', { class: 'badge b-danger' }, t('act.evc.conflict')), el('div', { class: 'cell-sub' }, reasonText(excl.get(e.user.id)))) : null,
        unavailable(e) ? el('span', { class: 'badge b-warning' }, t('act.evc.unavailable')) : null,
      ].filter(Boolean));
    }
  }
  for (const e of sorted) {
    const cb = el('input', { type: 'checkbox', id: `ev-${e.user.id}`, 'aria-label': e.user.name });
    const radio = el('input', { type: 'radio', name: 'convener', id: `ec-${e.user.id}`, 'aria-label': `${t('act.evc.convener')}: ${e.user.name}`, value: e.user.id });
    const flags = el('td', {});
    cb.addEventListener('change', () => {
      if (cb.checked) selected.add(e.user.id); else { selected.delete(e.user.id); if (convener === e.user.id) convener = null; }
      if (cb.checked && !convener && e.senior) convener = e.user.id;
      refresh();
    });
    radio.addEventListener('change', () => { convener = e.user.id; refresh(); });
    rowsById.set(e.user.id, { cb, radio, flags });
    tbody.appendChild(el('tr', {},
      el('td', { class: 'center' }, cb),
      el('td', {}, el('label', { for: `ev-${e.user.id}` }, el('div', { class: 'cell-main' }, e.user.name), el('div', { class: 'cell-sub' }, e.user.designation))),
      el('td', {}, discLabel(e.discipline)),
      el('td', {}, stateName(e.home_state)),
      el('td', { class: 'num' }, e.visits_60d),
      el('td', {}, e.next_visit ? fmtDate(e.next_visit) : '—'),
      el('td', { class: 'center' }, e.senior ? radio : el('span', { class: 'muted', title: t('ck.senior') }, '—')),
      flags));
  }
  dateInput.addEventListener('change', refresh);

  const useSug = () => {
    selected.clear(); sugIds.forEach((i) => selected.add(i)); convener = sugConvener ? sugConvener.id : null;
    if (sug.date) dateInput.value = sug.date;
    refresh();
  };

  const sugBox = el('div', { class: 'alert info' }, el('span', { class: 'icon', html: icon('sparkles', 18) }),
    el('div', { class: 'grow' },
      el('div', { class: 'a-title' }, t('act.evc.sug')),
      sug.date ? el('div', {}, t('act.evc.sug_line', { date: fmtDate(sug.date), by: fmtDate(sug.schedule_by), done: fmtDate(sug.complete_by) })) : el('div', {}, t('act.evc.sug_none')),
      sug.late ? el('div', { class: 'mt-0', html: `<b>${esc(t('act.evc.sug_late'))}</b>` }) : null,
      sug.panel.length ? el('ul', { class: 'list-plain mt-0 mb-0' }, sug.panel.map((p) => el('li', {},
        el('b', {}, p.user.name), p.convener ? ` (${t('act.evc.convener')})` : '', ` · ${p.user.designation}`,
        el('div', { class: 'small' }, reasonText(p.reasons.join('; ')))))) : null,
      el('div', { class: 'small mt-0' }, t('act.evc.considered', { n: sug.considered, disc: discLabel(sug.discipline) }))),
    sug.panel.length ? el('button', { class: 'btn sm secondary', type: 'button', onclick: useSug }, t('act.evc.use')) : null);

  const exclBox = el('div', { class: 'alert warning' }, el('span', { class: 'icon', html: icon('shield-alert', 18) }),
    el('div', {}, el('div', { class: 'a-title' }, t('act.evc.excluded')),
      sug.excluded.length ? el('ul', { class: 'list-plain mb-0' }, sug.excluded.map((x) => el('li', {}, el('b', {}, x.user.name), ' — ', reasonText(x.reason)))) : el('div', {}, t('act.evc.excluded_none'))));

  host.replaceChildren(
    sugBox, exclBox,
    el('div', { class: 'form-grid' }, field({ label: t('act.evc.date'), control: dateInput, hint: t('act.evc.date_hint', { date: fmtDate(sug.complete_by) }), required: true })),
    el('div', { class: 'stack sm' },
      el('div', { class: 'row between' }, el('b', {}, t('act.evc.panel')), counter),
      el('div', { class: 'table-wrap', style: { maxHeight: '320px', overflowY: 'auto', border: '1px solid var(--as-border)' } },
        el('table', { class: 'table compact' },
          el('thead', {}, el('tr', {}, ['pick', 'expert', 'disc', 'state', 'visits', 'next', 'conv', 'flags'].map((k) => el('th', { scope: 'col', class: k === 'visits' ? 'num' : '' }, t(`act.evc.col_${k === 'expert' ? 'expert' : k}`))))),
          tbody))),
    field({ label: t('act.evc.override'), control: override, hint: t('act.evc.override_hint') }),
    err);
  refresh();

  return {
    async submit() {
      err.hide();
      const date = dateInput.value;
      if (!date) { err.show(t('act.evc.err_date')); dateInput.focus(); return false; }
      if (selected.size !== size) { err.show(t('act.evc.err_panel', { size })); return false; }
      const conv = experts.find((e) => e.user.id === convener);
      if (!conv || !selected.has(conv.user.id) || !conv.senior) { err.show(t('act.evc.err_conv')); return false; }
      const issues = [];
      for (const id of selected) {
        const e = experts.find((x) => x.user.id === id);
        if (excl.has(id)) issues.push(`${e.user.name}: ${reasonText(excl.get(id))}`);
        else if (unavailable(e)) issues.push(`${e.user.name}: ${t('act.evc.unavailable')}`);
      }
      if (sug.complete_by && date > sug.complete_by) issues.push(t('act.evc.err_late', { date: fmtDate(sug.complete_by) }));
      if (issues.length && !override.value.trim()) { err.show(t('act.evc.err_conflict', { list: issues.join('; ') })); override.focus(); return false; }
      return post(ctx, '/evc/schedule', { visit_date: date, panel: [...selected], convener_id: convener, override_reason: override.value.trim() }, 'act.evc.done', 'evc');
    },
  };
}

/* ------------------------------------------------------------------ EVC report */
function evcReport(ctx) {
  const { app, meta } = ctx;
  const visit = app.evc || {};
  const rec = select(Object.keys(meta.evc_recommendations).map((k) => ({ value: k, label: tl(meta.evc_recommendations[k]) })));
  const findings = textarea({ rows: 5 });
  const cond = conditionsEditor(meta, []);
  const condBox = el('div', { class: 'stack sm', hidden: true }, el('b', {}, t('act.report.conditions')), el('div', { class: 'small muted' }, t('act.report.conditions_hint')), cond.node);
  rec.addEventListener('change', () => { condBox.hidden = rec.value !== 'RECOMMEND_WITH_CONDITIONS'; });
  const err = errorLine();
  const body = el('div', { class: 'stack' },
    visit.visit_date ? el('p', { class: 'mb-0' }, t('act.report.visit', { date: fmtDate(visit.visit_date) })) : null,
    field({ label: t('act.report.rec'), control: rec, required: true }),
    field({ label: t('act.report.findings'), control: findings, hint: t('act.report.findings_hint'), required: true }),
    condBox, err);
  modal({
    title: t('act.report'), body, size: 'wide',
    actions: [
      { label: t('common.cancel') },
      {
        label: t('act.report.confirm'), onClick: () => {
          err.hide();
          if (findings.value.trim().length < 10) { err.show(t('act.reason_short', { n: 10, field: t('act.report.findings') })); findings.focus(); return false; }
          const conditions = rec.value === 'RECOMMEND_WITH_CONDITIONS' ? cond.value({ required: true }) : [];
          if (conditions === null) return false;
          return post(ctx, '/evc/report', { recommendation: rec.value, findings: findings.value.trim(), conditions }, 'act.report.done', 'evc');
        },
      },
    ],
  });
}

/* ------------------------------------------------------------------ committee */
function committeeRecord(ctx) {
  const { meta, user } = ctx;
  const which = select(['SAC', 'SHC'].map((k) => ({ value: k, label: t(`act.committee.${k}`), selected: user.committee_code === k })));
  const date = input({ type: 'date', max: today(ctx), value: today(ctx) });
  const rec = select(Object.keys(meta.evc_recommendations).map((k) => ({ value: k, label: tl(meta.evc_recommendations[k]) })));
  const remarks = textarea({ rows: 4 });
  const err = errorLine();
  const body = el('div', { class: 'stack' },
    el('div', { class: 'form-grid' },
      field({ label: t('act.committee.which'), control: which, required: true }),
      field({ label: t('act.committee.date'), control: date, hint: t('act.committee.date_hint'), required: true }),
      field({ label: t('act.committee.rec'), control: rec, required: true, full: true }),
      field({ label: t('act.committee.remarks'), control: remarks, hint: t('act.committee.remarks_hint'), required: true, full: true })),
    err);
  modal({
    title: t('act.committee'), body, size: 'wide',
    actions: [
      { label: t('common.cancel') },
      {
        label: t('act.committee.confirm'), onClick: () => {
          err.hide();
          if (!date.value) { err.show(t('act.evc.err_date')); date.focus(); return false; }
          if (remarks.value.trim().length < 5) { err.show(t('act.reason_short', { n: 5, field: t('act.committee.remarks') })); remarks.focus(); return false; }
          return post(ctx, '/committee', { committee: which.value, meeting_date: date.value, recommendation: rec.value, remarks: remarks.value.trim() }, 'act.committee.done', 'committee');
        },
      },
    ],
  });
}

/* ------------------------------------------------------------------ decide */
function decide(ctx) {
  const { app, meta } = ctx;
  const outcomes = Object.keys(meta.decisions);
  let outcome = '';
  const evcConds = ((app.evc && app.evc.conditions) || []).map((c) => ({ text: c.text, category: c.category, due_days: c.due_days }));
  const cond = conditionsEditor(meta, evcConds);
  const condBox = el('div', { class: 'stack sm', hidden: true }, el('b', {}, t('act.decide.conds')), el('div', { class: 'small muted' }, t('act.decide.conds_hint')), cond.node);
  const remarks = textarea({ rows: 4 });
  const remarksField = field({ label: t('act.decide.remarks'), control: remarks, hint: t('act.decide.remarks_hint') });
  const err = errorLine();
  const radios = outcomes.map((k) => {
    const r = el('input', { type: 'radio', name: 'outcome', value: k, id: `do-${k}` });
    r.addEventListener('change', () => {
      outcome = k;
      condBox.hidden = k !== 'APPROVE_CONDITIONAL';
      remarksField.querySelector('label').firstChild.textContent = k === 'REJECT' ? t('act.decide.remarks_reject') : t('act.decide.remarks');
    });
    return el('label', { class: 'check', for: `do-${k}` }, r, tl(meta.decisions[k]));
  });
  const ctxLines = [];
  if (app.evc && app.evc.recommendation) ctxLines.push(el('li', {}, el('b', {}, `${t('act.decide.ctx_evc')}: `), tl(meta.evc_recommendations[app.evc.recommendation]), app.evc.findings ? ` — ${app.evc.findings}` : ''));
  for (const c of app.committee || []) ctxLines.push(el('li', {}, el('b', {}, `${t('act.decide.ctx_com')} ${c.committee} (${fmtDate(c.meeting_date)}): `), tl(meta.evc_recommendations[c.recommendation]), c.remarks ? ` — ${c.remarks}` : ''));
  const body = el('div', { class: 'stack' },
    el('div', { class: 'alert saffron' }, el('span', { class: 'icon', html: icon('stamp', 18) }), el('div', {}, t('act.decide.intro'))),
    el('div', {}, el('div', { class: 'label' }, t('act.decide.context')),
      ctxLines.length ? el('ul', { class: 'list-plain mb-0' }, ctxLines) : el('div', { class: 'small muted' }, t('act.decide.ctx_none'))),
    el('fieldset', { class: 'stack sm', style: { border: 0, padding: 0, margin: 0, minWidth: 0 } }, el('legend', { class: 'label' }, t('act.decide.outcome')), radios),
    remarksField, condBox, err);
  modal({
    title: t('act.decide'), body, size: 'wide',
    actions: [
      { label: t('common.cancel') },
      {
        label: t('act.decide.confirm'), variant: 'saffron', onClick: () => {
          err.hide();
          if (!outcome) { err.show(t('act.decide.pick')); return false; }
          if (outcome === 'REJECT' && remarks.value.trim().length < 5) { err.show(t('act.decide.remarks_needed')); remarks.focus(); return false; }
          const conditions = outcome === 'APPROVE_CONDITIONAL' ? cond.value({ required: true }) : [];
          if (conditions === null) return false;
          return post(ctx, '/decide', { outcome, remarks: remarks.value.trim(), conditions }, 'act.decide.done', 'decision');
        },
      },
    ],
  });
}

/* ------------------------------------------------------------------ reassign */
function reassign(ctx) {
  const { app } = ctx;
  const host = el('div', { class: 'stack' });
  let ready = null;
  modal({
    title: t('act.reassign'), body: host,
    actions: [
      { label: t('common.cancel') },
      { label: t('act.reassign.confirm'), onClick: () => (ready ? ready() : false) },
    ],
  });
  loading(host);
  api.get(`/applications/${app.id}/candidates`).then((list) => {
    const to = select([{ value: '', label: '—' }, ...list.map((u) => ({
      value: u.id, disabled: u.current,
      label: `${u.name} · ${roleLabel(u.role)} · ${t('act.reassign.open', { n: u.open })}${u.current ? ` · ${t('act.reassign.current')}` : ''}`,
    }))]);
    const reason = textarea({ rows: 3 });
    const err = errorLine();
    host.replaceChildren(
      el('p', { class: 'mb-0' }, t('act.reassign.intro')),
      field({ label: t('act.reassign.to'), control: to, required: true }),
      field({ label: t('act.reassign.reason'), control: reason, hint: t('act.reassign.reason_hint'), required: true }),
      err);
    ready = () => {
      err.hide();
      if (!to.value) { err.show(t('act.reassign.pick')); to.focus(); return false; }
      if (reason.value.trim().length < 5) { err.show(t('act.reason_short', { n: 5, field: t('act.reassign.reason') })); reason.focus(); return false; }
      return post(ctx, '/reassign', { user_id: Number(to.value), reason: reason.value.trim() }, 'act.reassign.done', 'overview');
    };
  }).catch((e) => errorState(host, e));
}

