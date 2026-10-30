// New application: type -> live route preview with time limits -> POST /applications -> success card.
import { initPage } from '../assets/js/layout.js';
import { api, site } from '../assets/js/api.js';
import { t, tl, extend, onLang } from '../assets/js/i18n.js';
import { $, el, esc, icon, mount, withBusy, toast, whyLine } from '../assets/js/ui.js';

extend({
  en: {
    'apply.title': 'New application',
    'apply.subtitle': 'Choose what you are applying for. The portal picks the route and shows the stages before you submit.',
    'apply.form_title': 'Application details',
    'apply.type': 'Type of application',
    'apply.type_ph': 'Choose a type…',
    'apply.programme': 'Programme / course',
    'apply.programme_hint': 'For example: B.Tech Computer Science and Engineering',
    'apply.intake': 'Intake (seats)',
    'apply.intake_hint_req': 'Required for a new institution and for an increase in intake. Between 1 and 1200.',
    'apply.intake_hint_opt': 'Optional for this type of application. Between 0 and 1200.',
    'apply.remarks': 'Remarks',
    'apply.submit': 'Submit application',
    'apply.submitting': 'Submitting…',
    'apply.err_type': 'Please choose the type of application.',
    'apply.err_programme': 'Please write the programme or course (at least 3 characters).',
    'apply.err_intake_req': 'Please enter the number of seats requested.',
    'apply.err_intake_range': 'Intake must be a whole number between 0 and 1200.',
    'apply.route_title': 'Your route',
    'apply.route_empty': 'Choose a type of application to see the stages it will go through.',
    'apply.n_submit': 'Submitted',
    'apply.n_letter': 'Signed letter',
    'apply.days': '{n} days',
    'apply.total': 'Time limits add up to {n} days at most, counted only while the application is with AICTE. These limits are configurable placeholders (rulebook version {v}).',
    'apply.evc_note': 'The expert visit has {a} days to be scheduled and {b} days to be completed.',
    'apply.next_title': 'What happens next',
    'apply.next.1': 'The portal routes the application and gives it to the least-loaded officer of your region, at once.',
    'apply.next.2': 'Every stage has a clock and a reminder before its due date; delays are escalated automatically.',
    'apply.next.3': 'If something is missing the officer returns it with reasons. You get a signed letter and the clock pauses until you reply.',
    'apply.next.4': 'Officials decide at every statutory step. The decision comes as a signed letter you can verify.',
    'apply.done_title': 'Application submitted',
    'apply.done_text': 'Your application has been received and routed.',
    'apply.done_ref': 'Reference',
    'apply.done_route': 'Route',
    'apply.done_holder': 'With',
    'apply.done_open': 'Open the application',
    'apply.done_another': 'Submit another',
    'apply.done_dash': 'Back to dashboard',
    'apply.server_error': 'The application could not be submitted.',
  },
  hi: {
    'apply.title': 'नया आवेदन',
    'apply.subtitle': 'चुनें कि आप किसके लिए आवेदन कर रहे हैं। जमा करने से पहले पोर्टल मार्ग तय करके चरण दिखाता है।',
    'apply.form_title': 'आवेदन का विवरण',
    'apply.type': 'आवेदन का प्रकार',
    'apply.type_ph': 'प्रकार चुनें…',
    'apply.programme': 'कार्यक्रम / पाठ्यक्रम',
    'apply.programme_hint': 'उदाहरण: बी.टेक कंप्यूटर साइंस एंड इंजीनियरिंग',
    'apply.intake': 'प्रवेश क्षमता (सीटें)',
    'apply.intake_hint_req': 'नई संस्था और प्रवेश क्षमता वृद्धि के लिए अनिवार्य। 1 से 1200 के बीच।',
    'apply.intake_hint_opt': 'इस प्रकार के आवेदन के लिए वैकल्पिक। 0 से 1200 के बीच।',
    'apply.remarks': 'टिप्पणी',
    'apply.submit': 'आवेदन जमा करें',
    'apply.submitting': 'जमा हो रहा है…',
    'apply.err_type': 'कृपया आवेदन का प्रकार चुनें।',
    'apply.err_programme': 'कृपया कार्यक्रम या पाठ्यक्रम लिखें (कम से कम 3 अक्षर)।',
    'apply.err_intake_req': 'कृपया माँगी गई सीटों की संख्या लिखें।',
    'apply.err_intake_range': 'प्रवेश क्षमता 0 से 1200 के बीच की पूर्ण संख्या होनी चाहिए।',
    'apply.route_title': 'आपका मार्ग',
    'apply.route_empty': 'आवेदन का प्रकार चुनें, तब पता चलेगा कि वह किन चरणों से गुज़रेगा।',
    'apply.n_submit': 'जमा',
    'apply.n_letter': 'हस्ताक्षरित पत्र',
    'apply.days': '{n} दिन',
    'apply.total': 'समय-सीमाएँ अधिकतम {n} दिन बनती हैं, जो केवल तब गिनी जाती हैं जब आवेदन एआईसीटीई के पास हो। ये सीमाएँ विन्यास योग्य उदाहरण हैं (नियम-पुस्तिका संस्करण {v})।',
    'apply.evc_note': 'विशेषज्ञ दौरे के निर्धारण के लिए {a} दिन और उसे पूरा करने के लिए {b} दिन हैं।',
    'apply.next_title': 'आगे क्या होगा',
    'apply.next.1': 'पोर्टल आवेदन का मार्ग तय करता है और उसे तुरंत आपके क्षेत्र के सबसे कम कार्यभार वाले अधिकारी को सौंप देता है।',
    'apply.next.2': 'हर चरण की एक घड़ी है और नियत तिथि से पहले अनुस्मारक जाता है; विलंब अपने-आप आगे बढ़ाया जाता है।',
    'apply.next.3': 'कुछ कम हो तो अधिकारी कारण सहित लौटाते हैं। आपको हस्ताक्षरित पत्र मिलता है और आपके उत्तर तक घड़ी रुकी रहती है।',
    'apply.next.4': 'हर वैधानिक चरण पर अधिकारी निर्णय लेते हैं। निर्णय हस्ताक्षरित पत्र के रूप में आता है जिसे आप सत्यापित कर सकते हैं।',
    'apply.done_title': 'आवेदन जमा हो गया',
    'apply.done_text': 'आपका आवेदन प्राप्त हो गया है और उसका मार्ग तय हो गया है।',
    'apply.done_ref': 'संदर्भ',
    'apply.done_route': 'मार्ग',
    'apply.done_holder': 'किसके पास',
    'apply.done_open': 'आवेदन खोलें',
    'apply.done_another': 'एक और जमा करें',
    'apply.done_dash': 'डैशबोर्ड पर लौटें',
    'apply.server_error': 'आवेदन जमा नहीं हो सका।',
  },
});

