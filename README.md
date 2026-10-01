# DRVENO — Wood, made to live.

Brand site and curated collection for **DRVENO**, a family woodworking atelier in Serbia with consultation in Switzerland.
It is built in **English, German (Swiss Standard German) and Serbian (Latin script)**, and every language is a first-class version of the site.

- **Stack:** [Astro](https://astro.build) 7, static output, no client framework. The JS is small and split per feature.
- **Hosting:** any static host. Netlify is configured: forms, `_redirects`, `_headers` and `netlify.toml`.
- **Content:** YAML files with a separate block per language. They can be edited in Decap CMS at `/admin/`.

```bash
npm install
npm run dev        # http://localhost:4321  (/ redirects to /en/, /de/ or /sr/)
npm run build      # → dist/
npm run qa         # static SEO / translation / a11y checks over dist/
npm run test:e2e   # browser journeys in all three languages (Playwright + Chromium)
npm run images     # regenerate the placeholder artwork
```

---

## URL structure

| Page | English | German | Serbian |
|---|---|---|---|
| Home | `/en/` | `/de/` | `/sr/` |
| Work / collection | `/en/work/` | `/de/arbeiten/` | `/sr/radovi/` |
| Wooden windows | `/en/windows/` | `/de/fenster/` | `/sr/prozori/` |
| Heritage & restoration | `/en/heritage-restoration/` | `/de/denkmalpflege-restaurierung/` | `/sr/nasledje-restauracija/` |
| Our story | `/en/our-story/` | `/de/unsere-geschichte/` | `/sr/nasa-prica/` |
| How we work | `/en/how-we-work/` | `/de/so-arbeiten-wir/` | `/sr/kako-radimo/` |
| Switzerland | `/en/switzerland/` | `/de/schweiz/` | `/sr/svajcarska/` |
| Projects | `/en/projects/` | `/de/projekte/` | `/sr/projekti/` |
| Journal | `/en/journal/` | `/de/journal/` | `/sr/iz-radionice/` |
| Start a project | `/en/start-a-project/` | `/de/projekt-starten/` | `/sr/pokrenite-projekat/` |
| Contact | `/en/contact/` | `/de/kontakt/` | `/sr/kontakt/` |

Detail pages use translated slugs from the content files, for example `/de/arbeiten/esstisch-massive-eiche/`.
All slugs are defined in `src/i18n/routes.ts`.

## Project layout

```
src/
  config/site.ts          business config: contact details, GTM, forms  ← VERIFY before launch
  i18n/config.ts          locales: html lang, hreflang, analytics locale
  i18n/routes.ts          translated slugs
  i18n/ui.ts              interface strings: nav, forms, validation, consent…
  i18n/copy/*.ts          page copy, one { en, de, sr } object per page
  content/                products/, projects/, journal/ — one YAML per entry
  content.config.ts       content schema (validated at build)
  views/*.astro           page templates
  components/*.astro      Header, LangSwitch, EnquiryForm, Gallery, BeforeAfter…
  scripts/*.ts            analytics, consent, language, forms, gallery…
  lib/pages.ts            builds every URL plus its language alternates
  lib/schema.ts           JSON-LD builders
  pages/[lang]/[...slug].astro   single router for all localized pages
  pages/sitemap.xml.ts, robots.txt.ts, index.astro (language chooser), 404.astro
public/admin/             Decap CMS
scripts/                  qa.mjs, e2e.mjs, generate-placeholders.mjs
```

## Multilingual architecture

- **Locales.** `en` (`<html lang="en">`), `de` (`de-CH`) and `sr` (`sr-Latn-RS`). Hreflang values are `en`, `de-CH` and `sr-RS`, plus `x-default` → English.
- **Canonicals.** Every page canonicalizes to itself; translations are never canonicalized to English.
- **Metadata.** Each language has its own title, description, Open Graph tags, alt text and JSON-LD text. JSON-LD carries `inLanguage`.
- **Sitemap.** `sitemap.xml` lists every indexable language version with its `xhtml:link` alternates.
- **Language selector.** `DE · EN · SR`, text only with no flags. It links to the *equivalent* page in the other language.
- **Persisted choice.** A manual choice is stored in `localStorage` and in the functional cookie `drveno_lang`.
- **Language detection.** It only happens at `/`. The order is: stored choice, then browser language, then English. Croatian, Bosnian and Montenegrin browsers get Serbian.
  - Inner pages never redirect.
  - On a first visit, a dismissible hint may suggest the visitor's browser language. The hint is written in that language.
  - There is no IP-based logic.
- **Wrong-language slugs.** These get a 301 to the right one, for example `/de/windows/` → `/de/fenster/`. Each language has its own 404 page with a real 404 status. See `src/lib/host-files.mjs`.
- **Serbian Cyrillic later.** Add `sr-cyrl` to `src/i18n/config.ts`, its slugs to `routes.ts`, a dictionary to `ui.ts` and `copy/*`, and `sr-cyrl` blocks to the content. EB Garamond and Inter already ship Cyrillic subsets, loaded on demand.

## Editing content (no code)

Products, projects and journal posts are YAML files in `src/content/`. Each file looks like this:

```yaml
category: tables            # language-neutral data
cover: { src: ../../assets/images/table-oak.jpg, alt: { en: …, de: …, sr: … } }
i18n:
  en: { slug: solid-oak-dining-table, name: …, summary: …, … }
  de: { slug: esstisch-massive-eiche, name: …, … }
  sr: { slug: trpezarijski-sto-od-masivnog-hrasta, name: …, … }
```

- If you leave a language block out, that version simply isn't published. Hreflang and the sitemap adjust automatically.
- The schema in `src/content.config.ts` validates everything at build time.
- **CMS:** `/admin/` (Decap CMS, GitHub backend, editorial workflow). Every field appears once per language in collapsible sections.
  - Set the repository and branch in `public/admin/config.yml`.
  - Enable GitHub OAuth, for example through Netlify.

## Forms and enquiries

There are three forms, all built from one component (`EnquiryForm.astro`):

| Form | Page | Events |
|---|---|---|
| Quote | Start a project | `quote_form_start / _error / _submit`, `project_file_added` |
| Consultation | Switzerland | `consultation_start / _error / _submit` |
| Contact | Contact | `contact_form_start / _error / _submit` |

- **Translated.** Labels, hints, options, validation, loading, success and error messages are all translated. Validation is custom and accessible (`aria-invalid`, `aria-describedby`, focus on the first error, a live summary). No browser-English validation bubbles appear.
- **Language-neutral data.** Field names and option values are the same in every language. A hidden `language` field tells the workshop which language to reply in.
- **Files.** Up to 5 files, 8 MB in total: JPG, PNG, HEIC, WebP, PDF, DWG, DXF.
- **Pre-fill.** `?type=windows&piece=<id>` pre-selects the project type and shows the reference piece. This is used by "Request a quote" and "Customize this piece".
- **Delivery.** Netlify Forms by default (forms `quote`, `consultation`, `contact`, with a honeypot). Set notification emails in the Netlify UI.
  - To use your own backend, set `PUBLIC_FORM_ENDPOINT`. It must accept a multipart POST and return 2xx.
  - Without JavaScript the form posts natively to the localized thank-you page.

## Analytics (`window.dataLayer`, GTM-compatible)

Every event includes `language` (`en|de|sr`), `locale` (`en|de-CH|sr-RS`) and `page_type`.
`src/scripts/analytics.ts` strips any key that could carry PII (name, email, phone, message, address, city, file names, …). It also drops any value that looks like an email address or a phone number.

| Event | Parameters |
|---|---|
| `page_view` | `page_type, page_title, page_path, language, locale, country_context` (`CH` on Switzerland pages, otherwise `EU`) |
| `language_change` | `previous_language, selected_language, page_type, page_path` |
| `view_item_list` / `select_item` / `view_item` | GA4 `items[]` with `item_id`, `item_category`. No prices are published. |
| `view_project`, `portfolio_filter` (`filter_value, results_count`), `gallery_interaction`, `before_after_interaction` | |
| `start_project` | `location`. CTA clicks are **not** leads. |
| `quote_form_start`, `quote_form_error` (`error_fields, error_types`), **`quote_form_submit`** (primary conversion), `project_file_added` (`file_count, file_types, total_size`) | |
| `consultation_start`, **`consultation_submit`**, `contact_form_submit` | secondary conversions |
| `contact_click` | `contact_method: phone/email/whatsapp, link_location`. Secondary conversion. |
| `shipping_info_view` | `trigger: scroll/open` |
| `consent_update` | `analytics_consent, marketing_consent` |

`add_to_cart`, `begin_checkout`, `purchase` and the other ecommerce events are intentionally not implemented: every piece is made to order and priced individually. The `items[]` format already matches GA4, so they can be added if a cart is ever introduced.

### Consent

- **Banner.** Shown in the page language, with *Accept all / Essential only / Choose settings*. Settings can be reopened from "Cookie settings" in every footer.
- **Consent Mode.** Google Consent Mode v2 defaults are all *denied* before anything loads.
- **`PUBLIC_CONSENT_MODE=basic`** (default): GTM loads only after analytics or marketing consent.
- **`advanced`:** GTM loads with the denied defaults.
- **Performance.** GTM is always injected after `load`, so it never competes with the LCP image.

## Performance (Core Web Vitals)

- **Images.**
  - AVIF and WebP `srcset`/`sizes` with a JPEG fallback, and intrinsic width/height.
  - Below-the-fold images are lazy.
  - The hero/LCP image is `eager` with `fetchpriority="high"`.
- **Fonts.**
  - Two families: EB Garamond 500 for headings and Inter variable for text.
  - Both are self-hosted and subset by `unicode-range` (Latin, Latin-ext, Cyrillic on demand).
  - The Latin subsets are preloaded, plus Latin-ext on Serbian pages.
  - Metric-adjusted fallbacks prevent layout shift.
- **CSS.** One shared stylesheet; all language versions load the same assets.
- **JS.** About 10 KB of core JS. Forms, gallery, filters and before/after load only on the pages that use them.
- **Hero video.** Optional and desktop-only (`site.heroVideo`). It loads after `load` with a poster image and never plays on mobile, with Save-Data, or with reduced motion.
- **Measured locally** (390px, 1.6 Mbps, 150 ms RTT, 4× CPU slowdown): LCP 1.4–1.8 s and CLS 0.000 on home, windows, product, project and quote pages.

## Accessibility

- Semantic landmarks, one `h1` per page and a skip link.
- Visible focus states and keyboard-operable everything.
- Native `<dialog>` for the menu and the consent settings.
- Labelled form controls, with errors announced and linked to their fields.
- Touch targets of 44px or more, and reduced-motion support.
- `<html lang>` is set per language.

## Verify before launch

1. **Photography.** Everything in `src/assets/images/` is *generated placeholder artwork*. Replace each file with real DRVENO photography of the same name; any size works.
2. **Contact details.** Fill in `src/config/site.ts`: email, phones, WhatsApp, legal name. Then set `contact.verified = true` so they also appear in structured data.
3. **Imprint and privacy.** Complete the placeholders in `src/i18n/copy/legal.ts` and have them reviewed by a legal professional.
4. **Projects.** Projects in `src/content/projects/` describe the *types* of work in the brief, without invented places, dates or client quotes. Replace them with verified project details.
5. **European Heritage Hub.** Confirm the wording on the heritage page (`src/i18n/copy/heritage.ts`) matches the actual project involvement.
6. **Hosting and integrations.**
   - Set `SITE_URL`.
   - Set `PUBLIC_GTM_ID`, and configure GA4 tags in GTM using the events above.
   - Set Netlify form notifications.
7. **Translations.** Have a native speaker do a final read of the German and Serbian copy.
