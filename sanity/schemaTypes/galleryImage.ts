import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'galleryImage',
  title: 'Gallery Photo',
  type: 'document',
  fields: [
    defineField({
      name: 'image', title: 'Photo', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text (describe the photo)', validation: (r) => r.required() }],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Lower numbers show first.', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { media: 'image', subtitle: 'image.alt' }, prepare: ({ media, subtitle }) => ({ title: subtitle || 'Gallery photo', media }) },
});
