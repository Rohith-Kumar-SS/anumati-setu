// Public letter verification: paste a signed code, try samples, or scan the QR code with the camera (jsQR).
import { initPage } from './assets/js/layout.js';
import { api, site } from './assets/js/api.js';
import { t, tl, extend, onLang, getLang } from './assets/js/i18n.js';
import { $, el, esc, icon, mount, fmtDateTime, getParam, withBusy, loading, dl } from './assets/js/ui.js';

extend({
  en: {
    'verify.title': 'Verify a letter',
    'verify.subtitle': 'Check that a letter or notice issued by Anumati Setu is genuine. No sign-in needed.',
    'verify.in_title': 'Signed code',
    'verify.code_label': 'Paste the signed code printed under the QR code',
    'verify.code_hint': 'It starts with AS1. Line breaks and spaces are ignored.',
    'verify.empty': 'Paste or scan a code first.',
    'verify.btn_verify': 'Verify',
    'verify.btn_clear': 'Clear',
    'verify.btn_genuine': 'Try a genuine sample',
    'verify.btn_tampered': 'Try a tampered sample',
    'verify.btn_camera': 'Scan with camera',
    'verify.btn_img': 'Scan from a picture',
    'verify.btn_stop': 'Stop camera',
    'verify.scan_hint': 'Hold the QR code inside the frame.',
    'verify.cam_unsupported': 'This browser cannot open the camera. Paste the code or use a picture instead.',
    'verify.cam_denied': 'The camera could not be opened ({msg}). Paste the code or use a picture instead.',
    'verify.img_none': 'No QR code was found in that picture. Try a sharper picture, or paste the code.',
    'verify.img_bad': 'That file could not be read as a picture.',
    'verify.scanned': 'QR code read. Checking it now…',
    'verify.sample_error': 'The sample codes could not be loaded.',
    'verify.checking': 'Checking the signature…',
    'verify.valid_title': 'Genuine letter',
    'verify.valid_text': 'The signature is valid, the letter exists on the portal, it has not been withdrawn and its text has not been changed.',
    'verify.invalid_title': 'Not verified',
    'verify.invalid_text': 'Do not rely on this letter.',
    'verify.f_ref': 'Letter reference',
    'verify.f_kind': 'Kind of letter',
    'verify.f_inst': 'Institution',
    'verify.f_app': 'Application',
    'verify.f_issued': 'Issued on',
    'verify.f_subject': 'Subject',
    'verify.f_reason': 'Reason',
    'verify.what_title': 'What is checked',
    'verify.what_lead': 'Every letter carries a code signed with the portal\'s private key (Ed25519). Anyone can check it here; no personal data is needed.',
    'verify.what.1': 'The signature belongs to this portal and the code was not altered',
    'verify.what.2': 'A letter with this reference exists on the portal',
    'verify.what.3': 'The letter has not been withdrawn',
    'verify.what.4': 'The stored text still matches the text that was signed',
    'verify.r.0': 'This is not an Anumati Setu letter code.',
    'verify.r.1': 'The code is damaged: its contents cannot be read.',
    'verify.r.2': 'The signing key of this code is not registered with the portal.',
    'verify.r.3': 'The signature does not match: the code was altered or was not issued by this portal.',
    'verify.r.4': 'The signature is genuine but no letter with this reference exists on the portal.',
    'verify.r.5': 'This letter has been withdrawn by the portal.',
    'verify.r.6': 'The stored letter no longer matches the signed code (its text was changed).',
  },
  hi: {
    'verify.title': 'पत्र सत्यापित करें',
    'verify.subtitle': 'जाँचें कि अनुमति सेतु द्वारा जारी पत्र या सूचना असली है। साइन इन की आवश्यकता नहीं।',
    'verify.in_title': 'हस्ताक्षरित कोड',
    'verify.code_label': 'क्यूआर कोड के नीचे छपा हस्ताक्षरित कोड यहाँ चिपकाएँ',
    'verify.code_hint': 'यह AS1. से शुरू होता है। पंक्ति-विराम और खाली स्थान नज़रअंदाज़ किए जाते हैं।',
    'verify.empty': 'पहले कोड चिपकाएँ या स्कैन करें।',
    'verify.btn_verify': 'सत्यापित करें',
    'verify.btn_clear': 'साफ़ करें',
    'verify.btn_genuine': 'असली नमूना आज़माएँ',
    'verify.btn_tampered': 'छेड़छाड़ किया नमूना आज़माएँ',
    'verify.btn_camera': 'कैमरे से स्कैन करें',
    'verify.btn_img': 'चित्र से स्कैन करें',
    'verify.btn_stop': 'कैमरा बंद करें',
    'verify.scan_hint': 'क्यूआर कोड को फ़्रेम के भीतर रखें।',
    'verify.cam_unsupported': 'यह ब्राउज़र कैमरा नहीं खोल सकता। कोड चिपकाएँ या चित्र का उपयोग करें।',
    'verify.cam_denied': 'कैमरा नहीं खुल सका ({msg})। कोड चिपकाएँ या चित्र का उपयोग करें।',
    'verify.img_none': 'उस चित्र में क्यूआर कोड नहीं मिला। अधिक स्पष्ट चित्र आज़माएँ, या कोड चिपकाएँ।',
    'verify.img_bad': 'वह फ़ाइल चित्र के रूप में पढ़ी नहीं जा सकी।',
    'verify.scanned': 'क्यूआर कोड पढ़ लिया गया। अब जाँच हो रही है…',
    'verify.sample_error': 'नमूना कोड लोड नहीं हो सके।',
    'verify.checking': 'हस्ताक्षर की जाँच हो रही है…',
    'verify.valid_title': 'असली पत्र',
    'verify.valid_text': 'हस्ताक्षर मान्य है, पत्र पोर्टल पर मौजूद है, वापस नहीं लिया गया है और उसका पाठ बदला नहीं गया है।',
    'verify.invalid_title': 'सत्यापित नहीं हुआ',
    'verify.invalid_text': 'इस पत्र पर भरोसा न करें।',
    'verify.f_ref': 'पत्र संदर्भ',
    'verify.f_kind': 'पत्र का प्रकार',
    'verify.f_inst': 'संस्था',
    'verify.f_app': 'आवेदन',
    'verify.f_issued': 'जारी करने की तिथि',
    'verify.f_subject': 'विषय',
    'verify.f_reason': 'कारण',
    'verify.what_title': 'क्या जाँचा जाता है',
    'verify.what_lead': 'हर पत्र पर पोर्टल की निजी कुंजी (Ed25519) से हस्ताक्षरित कोड होता है। इसे यहाँ कोई भी जाँच सकता है; किसी व्यक्तिगत जानकारी की आवश्यकता नहीं।',
    'verify.what.1': 'हस्ताक्षर इसी पोर्टल का है और कोड बदला नहीं गया',
    'verify.what.2': 'इस संदर्भ का पत्र पोर्टल पर मौजूद है',
    'verify.what.3': 'पत्र वापस नहीं लिया गया है',
    'verify.what.4': 'संग्रहीत पाठ अब भी हस्ताक्षरित पाठ से मेल खाता है',
    'verify.r.0': 'यह अनुमति सेतु के पत्र का कोड नहीं है।',
    'verify.r.1': 'कोड क्षतिग्रस्त है: उसकी सामग्री पढ़ी नहीं जा सकती।',
    'verify.r.2': 'इस कोड की हस्ताक्षर कुंजी पोर्टल में पंजीकृत नहीं है।',
    'verify.r.3': 'हस्ताक्षर मेल नहीं खाता: कोड बदला गया है या इस पोर्टल द्वारा जारी नहीं किया गया।',
    'verify.r.4': 'हस्ताक्षर असली है, परंतु इस संदर्भ का कोई पत्र पोर्टल पर मौजूद नहीं है।',
    'verify.r.5': 'यह पत्र पोर्टल द्वारा वापस ले लिया गया है।',
    'verify.r.6': 'संग्रहीत पत्र अब हस्ताक्षरित कोड से मेल नहीं खाता (उसका पाठ बदला गया है)।',
  },
});