const { meta } = await initPage({ roles: ['institution'], active: 'apply', title: 'apply.title', subtitle: 'apply.subtitle',
  breadcrumbs: [{ label: 'nav.dashboard', href: 'institution/dashboard.html' }, { label: 'apply.title' }] });

const form = $('#apply-form');
let created = null;       // AppDetail of the last submission
let serverError = null;   // function -> text
const errors = {};        // field -> function -> text

const REQUIRED_INTAKE = ['NEW_INST', 'INTAKE'];
const typeEl = $('#app_type');

function fillTypes() {
  const cur = typeEl.value;
  mount(typeEl, el('option', { value: '' }, t('apply.type_ph')),
    Object.entries(meta.app_types).map(([k, v]) => el('option', { value: k }, tl(v.label))));
  typeEl.value = cur;
}

function fieldError(name, fieldEl) {
  const node = $(`#err-${name}`);
  const fn = errors[name];
  if (!node) return;
  node.hidden = !fn;
  node.textContent = fn ? fn() : '';
  fieldEl.classList.toggle('invalid', !!fn);
  if (fn) fieldEl.setAttribute('aria-describedby', `err-${name}`); else fieldEl.removeAttribute('aria-describedby');
}

function renderStatic() {
  $('#form-h').innerHTML = `${icon('file-text', 19)}<span>${esc(t('apply.form_title'))}</span>`;
  $('#lbl-type').innerHTML = `${esc(t('apply.type'))}<span class="req" aria-hidden="true">*</span>`;
  $('#lbl-programme').innerHTML = `${esc(t('apply.programme'))}<span class="req" aria-hidden="true">*</span>`;
  const req = REQUIRED_INTAKE.includes(typeEl.value);
  $('#lbl-intake').innerHTML = `${esc(t('apply.intake'))}${req ? '<span class="req" aria-hidden="true">*</span>' : ''}`;
  $('#hint-programme').textContent = t('apply.programme_hint');
  $('#hint-intake').textContent = req || !typeEl.value ? t('apply.intake_hint_req') : t('apply.intake_hint_opt');
  $('#lbl-remarks').textContent = t('apply.remarks');
  $('#btn-submit').innerHTML = `${icon('send', 17)}<span>${esc(t('apply.submit'))}</span>`;
  $('#route-h').innerHTML = `${icon('git-branch', 19)}<span>${esc(t('apply.route_title'))}</span>`;
  $('#next-h').innerHTML = `${icon('info', 19)}<span>${esc(t('apply.next_title'))}</span>`;
  mount($('#next-list'), [1, 2, 3, 4].map((i) => el('li', { style: { display: 'flex', gap: '10px', padding: '5px 0' } },
    el('span', { style: { color: 'var(--as-primary)', flex: 'none', marginTop: '2px' }, html: icon('check-circle', 16) }), el('span', {}, t(`apply.next.${i}`)))));
  fieldError('type', typeEl); fieldError('programme', $('#programme')); fieldError('intake', $('#intake'));
  mount($('#form-error'), serverError ? el('div', { class: 'alert danger', style: { marginBottom: '14px' } }, el('span', { class: 'icon', html: icon('alert-circle', 18) }), el('div', {}, serverError())) : null);
}

function stageDays(stage, isNew) {
  const s = meta.sla_days;
  if (stage === 'EVC') return [s.EVC_SCHEDULE, isNew ? s.EVC_COMPLETE_NEW : s.EVC_COMPLETE];
  return [s[stage]];
}

