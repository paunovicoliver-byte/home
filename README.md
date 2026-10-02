# DRVENO — Wood, made to live.

Website for **DRVENO**, a family woodworking atelier in Serbia with consultation in Switzerland.
It is written in **English, German (Swiss) and Serbian (Latin script)**.

This is a **plain static website**: ready-made HTML, CSS, JavaScript and images.
There is no build step, and no Node.js or other software to install.

## Look at it

- **On your computer:** double-click `index.html`. It opens in German, English or Serbian depending on your browser language. Every page, link, menu, gallery and language switch works offline.
  - The forms only *send* once the site is online.
  - Chrome may print harmless font-preload messages in its developer console when you open the site from disk.
- **Online in a minute:** drag the whole folder onto <https://app.netlify.com/drop> and you get a live link.

## Put it online

Upload the folder's contents to any web host. The `index.html` at the root is the start page.

| Host | How |
|---|---|
| **Netlify** (recommended) | *Add new site → Import from GitHub → this repository*. There is no build command, and the site is published from the repository root (already set in `netlify.toml`). Forms, redirects and caching headers work automatically. |
| GitHub Pages | *Settings → Pages → Deploy from branch → `main` / root*. The site works, but GitHub Pages ignores `_redirects` and `_headers`, and the forms need another backend (see "Forms" below). |
| Any other host (FTP, cPanel…) | Upload everything except `README.md`, `netlify.toml` and the `.claude` folder. |

## What's where

```
index.html            start page: sends visitors to /de/, /en/ or /sr/
en/  de/  sr/         one folder per language, one folder per page (…/index.html)
  en/windows/         de/fenster/          sr/prozori/
  en/work/<piece>/    de/arbeiten/<stück>/ sr/radovi/<komad>/
  en/projects/…       de/projekte/…        sr/projekti/…
  en/journal/…        de/journal/…         sr/iz-radionice/…
css/site.css          all styling (colours are at the top, under :root)
js/site.js            menu, language switch, cookie consent, forms, gallery, analytics
assets/               images (each photo in several sizes and formats) and fonts
sitemap.xml, robots.txt, 404.html, favicon.svg
_redirects, _headers  web-server rules: localized 404 pages, redirects, caching (Netlify / Cloudflare)
```

Every page exists three times, once per language. Text changes need to be made in each language's file.

## Editing

**Text.** Open the page's `index.html` in any text editor (for example VS Code, or Notepad) and change the words between the tags. Do the same in the other two language versions. Each page also has a `<title>` and a `<meta name="description">` near the top: these are what Google shows.

**Contact details, site-wide.** The placeholders below appear in almost every page. Use *Find and replace in files* in your editor (in VS Code: Ctrl/Cmd + Shift + H):

| Placeholder | Replace with |
|---|---|
| `atelier@drveno.com` | your email |
| `+381 00 000 0000` and `+3810000000` | workshop phone (displayed and dialling form) |
| `+41 00 000 00 00` and `+41000000000` | Swiss contact phone |
| `wa.me/381000000000` | your WhatsApp number (digits only) |
| `https://www.drveno.com` | your real domain (canonical links, sitemap, social previews) |

**Photos.**
- All images are currently *generated placeholder artwork*.
- For speed, every photo exists in several sizes and formats (`.avif`, `.webp`, `.jpg`) inside a `<picture>` element.
- The simplest way to use a real photo is to replace that page's whole `<picture>…</picture>` block with one line:
  ```html
  <img src="../assets/my-photo.jpg" alt="Describe the photo" width="1600" height="1200" loading="lazy">
  ```
  Put `my-photo.jpg` in `assets/`, and keep the same number of `../` as the other links on that page. For the large photo at the top of a page, use `loading="eager"` instead of `lazy`.

**Analytics (Google Tag Manager).** Each page contains `"gtmId":""` near the top. Replace it everywhere with your container ID, e.g. `"gtmId":"GTM-XXXXXXX"`. GTM only loads after a visitor accepts analytics or marketing cookies.

## Built-in features

- **Three languages.** Each language has its own web addresses, page titles, descriptions, social-preview text and search-engine data. The pages point search engines to each other's translations (`hreflang`) and to themselves as the original (canonical). `sitemap.xml` lists all of them.
- **Language selector.** `DE · EN · SR`, with no flags. It remembers the visitor's choice and never forces a language based on location.
- **Forms.**
  - There are three forms: project/quote, consultation (on the Switzerland page) and contact.
  - They are fully translated, including error messages, accept file uploads, and are sent through Netlify Forms.
  - On another host, give each form's `data-endpoint` attribute your form service's address, e.g. `data-endpoint="https://formspree.io/f/xxxx"`.
- **Cookie consent and analytics.** The consent banner appears in the page's language. Google Consent Mode defaults to "denied". A `window.dataLayer` records events such as `page_view`, `language_change`, `quote_form_submit` and `contact_click`. Every event includes the language, and no personal data is ever included.
- **Performance and accessibility.** Pages are mobile first, with responsive images and the main image prioritised. Keyboard navigation, focus states and labelled forms are built in, and reduced-motion settings are respected.

## History

Up to commit `867b73a` ("Support browsing the site from disk"), this site was generated with the Astro framework, with all translations in one place, automatic image resizing, a content editor and automated tests. If you ever want those conveniences back, that version can be restored from that commit. The pages here are exactly what it produced.

## Before launch

1. Replace the placeholder photos with real photography.
2. Replace the placeholder contact details (see the table above).
3. Complete the imprint (`en/imprint/`, `de/impressum/`, `sr/impresum/`) and have the privacy pages reviewed by a legal professional.
4. Replace the example projects with verified project details.
5. Check the European Heritage Hub wording on the heritage page.
6. Have native speakers do a final read of the German and Serbian text.
