// Shared helpers for the case-work pages (dashboard, applications, application, evc, escalations, workload).
// Small, page-agnostic: labelled form fields, a labelled text prompt, bilingual label helpers.
import { t, tl, extend, getLang } from '../assets/js/i18n.js';
import { el, esc, modal, icon } from '../assets/js/ui.js';

extend({
  en: {
    'ck.required': 'This field is required.',
    'ck.min_chars': 'Please write at least {n} characters.',
    'ck.institution': 'Institution',
    'ck.with_institution': 'With the institution',
    'ck.unassigned': 'Not assigned',
    'ck.senior': 'Senior',
    'ck.yes': 'Yes',
    'ck.no': 'No',
    'ck.disc.Engineering': 'Engineering',
    'ck.disc.Management': 'Management',
    'ck.disc.Pharmacy': 'Pharmacy',
    'ck.disc.Architecture': 'Architecture',
    'ck.disc.Polytechnic': 'Polytechnic',
    'ck.disc.Computer Applications': 'Computer Applications',
    'ck.disc.Hotel Management': 'Hotel Management',
    'ck.opens_in_new': 'opens in a new tab',
  },
  hi: {
    'ck.required': 'यह क्षेत्र आवश्यक है।',
    'ck.min_chars': 'कृपया कम से कम {n} अक्षर लिखें।',
    'ck.institution': 'संस्था',
    'ck.with_institution': 'संस्था के पास',
    'ck.unassigned': 'नियत नहीं',
    'ck.senior': 'वरिष्ठ',
    'ck.yes': 'हाँ',
    'ck.no': 'नहीं',
    'ck.disc.Engineering': 'अभियांत्रिकी',
    'ck.disc.Management': 'प्रबंधन',
    'ck.disc.Pharmacy': 'फार्मेसी',
    'ck.disc.Architecture': 'वास्तुकला',
    'ck.disc.Polytechnic': 'पॉलिटेक्निक',
    'ck.disc.Computer Applications': 'कंप्यूटर अनुप्रयोग',
    'ck.disc.Hotel Management': 'होटल प्रबंधन',
    'ck.opens_in_new': 'नए टैब में खुलता है',
  },
});

const STATES_HI = {
  'Andhra Pradesh': 'आंध्र प्रदेश', Assam: 'असम', Bihar: 'बिहार', Chhattisgarh: 'छत्तीसगढ़', Delhi: 'दिल्ली', Goa: 'गोवा',
  Gujarat: 'गुजरात', Haryana: 'हरियाणा', 'Himachal Pradesh': 'हिमाचल प्रदेश', Jharkhand: 'झारखंड', Karnataka: 'कर्नाटक',
  Kerala: 'केरल', 'Madhya Pradesh': 'मध्य प्रदेश', Maharashtra: 'महाराष्ट्र', Meghalaya: 'मेघालय', Odisha: 'ओडिशा',
  Punjab: 'पंजाब', Rajasthan: 'राजस्थान', 'Tamil Nadu': 'तमिल नाडु', Telangana: 'तेलंगाना', 'Uttar Pradesh': 'उत्तर प्रदेश',
  Uttarakhand: 'उत्तराखंड', 'West Bengal': 'पश्चिम बंगाल',
};

/** Pick the Hindi text when the page is in Hindi and a Hindi value exists. */
export const pick = (en, hi) => (getLang() === 'hi' && hi ? hi : en);

export const stateName = (s) => (getLang() === 'hi' ? (STATES_HI[s] || s) : s) || '—';
export const discLabel = (d) => (d ? t(`ck.disc.${d}`, { _default: d }) : '—');
export const regionName = (r) => (!r ? '—' : pick(r.name, r.name_hi));
export const roleLabel = (role) => t(`role.${role}`, { _default: role || '' });

