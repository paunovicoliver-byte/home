import { initAnalytics } from './analytics';
import { initConsent } from './consent';
import { initLang } from './lang';
import { initUi } from './ui';

initAnalytics();
initUi();
initLang();
initConsent();

// Feature modules load only on pages that need them.
if (document.querySelector('form[data-enquiry]')) import('./forms').then((m) => m.initForms());
if (document.querySelector('[data-gallery]')) import('./gallery').then((m) => m.initGalleries());
if (document.querySelector('[data-before-after]')) import('./before-after').then((m) => m.initBeforeAfter());
if (document.querySelector('[data-filters]')) import('./filters').then((m) => m.initFilters());
