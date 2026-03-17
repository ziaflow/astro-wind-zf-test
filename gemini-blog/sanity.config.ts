import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// Singleton desk structure for SEO dashboard
const deskStructure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('🤖 SEO Automation Dashboard')
        .id('seoDashboardItem')
        .child(
          S.document()
            .schemaType('seoDashboard')
            .documentId('globalSeoDashboard')
            .title('SEO Automation Dashboard'),
        ),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (listItem) => !['seoDashboard'].includes(listItem.getId()),
      ),
    ])

export default defineConfig({
  name: 'default',
  title: 'Gemini Blog',

  projectId: '92p0tpps',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: deskStructure,
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
