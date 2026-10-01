/* Runs inline in <head> before anything else. Keep tiny and dependency-free.
   - marks JS availability
   - creates window.dataLayer and Google Consent Mode defaults (all denied)
   - restores a previously stored consent choice
   - loads GTM only when allowed (basic mode: after consent; advanced: always, with denied defaults) */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  var C = window.__DRVENO || {};
  var dl = (window.dataLayer = window.dataLayer || []);
  function gtag() { dl.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500,
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', false);
  dl.push({ language: C.language, locale: C.locale, page_type: C.pageType, country_context: C.countryContext });

  var stored = null;
  try { stored = JSON.parse(localStorage.getItem('drveno_consent') || 'null'); } catch (e) {}
  if (stored && stored.v === C.consentVersion) {
    var m = stored.marketing ? 'granted' : 'denied';
    gtag('consent', 'update', {
      analytics_storage: stored.analytics ? 'granted' : 'denied',
      ad_storage: m, ad_user_data: m, ad_personalization: m,
    });
    d.setAttribute('data-consent', 'set');
  }

  window.__loadGtm = function () {
    if (!C.gtmId || window.__gtmLoaded) return;
    window.__gtmLoaded = true;
    dl.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(C.gtmId);
    document.head.appendChild(s);
  };
  var allowed = C.consentMode === 'advanced' || (stored && stored.v === C.consentVersion && (stored.analytics || stored.marketing));
  if (C.gtmId && allowed) {
    // After load, so third-party code never competes with the LCP image.
    if (document.readyState === 'complete') window.__loadGtm();
    else addEventListener('load', function () { setTimeout(window.__loadGtm, 0); });
  }
})();