const { meta, metaPromise } = await initPage({ roles: null, active: 'verify', title: 'verify.title', subtitle: 'verify.subtitle',
  breadcrumbs: [{ label: 'nav.home', href: 'index.html' }, { label: 'verify.title' }] });
let metaData = meta;
if (!metaData) metaPromise.then((m) => { metaData = m; renderResult(); });

const REASONS = [
  ['This is not an Anumati Setu letter code', 0], ['The code is damaged', 1], ['Signing key', 2], ['The signature does not match', 3],
  ['The signature is genuine but no letter', 4], ['This letter has been withdrawn', 5], ['The stored letter no longer matches', 6],
];

let last = null;      // last verify response
let samples = null;   // {genuine, tampered}
let verifying = false;
let scanMsg = null;   // function -> text | null
let stream = null;
let scanTimer = null;

const codeEl = $('#code');

function reasonText(r) {
  if (!r) return '';
  if (getLang() === 'hi') {
    const hit = REASONS.find(([p]) => r.startsWith(p));
    if (hit) return t(`verify.r.${hit[1]}`);
  }
  return r;
}

/** Accept a bare code, a code wrapped across lines, or a link that carries one. */
function extractCode(text) {
  const raw = String(text || '').trim();
  const m = raw.match(/AS1\.[A-Za-z0-9_.\-]+/);
  if (m) return m[0];
  return raw.replace(/\s+/g, '');
}

