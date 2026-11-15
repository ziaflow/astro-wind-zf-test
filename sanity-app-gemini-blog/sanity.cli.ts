import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  app: {
    organizationId: 'ofTbUkOHg',
    title: 'Gemini Blog App',
    entry: './src/App.tsx',
  },
  deployment: {
    appId: 'gcieqbp6fg8h6wbqzwcrilej',
  },
})
