/* Anumati Setu - runtime config (classic script, load before any module).
   siteBase: absolute URL of the site root (works at / locally and at /anumati-setu/ on GitHub Pages).
   apiBase : '' when the API is on the same origin (local FastAPI serves both); the Render URL on GitHub Pages.
   Override for testing:  localStorage.setItem('as_api_base', 'http://127.0.0.1:8240')                      */
(function () {
  var src = (document.currentScript && document.currentScript.src) || '';
  var siteBase = src ? src.replace(/assets\/js\/config\.js(\?.*)?$/, '') : location.origin + '/';
  var onPages = /\.github\.io$/.test(location.hostname);
  var override = null;
  try { override = localStorage.getItem('as_api_base'); } catch (e) { /* storage blocked */ }
  window.AS_CONFIG = {
    siteBase: siteBase,
    apiBase: override !== null ? override : (onPages ? 'https://anumati-setu-cr2z.onrender.com' : ''),
    hosted: onPages,
    version: '1.0.0'
  };
  // apply saved accessibility preferences before first paint
  try {
    var fs = localStorage.getItem('as_font_scale');
    if (fs) document.documentElement.style.fontSize = fs;
    if (localStorage.getItem('as_contrast') === '1') document.documentElement.classList.add('as-contrast');
    var lang = localStorage.getItem('as_lang');
    if (lang) document.documentElement.lang = lang;
  } catch (e) { /* ignore */ }
})();