function renderStatic() {
  $('#in-h').textContent = t('verify.in_title');
  $('#lbl-code').textContent = t('verify.code_label');
  $('#code-hint').textContent = t('verify.code_hint');
  $('#btn-verify').innerHTML = `${icon('shield-check', 17)}<span>${esc(t('verify.btn_verify'))}</span>`;
  $('#btn-clear').textContent = t('verify.btn_clear');
  $('#btn-genuine').innerHTML = `${icon('check-circle', 15)}<span>${esc(t('verify.btn_genuine'))}</span>`;
  $('#btn-tampered').innerHTML = `${icon('alert', 15)}<span>${esc(t('verify.btn_tampered'))}</span>`;
  $('#btn-camera').innerHTML = `${icon('camera', 15)}<span>${esc(t('verify.btn_camera'))}</span>`;
  $('#btn-img').innerHTML = `${icon('scan', 15)}<span>${esc(t('verify.btn_img'))}</span>`;
  $('#btn-stop').textContent = t('verify.btn_stop');
  $('#scan-hint').textContent = t('verify.scan_hint');
  $('#what-h').textContent = t('verify.what_title');
  $('#what-lead').textContent = t('verify.what_lead');
  mount($('#what-list'), [1, 2, 3, 4].map((i) => el('li', {}, el('span', { class: 'icon', html: icon('check-circle', 16) }), el('span', {}, t(`verify.what.${i}`)))));
  mount($('#scan-msg'), scanMsg ? el('div', { class: 'alert warning' }, el('span', { class: 'icon', html: icon('info', 18) }), el('div', {}, scanMsg())) : null);
}

function renderResult() {
  const host = $('#result');
  if (verifying) { loading(host, t('verify.checking')); return; }
  if (!last) { mount(host); return; }
  const r = last;
  const kindDef = metaData && metaData.letter_kinds && metaData.letter_kinds[r.kind];
  const pairs = [
    r.ref ? [t('verify.f_ref'), `<span class="mono">${esc(r.ref)}</span>`] : null,
    r.kind ? [t('verify.f_kind'), esc(kindDef ? tl(kindDef) : r.kind)] : null,
    r.institution ? [t('verify.f_inst'), esc(r.institution)] : null,
    r.application ? [t('verify.f_app'), `<span class="mono">${esc(r.application)}</span>`] : null,
    r.issued_at ? [t('verify.f_issued'), esc(fmtDateTime(r.issued_at))] : null,
    r.subject ? [t('verify.f_subject'), esc(getLang() === 'hi' && r.subject_hi ? r.subject_hi : r.subject)] : null,
  ].filter(Boolean);
  mount(host, el('div', { class: `verify-result ${r.valid ? 'valid' : 'invalid'}`, role: 'status', tabindex: '-1', id: 'result-box' },
    el('div', { class: 'vr-head' },
      el('span', { class: 'vr-icon', html: icon(r.valid ? 'check' : 'x', 28) }),
      el('div', {}, el('h2', { class: 'vr-title' }, r.valid ? t('verify.valid_title') : t('verify.invalid_title')),
        el('div', {}, r.valid ? t('verify.valid_text') : t('verify.invalid_text')))),
    !r.valid && r.reason ? el('p', { style: { marginTop: '12px', fontWeight: '600' } }, `${t('verify.f_reason')}: ${reasonText(r.reason)}`) : null,
    pairs.length ? el('div', { style: { marginTop: '14px' } }, dl(pairs)) : null));
}

