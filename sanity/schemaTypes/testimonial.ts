import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'titleCompany', title: 'Title & company', type: 'string', description: 'e.g. VP Sales, mid-market SaaS' }),
    defineField({
      name: 'image', title: 'Photo (optional)', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required() }],
    }),
    defineField({ name: 'rating', title: 'Star rating', type: 'number', initialValue: 5, validation: (r) => r.required().min(1).max(5) }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Lower numbers show first.', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'titleCompany', media: 'image' } },
});
