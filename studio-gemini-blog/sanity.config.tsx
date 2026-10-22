import {assist} from '@sanity/assist'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {presentationTool} from 'sanity/presentation'
import {altTextGenerator} from 'sanity-plugin-alt-text-generator'
import {embeddingsIndexDashboard, embeddingsIndexReferenceInput} from '@sanity/embeddings-index-ui'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {lucideIconPicker} from '@kodamera/sanity-plugin-lucide-icon-picker'
import {resolve} from './resolve'
import {schemaTypes} from './schemaTypes'
import {Analytics} from './components/Analytics'

// --- Desk Structure Logic ---
const deskStructure = (S) =>
  S.list()
    .title('Content')
    .items([
      // 1. The CRITICAL Singleton Document: SEO Automation Dashboard
      S.listItem()
        .title('🤖 SEO Automation Dashboard') // Easy to spot with an emoji
        .id('seoDashboardItem')
        .child(
          S.document()
            .schemaType('seoDashboard')
            .documentId('globalSeoDashboard') // The fixed ID the AI Agent will target
            .title('SEO Automation Dashboard'),
        ),

      S.divider(), // Visual separator between dashboard and content

      // 2. Standard Content Lists (Posts, Authors, etc.)
      ...S.documentTypeListItems().filter(
        // Exclude the 'seoDashboard' type from the standard list view
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
    presentationTool({
      resolve,
      previewUrl: {
        origin: typeof window !== 'undefined' && window.location.origin.includes('localhost')
          ? 'http://localhost:4321'
          : 'https://ziaflow.com',
        previewMode: {
          enable: '/api/preview',
        },
      },
    }),
    visionTool(),
    assist(),
    altTextGenerator(),
    embeddingsIndexReferenceInput(),
    embeddingsIndexDashboard(),
    unsplashImageAsset(),
    lucideIconPicker(),
  ],

  schema: {
    types: schemaTypes,
  },

  studio: {
    components: {
      layout: (props) => (
        <>
          <Analytics />
          {props.renderDefault(props)}
        </>
      ),
    },
  },
})