async function runVerify(text) {
  const code = extractCode(text);
  const errEl = $('#code-error');
  if (!code) {
    errEl.hidden = false; errEl.textContent = t('verify.empty'); codeEl.classList.add('invalid'); codeEl.focus();
    last = null; renderResult();
    return;
  }
  errEl.hidden = true; codeEl.classList.remove('invalid');
  codeEl.value = code;
  verifying = true; renderResult();
  try {
    last = await api.post('/public/verify', { code }, { noRedirect: true });
  } catch (e) {
    last = { valid: false, reason: e.message, kind: null };
  }
  verifying = false;
  renderResult();
  const box = $('#result-box');
  if (box) { box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); box.focus({ preventScroll: true }); }
}

async function loadSamples() {
  if (samples) return samples;
  try { samples = await api.get('/public/sample-code', null, { noRedirect: true }); } catch (e) { scanMsg = () => t('verify.sample_error'); renderStatic(); }
  return samples;
}

/* ------------------------------------------------------------------ camera / picture scanning */
function stopCamera() {
  clearTimeout(scanTimer); scanTimer = null;
  if (stream) { stream.getTracks().forEach((tr) => tr.stop()); stream = null; }
  const video = $('#cam');
  if (video) { video.pause(); video.srcObject = null; }
  $('#scan-panel').hidden = true;
}

function decode(imageData, w, h, both) {
  if (typeof window.jsQR !== 'function') return null;
  const res = window.jsQR(imageData.data, w, h, { inversionAttempts: both ? 'attemptBoth' : 'dontInvert' });
  return res && res.data ? res.data : null;
}

async function startCamera() {
  scanMsg = null; renderStatic();
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { scanMsg = () => t('verify.cam_unsupported'); renderStatic(); return; }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
  } catch (e) {
    const msg = e && e.name ? e.name : String(e);
    scanMsg = () => t('verify.cam_denied', { msg }); renderStatic(); return;
  }
  const video = $('#cam');
  video.srcObject = stream;
  $('#scan-panel').hidden = false;
  try { await video.play(); } catch (e) { /* autoplay quirks: the user can press play */ }
  const canvas = $('#scan-canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const tick = () => {
    if (!stream) return;
    if (video.readyState >= 2 && video.videoWidth) {
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const found = decode(ctx.getImageData(0, 0, canvas.width, canvas.height), canvas.width, canvas.height, false);
      if (found) { stopCamera(); scanMsg = () => t('verify.scanned'); renderStatic(); runVerify(found); return; }
    }
    scanTimer = setTimeout(tick, 220);
  };
  tick();
}

function scanPicture(file) {
  scanMsg = null; renderStatic();
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
    const canvas = $('#scan-canvas');
    canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const found = decode(ctx.getImageData(0, 0, canvas.width, canvas.height), canvas.width, canvas.height, true);
    if (found) { scanMsg = () => t('verify.scanned'); renderStatic(); runVerify(found); } else { scanMsg = () => t('verify.img_none'); renderStatic(); }
  };
  img.onerror = () => { URL.revokeObjectURL(url); scanMsg = () => t('verify.img_bad'); renderStatic(); };
  img.src = url;
}

/* ------------------------------------------------------------------ wiring */
$('#verify-form').addEventListener('submit', (ev) => { ev.preventDefault(); runVerify(codeEl.value); });
$('#btn-clear').addEventListener('click', () => { codeEl.value = ''; last = null; scanMsg = null; $('#code-error').hidden = true; codeEl.classList.remove('invalid'); renderStatic(); renderResult(); codeEl.focus(); });
$('#btn-genuine').addEventListener('click', (ev) => withBusy(ev.currentTarget, async () => { const s = await loadSamples(); if (s) await runVerify(s.genuine); }));
$('#btn-tampered').addEventListener('click', (ev) => withBusy(ev.currentTarget, async () => { const s = await loadSamples(); if (s) await runVerify(s.tampered); }));
$('#btn-camera').addEventListener('click', () => { stopCamera(); startCamera(); });
$('#btn-stop').addEventListener('click', stopCamera);
$('#btn-img').addEventListener('click', () => $('#img-file').click());
$('#img-file').addEventListener('change', (ev) => { const f = ev.target.files && ev.target.files[0]; if (f) scanPicture(f); ev.target.value = ''; });
window.addEventListener('pagehide', stopCamera);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopCamera(); });

renderStatic();
onLang(() => { renderStatic(); renderResult(); });

const pre = getParam('code');
if (pre) runVerify(pre);
