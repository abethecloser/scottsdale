import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

// Site Settings is a singleton (there is only ever one), so it shows as a
// single menu item you open directly, not a list you "create new" in.
const SINGLETON = 'siteSettings';

export default defineConfig({
  name: 'default',
  title: 'Scottsdale Sales Training',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .id(SINGLETON)
              .child(S.document().schemaType(SINGLETON).documentId(SINGLETON)),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => item.getId() !== SINGLETON
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // Prevent creating more than one Site Settings document.
    templates: (templates) => templates.filter((t) => t.schemaType !== SINGLETON),
  },
  document: {
    actions: (input, context) =>
      context.schemaType === SINGLETON
        ? input.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : input,
  },
});
