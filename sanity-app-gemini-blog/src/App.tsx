import {type SanityConfig} from '@sanity/sdk'
import {SanityApp} from '@sanity/sdk-react'
import {ExampleComponent} from './ExampleComponent'
import './App.css'

function App() {
  // Configured with Gemini Blog project details
  const sanityConfigs: SanityConfig[] = [
    {
      projectId: '92p0tpps',
      dataset: 'production',
    },
  ]

  return (
    <div className="app-container">
      <SanityApp config={sanityConfigs} fallback={<div>Loading...</div>}>
        <ExampleComponent />
      </SanityApp>
    </div>
  )
}

export default App
