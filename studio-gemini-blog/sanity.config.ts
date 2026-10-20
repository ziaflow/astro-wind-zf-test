import {assist} from '@sanity/assist'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// --- Desk Structure Logic ---
const deskStructure = (S) =>
  S.list()
    .title('Editorial & Content')
    .items([
      // 1. The CRITICAL Singleton Document: SEO Automation Dashboard
      S.listItem()
        .title('🤖 SEO Automation Dashboard')
        .id('seoDashboardItem')
        .child(
          S.document()
            .schemaType('seoDashboard')
            .documentId('globalSeoDashboard')
            .title('SEO Automation Dashboard'),
        ),

      // 2. Company Profile Singleton (Ground Truth)
      S.listItem()
        .title('🏢 Company Profile (Ground Truth)')
        .id('companyProfileItem')
        .child(
          S.document()
            .schemaType('companyProfile')
            .documentId('globalCompanyProfile')
            .title('Company Profile & Service Areas'),
        ),

      S.divider(),

      // 3. Editorial Review Queues
      S.listItem()
        .title('📝 Posts Ready for Jeremy Review')
        .child(
          S.documentList()
            .title('Ready for Jeremy Review')
            .filter('_type == "post" && editorialStatus == "ready_for_human_review"'),
        ),

      S.listItem()
        .title('🤖 Posts Drafted by AI (Unreviewed)')
        .child(
          S.documentList()
            .title('AI Drafts')
            .filter('_type == "post" && editorialStatus == "ai_drafted"'),
        ),

      S.listItem()
        .title('📚 All Blog Posts')
        .child(S.documentTypeList('post').title('All Blog Posts')),

      S.divider(),

      // 4. Evidence & Topic Clusters
      S.listItem()
        .title('🎯 Topic Clusters')
        .child(S.documentTypeList('topicCluster').title('Topic Clusters')),

      S.listItem()
        .title('🔎 Keyword Opportunities (GSC Data)')
        .child(S.documentTypeList('keywordOpportunity').title('Keyword Opportunities')),

      S.listItem()
        .title('⚖️ Verified Claims Register')
        .child(S.documentTypeList('claim').title('Claims Register')),

      S.listItem()
        .title('📋 Content Briefs')
        .child(S.documentTypeList('contentBrief').title('Content Briefs')),

      S.divider(),

      // 5. Remaining types (Authors, Service Pages, etc.)
      ...S.documentTypeListItems().filter(
        (listItem) =>
          ![
            'seoDashboard',
            'companyProfile',
            'post',
            'topicCluster',
            'keywordOpportunity',
            'claim',
            'contentBrief',
          ].includes(listItem.getId()),
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
    assist(),
  ],

  schema: {
    types: schemaTypes,
  },
})
