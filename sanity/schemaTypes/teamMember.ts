import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'teamMember',
  title: 'Coach / Team Member',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string', description: 'e.g. Founder & Head Coach', validation: (r) => r.required() }),
    defineField({
      name: 'image', title: 'Photo', type: 'image', options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text (describe the photo)', validation: (r) => r.required() }],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Lower numbers show first.', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'image' } },
});
