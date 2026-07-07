// Query layer. Each helper returns normalised, render-ready data:
//  - image fields resolved to URL strings (via imageUrl)
//  - Sanity content when a project is connected and has data
//  - the demo defaults otherwise (or per-field for Site Settings)
// Components therefore have a single, simple render path and the site is never
// blank. GROQ is only run when `hasSanity` is true.

import { sanity, hasSanity, imageUrl } from './sanity';
import {
  DEFAULT_SETTINGS, DEFAULT_PROGRAMS, DEFAULT_TEAM, DEFAULT_TESTIMONIALS,
  DEFAULT_CASE_STUDIES, DEFAULT_GALLERY, DEFAULT_POSTS,
  type SiteSettings, type Program, type TeamMember, type Testimonial,
  type CaseStudy, type GalleryImage, type BlogPost,
} from './defaults';

const telFrom = (phone: string) => '+1' + (phone || '').replace(/\D/g, '');

export async function getSiteSettings(): Promise<SiteSettings> {
  const D = DEFAULT_SETTINGS;
  if (!hasSanity) return D;
  const s = await sanity!.fetch(`*[_type == "siteSettings"][0]`);
  if (!s) return D;
  const phone = s.phone || D.phone;
  return {
    phone,
    tel: telFrom(phone),
    email: s.email || D.email,
    address: s.address || D.address,
    hours: s.hours || D.hours,
    heroSubheadline: s.heroSubheadline || D.heroSubheadline,
    heroImageUrl: imageUrl(s.heroImage, 1700) || D.heroImageUrl,
    heroImageAlt: s.heroImage?.alt || D.heroImageAlt,
    statWinRate: s.statWinRate || D.statWinRate,
    statTrained: s.statTrained || D.statTrained,
    statRampWeeks: s.statRampWeeks || D.statRampWeeks,
  };
}

export async function getPrograms(): Promise<Program[]> {
  if (!hasSanity) return DEFAULT_PROGRAMS;
  const rows = await sanity!.fetch(
    `*[_type == "program"] | order(order asc){ title, "slug": slug.current, shortDescription, image, badge }`
  );
  if (!rows?.length) return DEFAULT_PROGRAMS;
  return rows.map((p: any) => ({
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    imageUrl: imageUrl(p.image, 800) || '',
    imageAlt: p.image?.alt || p.title,
    badge: p.badge,
  }));
}

export async function getProgramBySlug(slug: string): Promise<Program | undefined> {
  if (!hasSanity) return DEFAULT_PROGRAMS.find((p) => p.slug === slug);
  const p = await sanity!.fetch(
    `*[_type == "program" && slug.current == $slug][0]{ title, "slug": slug.current, shortDescription, body, image }`,
    { slug }
  );
  if (!p) return undefined;
  return {
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    imageUrl: imageUrl(p.image, 1400) || '',
    imageAlt: p.image?.alt || p.title,
    body: p.body,
  };
}

export async function getTeam(): Promise<TeamMember[]> {
  if (!hasSanity) return DEFAULT_TEAM;
  const rows = await sanity!.fetch(`*[_type == "teamMember"] | order(order asc){ name, role, image }`);
  if (!rows?.length) return DEFAULT_TEAM;
  return rows.map((t: any) => ({
    name: t.name,
    role: t.role,
    imageUrl: imageUrl(t.image, 500) || '',
    imageAlt: t.image?.alt || t.name,
  }));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!hasSanity) return DEFAULT_TESTIMONIALS;
  const rows = await sanity!.fetch(
    `*[_type == "testimonial"] | order(order asc){ quote, name, titleCompany, image, rating }`
  );
  if (!rows?.length) return DEFAULT_TESTIMONIALS;
  return rows.map((t: any) => ({
    quote: t.quote,
    name: t.name,
    titleCompany: t.titleCompany,
    imageUrl: imageUrl(t.image, 120),
    rating: t.rating || 5,
  }));
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  if (!hasSanity) return DEFAULT_CASE_STUDIES;
  const rows = await sanity!.fetch(
    `*[_type == "caseStudy"] | order(order asc){ category, headlineStat, description, image }`
  );
  if (!rows?.length) return DEFAULT_CASE_STUDIES;
  return rows.map((c: any) => ({
    category: c.category,
    headlineStat: c.headlineStat,
    description: c.description,
    imageUrl: imageUrl(c.image, 800) || '',
    imageAlt: c.image?.alt || c.category,
  }));
}

export async function getGallery(): Promise<GalleryImage[]> {
  if (!hasSanity) return DEFAULT_GALLERY;
  const rows = await sanity!.fetch(`*[_type == "galleryImage"] | order(order asc){ image }`);
  if (!rows?.length) return DEFAULT_GALLERY;
  return rows.map((g: any) => ({
    imageUrl: imageUrl(g.image, 600) || '',
    imageAlt: g.image?.alt || '',
  }));
}

const mapPost = (p: any): BlogPost => ({
  title: p.title,
  slug: p.slug,
  category: p.category,
  excerpt: p.excerpt,
  coverImageUrl: imageUrl(p.coverImage, 800) || '',
  coverImageAlt: p.coverImage?.alt || p.title,
  publishedAt: p.publishedAt,
  seoTitle: p.seoTitle,
  metaDescription: p.metaDescription,
  author: p.author
    ? { name: p.author.name, role: p.author.role, imageUrl: imageUrl(p.author.image, 120) }
    : undefined,
  body: p.body,
});

export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!hasSanity) return DEFAULT_POSTS;
  const rows = await sanity!.fetch(
    `*[_type == "blogPost" && status == "published" && publishedAt <= now()] | order(publishedAt desc){ title, "slug": slug.current, category, excerpt, coverImage, publishedAt }`
  );
  if (!rows?.length) return DEFAULT_POSTS;
  return rows.map(mapPost);
}

export async function getLatestPosts(n: number): Promise<BlogPost[]> {
  const posts = await getPublishedPosts();
  return posts.slice(0, n);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  if (!hasSanity) return DEFAULT_POSTS.find((p) => p.slug === slug);
  const p = await sanity!.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0]{ title, "slug": slug.current, category, excerpt, coverImage, body, publishedAt, seoTitle, metaDescription, author->{name, role, image} }`,
    { slug }
  );
  return p ? mapPost(p) : undefined;
}
