import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'program',
  title: 'Program',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug', title: 'Slug (web address)', type: 'slug',
      options: { source: 'title', maxLength: 96 },
      description: 'Auto-fills from the title. This becomes /programs/your-slug.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'shortDescription', title: 'Short description', type: 'text', rows: 2, description: 'One line shown on the card and hero.', validation: (r) => r.required() }),
    defineField({
      name: 'image', title: 'Photo', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text (describe the photo)', validation: (r) => r.required() }],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'badge', title: 'Badge (optional)', type: 'string', description: 'e.g. "Most booked". Leave blank for none.' }),
    defineField({ name: 'body', title: 'Full page content', type: 'blockContent', description: 'The detail shown on this program\'s own page.' }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Lower numbers show first.', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'shortDescription', media: 'image' } },
});
