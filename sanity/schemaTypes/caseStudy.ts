import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    defineField({ name: 'category', title: 'Category label', type: 'string', description: 'e.g. SaaS · 12 reps', validation: (r) => r.required() }),
    defineField({ name: 'headlineStat', title: 'Headline result', type: 'string', description: 'e.g. +30% close rate', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({
      name: 'image', title: 'Photo', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text (describe the photo)', validation: (r) => r.required() }],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Lower numbers show first.', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'headlineStat', subtitle: 'category', media: 'image' } },
});
