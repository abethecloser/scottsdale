import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'contact', title: 'Contact info' },
    { name: 'hero', title: 'Hero (top of page)' },
    { name: 'stats', title: 'Stat numbers' },
  ],
  fields: [
    defineField({ name: 'phone', title: 'Phone number', type: 'string', description: 'e.g. (480) 555-1234', group: 'contact', validation: (r) => r.required() }),
    defineField({ name: 'email', title: 'Email address', type: 'string', group: 'contact', validation: (r) => r.required() }),
    defineField({ name: 'address', title: 'City / area', type: 'string', description: 'e.g. Scottsdale, Arizona', group: 'contact' }),
    defineField({ name: 'hours', title: 'Opening hours', type: 'string', description: 'e.g. Mon-Fri 8-5 MST', group: 'contact' }),

    defineField({ name: 'heroSubheadline', title: 'Hero paragraph', type: 'text', rows: 3, description: 'The sentence under the big headline.', group: 'hero' }),
    defineField({
      name: 'heroImage',
      title: 'Hero background photo',
      type: 'image',
      options: { hotspot: true },
      group: 'hero',
      fields: [{ name: 'alt', type: 'string', title: 'Alt text (describe the photo)', validation: (r) => r.required() }],
    }),

    defineField({ name: 'statWinRate', title: 'Win-rate stat', type: 'string', description: 'e.g. 38%', group: 'stats' }),
    defineField({ name: 'statTrained', title: 'Reps trained stat', type: 'string', description: 'e.g. 2,500+', group: 'stats' }),
    defineField({ name: 'statRampWeeks', title: 'Ramp-time stat', type: 'string', description: 'e.g. 8 wks', group: 'stats' }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
});