function renderRoute() {
  const host = $('#route');
  const type = meta.app_types[typeEl.value];
  if (!type) { mount(host, el('p', { class: 'muted mb-0' }, t('apply.route_empty'))); return; }
  const route = meta.routes[type.route];
  const nodes = [el('span', { class: 'node auto' }, t('apply.n_submit'))];
  let total = 0;
  let evcNote = null;
  for (const stage of route.stages) {
    const parts = stageDays(stage, type.new_institution).filter((n) => n !== undefined && n !== null);
    const sum = parts.reduce((a, b) => a + b, 0);
    total += sum;
    if (stage === 'EVC' && parts.length === 2) evcNote = t('apply.evc_note', { a: parts[0], b: parts[1] });
    nodes.push(el('span', { class: 'arrow', 'aria-hidden': 'true' }, '→'),
      el('span', { class: 'node human' }, tl(meta.stages[stage]), el('small', {}, t('apply.days', { n: sum }))));
  }
  nodes.push(el('span', { class: 'arrow', 'aria-hidden': 'true' }, '→'), el('span', { class: 'node auto' }, t('apply.n_letter')));
  mount(host,
    el('h3', { style: { fontSize: '1rem' } }, tl(route.label)),
    el('div', { class: 'flow', role: 'list', 'aria-label': tl(route.label) }, nodes),
    el('p', { class: 'route-total' }, t('apply.total', { n: total, v: meta.rule_version })),
    evcNote ? el('p', { class: 'route-total', style: { marginTop: '4px' } }, evcNote) : null);
}

function renderDone() {
  const host = $('#done');
  if (!created) { mount(host); return; }
  const a = created;
  mount(host, el('div', { class: 'card accent-green section', role: 'status' },
    el('div', { class: 'card-head' }, el('h2', { html: `${icon('check-circle', 20)}<span>${esc(t('apply.done_title'))}</span>` })),
    el('div', { class: 'card-body stack' },
      el('p', { class: 'mb-0' }, t('apply.done_text')),
      el('dl', { class: 'dl cols-3' },
        el('div', {}, el('dt', {}, t('apply.done_ref')), el('dd', {}, el('span', { class: 'mono', style: { fontWeight: '700' } }, a.ref_no))),
        el('div', {}, el('dt', {}, t('apply.done_route')), el('dd', {}, tl(a.route_label))),
        el('div', {}, el('dt', {}, t('apply.done_holder')), el('dd', {}, a.holder ? `${a.holder.name} (${a.holder.designation})` : '—'))),
      whyLine(a.why),
      el('div', { class: 'row' },
        el('a', { class: 'btn', href: site(`institution/application.html?id=${a.id}`) }, t('apply.done_open')),
        el('button', { class: 'btn secondary', type: 'button', onclick: () => { created = null; renderDone(); form.scrollIntoView({ behavior: 'smooth', block: 'start' }); $('#app_type').focus(); } }, t('apply.done_another')),
        el('a', { class: 'btn ghost', href: site('institution/dashboard.html') }, t('apply.done_dash'))))));
}

function validate(v) {
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!v.app_type) errors.type = () => t('apply.err_type');
  if ((v.programme || '').trim().length < 3) errors.programme = () => t('apply.err_programme');
  const raw = String(v.intake ?? '').trim();
  if (REQUIRED_INTAKE.includes(v.app_type) && raw === '') errors.intake = () => t('apply.err_intake_req');
  else if (raw !== '' && (!/^\d+$/.test(raw) || Number(raw) > 1200 || (REQUIRED_INTAKE.includes(v.app_type) && Number(raw) < 1))) errors.intake = () => t('apply.err_intake_range');
  return !Object.keys(errors).length;
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const v = { app_type: typeEl.value, programme: $('#programme').value, intake: $('#intake').value, remarks: $('#remarks').value };
  serverError = null;
  const ok = validate(v);
  renderStatic();
  if (!ok) {
    const first = errors.type ? typeEl : errors.programme ? $('#programme') : $('#intake');
    first.focus();
    return;
  }
  try {
    await withBusy($('#btn-submit'), async () => {
      created = await api.post('/applications', {
        app_type: v.app_type, programme: v.programme.trim(), intake: v.intake === '' ? null : Number(v.intake), remarks: v.remarks.trim(),
      });
    });
    form.reset();
    renderStatic(); renderRoute(); renderDone();
    $('#done').scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast(`${t('apply.done_title')}: ${created.ref_no}`, 'success');
  } catch (e) {
    const msg = e.message;
    serverError = () => msg;
    renderStatic();
    toast(msg, 'error');
  }
});
typeEl.addEventListener('change', () => { renderStatic(); renderRoute(); });
['#programme', '#intake'].forEach((s) => $(s).addEventListener('input', () => { const n = s === '#programme' ? 'programme' : 'intake'; if (errors[n]) { delete errors[n]; fieldError(n, $(s)); } }));

fillTypes();
renderStatic(); renderRoute(); renderDone();
onLang(() => { fillTypes(); renderStatic(); renderRoute(); renderDone(); });