/** Translate the English reason strings produced by the EVC scheduling assistant (evc_assist.py). */
export function reasonText(s) {
  if (getLang() !== 'hi') return s;
  return String(s).split('; ').map((p) => {
    let m;
    if (p === 'Senior expert: proposed convener') return 'वरिष्ठ विशेषज्ञ: प्रस्तावित संयोजक';
    if (p === 'linked to this institution') return 'इस संस्था से संबद्ध';
    if ((m = p.match(/^Discipline: (.+?)( \(matches\))?$/))) return `विषय-क्षेत्र: ${discLabel(m[1])}${m[2] ? ' (मेल खाता है)' : ''}`;
    if ((m = p.match(/^Home state (.+): no state conflict$/))) return `गृह राज्य ${stateName(m[1])}: राज्य संबंधी कोई टकराव नहीं`;
    if ((m = p.match(/^(\d+) visit\(s\) in the 60-day window$/))) return `60 दिन की अवधि में ${m[1]} दौरे`;
    if ((m = p.match(/^same home state as the institution \((.+)\)$/))) return `संस्था के समान गृह राज्य (${stateName(m[1])})`;
    return p;
  }).join('; ');
}

let seq = 0;
export const uid = (prefix = 'f') => `${prefix}-${++seq}`;

/**
 * Labelled form field: field({label, control, hint, required, id})
 * `control` is an element that already carries `id` (or pass id and it is set for you).
 */
export function field({ label, control, hint, required = false, id, full = false }) {
  const cid = id || control.id || uid('fld');
  control.id = cid;
  const hid = hint ? `${cid}-hint` : null;
  if (hid) control.setAttribute('aria-describedby', hid);
  return el('div', { class: `field${full ? ' full' : ''}` },
    el('label', { for: cid }, label, required ? el('span', { class: 'req', 'aria-hidden': 'true' }, '*') : null),
    control,
    hint ? el('div', { class: 'hint', id: hid }, hint) : null);
}

export const input = (attrs = {}) => el('input', { class: 'input', ...attrs });
export const textarea = (attrs = {}) => el('textarea', { class: 'textarea', rows: 4, ...attrs });
export const select = (options, attrs = {}) => {
  const node = el('select', { class: 'select', ...attrs });
  for (const o of options) node.appendChild(el('option', { value: o.value, selected: o.selected || null, disabled: o.disabled || null }, o.label));
  return node;
};

/** Inline error line under a control (call .show(msg) / .hide()). */
export function errorLine() {
  const node = el('div', { class: 'error', role: 'alert', hidden: true });
  node.show = (msg) => { node.textContent = msg; node.hidden = false; };
  node.hide = () => { node.hidden = true; };
  return node;
}

/**
 * Labelled text prompt (kernel promptDialog has no label association and an English-only error).
 * Resolves the trimmed text, or null when cancelled.
 */
export function askText({ title, label, hint, intro, confirmLabel, variant = 'primary', required = true, minLen = 0, rows = 4, value = '' }) {
  return new Promise((resolve) => {
    let done = false;
    const area = textarea({ rows, required: required ? true : null });
    area.value = value;
    const err = errorLine();
    const body = el('div', { class: 'stack' },
      intro ? (intro instanceof Node ? intro : el('p', { class: 'mb-0' }, intro)) : null,
      field({ label, control: area, hint, required }),
      err);
    area.after(err);
    modal({
      title,
      body,
      actions: [
        { label: t('common.cancel'), onClick: () => { done = true; resolve(null); } },
        {
          label: confirmLabel || t('common.submit'),
          variant,
          onClick: () => {
            const v = area.value.trim();
            if (required && !v) { err.show(t('ck.required')); area.classList.add('invalid'); area.focus(); return false; }
            if (minLen && v.length < minLen) { err.show(t('ck.min_chars', { n: minLen })); area.classList.add('invalid'); area.focus(); return false; }
            done = true;
            resolve(v);
            return true;
          },
        },
      ],
      onClose: () => { if (!done) resolve(null); },
    });
  });
}

/** Person block for a table cell: name + role label (HTML string). */
export function personHtml(u, fallback) {
  if (!u) return `<span class="muted">${esc(fallback || t('ck.unassigned'))}</span>`;
  return `<div class="cell-main">${esc(u.name)}</div><div class="cell-sub">${esc(roleLabel(u.role))}</div>`;
}

/** Holder of an application summary: officer, or the institution while the case is returned. */
export function holderHtml(app) {
  if (app.state === 'RETURNED' && !app.holder) return `<span class="muted">${esc(t('ck.with_institution'))}</span>`;
  if (['APPROVED', 'APPROVED_CONDITIONAL', 'REJECTED'].includes(app.state)) return '<span class="muted">—</span>';
  return personHtml(app.holder);
}

export const meterClass = (idx) => (idx >= 1.5 ? 'danger' : idx >= 1.15 ? 'warning' : '');

export { tl, icon };
