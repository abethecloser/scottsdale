import type { SiteSettings, BlogPost } from './defaults';

const BUSINESS = 'Scottsdale Sales Training';

export function localBusinessJsonLd(s: SiteSettings, siteUrl: string): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS,
    description: 'Sales training, coaching and team workshops in Scottsdale, Arizona.',
    areaServed: s.address || 'Scottsdale, AZ',
    telephone: s.tel,
    email: s.email,
    url: siteUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Scottsdale',
      addressRegion: 'AZ',
      addressCountry: 'US',
    },
    openingHours: 'Mo-Fr 08:00-17:00',
    founder: { '@type': 'Person', name: 'Brad', jobTitle: 'Founder & Head Coach' },
  });
}

export function blogPostingJsonLd(post: BlogPost, url: string): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImageUrl || undefined,
    datePublished: post.publishedAt,
    url,
    publisher: { '@type': 'Organization', name: BUSINESS },
    author: post.author?.name
      ? { '@type': 'Person', name: post.author.name }
      : { '@type': 'Organization', name: BUSINESS },
  });
}
