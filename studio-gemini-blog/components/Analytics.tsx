import {useEffect} from 'react'

declare global {
  interface Window {
    dataLayer?: unknown[]
    clarity?: (...args: unknown[]) => void
  }
}

export function Analytics() {
  const measurementId = process.env.SANITY_STUDIO_GTAG_ID
  const clarityId = process.env.SANITY_STUDIO_CLARITY_ID

  useEffect(() => {
    // 1. Google Analytics / Google Tag Manager
    if (measurementId) {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
      script.async = true
      document.head.appendChild(script)

      script.onload = () => {
        window.dataLayer = window.dataLayer || []
        function gtag(...args: unknown[]) {
          window.dataLayer?.push(args)
        }
        gtag('js', new Date())
        gtag('config', measurementId)
      }
    }

    // 2. Microsoft Clarity
    if (clarityId) {
      const clarityScript = document.createElement('script')
      clarityScript.type = 'text/javascript'
      clarityScript.async = true
      clarityScript.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `
      document.head.appendChild(clarityScript)
    }
  }, [measurementId, clarityId])

  return null
}
