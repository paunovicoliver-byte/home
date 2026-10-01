import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Structured, locale-based content model.
 *
 * Every entry is one YAML file. Language-neutral data (images, category,
 * year…) sits at the top level; every piece of text lives in a separate
 * block per language under `i18n.en`, `i18n.de`, `i18n.sr`. A language
 * block may be omitted — that version is then simply not published, and
 * hreflang/sitemap only reference the languages that exist.
 *
 * Editors can manage all of this in the CMS at /admin/ without touching code.
 */

const localizedString = z.object({ en: z.string(), de: z.string(), sr: z.string() });

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens (no diacritics).');

const perLocale = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({ en: schema.optional(), de: schema.optional(), sr: schema.optional() });

const products = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/products' }),
  schema: ({ image }) => {
    const pic = z.object({ src: image(), alt: localizedString });
    return z.object({
      category: z.enum(['windows', 'heritage', 'tables', 'doors', 'custom']),
      projectType: z.enum(['windows', 'heritage-windows', 'table', 'door', 'furniture', 'restoration', 'other']),
      order: z.number().default(100),
      featured: z.boolean().default(false),
      woods: z.array(z.enum(['oak', 'walnut', 'ash', 'cherry', 'larch', 'spruce'])).default([]),
      customizable: z.boolean().default(true),
      cover: pic,
      gallery: z.array(pic).default([]),
      i18n: perLocale(
        z.object({
          slug,
          name: z.string(),
          summary: z.string(),
          story: z.array(z.string()),
          wood: z.string(),
          dimensions: z.string(),
          finish: z.string(),
          specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
          care: z.array(z.string()).default([]),
          seoTitle: z.string().optional(),
          seoDescription: z.string(),
        }),
      ),
    });
  },
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/projects' }),
  schema: ({ image }) => {
    const pic = z.object({ src: image(), alt: localizedString });
    return z.object({
      order: z.number().default(100),
      featured: z.boolean().default(false),
      filters: z.array(z.enum(['windows', 'heritage', 'houses', 'public', 'tables', 'doors', 'custom'])).min(1),
      year: z.number().int().optional(),
      cover: pic,
      gallery: z.array(pic).default([]),
      beforeAfter: z.object({ before: pic, after: pic }).optional(),
      i18n: perLocale(
        z.object({
          slug,
          title: z.string(),
          summary: z.string(),
          location: z.string().optional(),
          type: z.string(),
          story: z.array(z.string()),
          challenge: z.array(z.string()).default([]),
          approach: z.array(z.string()).default([]),
          materials: z.array(z.string()).default([]),
          quote: z.object({ text: z.string(), author: z.string() }).optional(),
          seoDescription: z.string(),
        }),
      ),
    });
  },
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/journal' }),
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      cover: z.object({ src: image(), alt: localizedString }),
      i18n: perLocale(
        z.object({
          slug,
          title: z.string(),
          excerpt: z.string(),
          /** Markdown */
          body: z.string(),
          seoDescription: z.string(),
        }),
      ),
    }),
});

export const collections = { products, projects, journal };
