import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

// True only when a Sanity project is configured. When false, the query layer
// serves the demo defaults so the site still builds and renders.
export const hasSanity = Boolean(projectId);

export const sanity = hasSanity
  ? createClient({ projectId, dataset, apiVersion: '2024-01-01', useCdn: true })
  : null;

const builder = sanity ? imageUrlBuilder(sanity) : null;

// Resolve a Sanity image (or an already-plain URL string) to a URL string.
export function imageUrl(source: any, width = 1000): string | undefined {
  if (!source) return undefined;
  if (typeof source === 'string') return source;
  if (builder) return builder.image(source).width(width).auto('format').url();
  return undefined;
}
