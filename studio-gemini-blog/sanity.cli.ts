import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '92p0tpps',
    dataset: 'production',
  },
  studioHost: 'ziaflow',
  deployment: {
    appId: 'k3vbc5h27hp0eyvrnuv70kod',
  },
  typegen: {
    path: ['../src/utils/**/*.{ts,js}', '../src/lib/**/*.{ts,js}', './schemaTypes/**/*.{ts,tsx}'],
    schema: './schema.json',
    generates: './sanity.types.ts',
  },
})

