/**
 * Central business configuration.
 *
 * Everything marked VERIFY must be confirmed by DRVENO before launch.
 * Unverified contact details are shown on the site (so the journeys work),
 * but they are kept OUT of structured data until `verified` is set to true,
 * so search engines never receive invented company details.
 */
export const site = {
  name: 'DRVENO',
  legalName: 'DRVENO', // VERIFY: registered business name
  foundingCountry: 'RS',

  contact: {
    verified: false, // set to true once the details below are real
    email: 'atelier@drveno.com', // VERIFY
    phone: '+381 00 000 0000', // VERIFY — Serbia workshop
    phoneHref: '+3810000000',
    whatsapp: '+381000000000', // VERIFY — digits only, international format
    switzerland: {
      phone: '+41 00 000 00 00', // VERIFY — Swiss contact presence
      phoneHref: '+41000000000',
      region: 'Schweiz / Suisse / Svizzera', // displayed region, no street address
    },
  },

  social: {
    instagram: '', // e.g. https://www.instagram.com/drveno — leave empty to hide
  },

  /** Optional hero video for desktop (path under /public). Null = static image only. */
  heroVideo: null as null | { webm?: string; mp4?: string },

  analytics: {
    gtmId: import.meta.env.PUBLIC_GTM_ID || '',
    consentMode: (import.meta.env.PUBLIC_CONSENT_MODE || 'basic') as 'basic' | 'advanced',
  },

  forms: {
    /** Empty = Netlify Forms. Otherwise an endpoint accepting multipart POST. */
    endpoint: import.meta.env.PUBLIC_FORM_ENDPOINT || '',
    maxFiles: 5,
    maxTotalBytes: 8 * 1024 * 1024, // Netlify Forms limit per submission
    accept: '.jpg,.jpeg,.png,.heic,.webp,.pdf,.dwg,.dxf',
  },
} as const;
