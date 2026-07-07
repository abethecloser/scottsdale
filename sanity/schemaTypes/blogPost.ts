import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO (search engines)' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({
      name: 'slug', title: 'Slug (web address)', type: 'slug',
      options: { source: 'title', maxLength: 96 }, group: 'content',
      description: 'Auto-fills from the title. Becomes /blog/your-slug.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'status', title: 'Status', type: 'string', group: 'content',
      options: { list: [{ title: 'Draft (hidden)', value: 'draft' }, { title: 'Published (live)', value: 'published' }], layout: 'radio' },
      initialValue: 'draft', validation: (r) => r.required(),
    }),
    defineField({ name: 'category', title: 'Category', type: 'string', description: 'e.g. Objection handling', group: 'content' }),
    defineField({ name: 'excerpt', title: 'Excerpt (short summary)', type: 'text', rows: 3, group: 'content', validation: (r) => r.required() }),
    defineField({
      name: 'coverImage', title: 'Cover photo', type: 'image', options: { hotspot: true }, group: 'content',
      fields: [{ name: 'alt', type: 'string', title: 'Alt text (describe the photo)', validation: (r) => r.required() }],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'author', title: 'Author', type: 'reference', to: [{ type: 'teamMember' }], group: 'content' }),
    defineField({ name: 'publishedAt', title: 'Publish date', type: 'datetime', group: 'content', validation: (r) => r.required() }),
    defineField({ name: 'body', title: 'Article body', type: 'blockContent', group: 'content' }),

    defineField({ name: 'seoTitle', title: 'SEO title (optional)', type: 'string', description: 'Overrides the browser-tab / search title. Leave blank to use the post title.', group: 'seo' }),
    defineField({ name: 'metaDescription', title: 'Meta description (optional)', type: 'text', rows: 2, description: 'The grey summary Google shows. Leave blank to use the excerpt.', group: 'seo' }),
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', status: 'status', media: 'coverImage' },
    prepare: ({ title, status, media }) => ({ title, subtitle: status === 'published' ? 'Published' : 'Draft', media }),
  },
});
