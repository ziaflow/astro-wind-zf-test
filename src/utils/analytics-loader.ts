interface LoaderOptions {
  gtmId?: string;
  clarityId?: string;
}

type LoadTrigger = 'idle' | 'interaction';

let hasLoaded = false;

const loadClarity = (clarityId?: string) => {
  if (!clarityId || typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).clarity) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (function (c: any, l: Document, a: string, r: string, i: string) {
    // eslint-disable-next-line prefer-rest-params
    (c[a].q = c[a].q || []).push(arguments);
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = `https://www.clarity.ms/tag/${i}`;
    const y = l.getElementsByTagName(r)[0];
    y?.parentNode?.insertBefore(t, y);
  })(window, document, 'clarity', 'script', clarityId);
};

const loadGtm = (gtmId?: string) => {
  if (!gtmId || typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).dataLayer?.find?.((event: any) => event?.event === 'gtm.js')) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (function (w: any, d: Document, s: string, l: string, i: string) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const f = d.getElementsByTagName(s)[0];
    const j = d.createElement(s) as HTMLScriptElement;
    const dl = l !== 'dataLayer' ? `&l=${l}` : '';
    j.async = true;
    j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
    f?.parentNode?.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', gtmId);
};

const onFirstInteraction = (callback: () => void) => {
  const events = ['scroll', 'mousemove', 'touchstart', 'keydown'];
  const handler = () => {
    events.forEach((event) => window.removeEventListener(event, handler));
    callback();
  };
  events.forEach((event) => window.addEventListener(event, handler, { once: true, passive: true }));
};

export const bootstrapAnalytics = ({ gtmId, clarityId }: LoaderOptions, trigger: LoadTrigger = 'idle') => {
  if (hasLoaded || typeof window === 'undefined') return;
  const loadVendors = () => {
    if (hasLoaded) return;
    loadGtm(gtmId);
    loadClarity(clarityId);
    hasLoaded = true;
  };

  if (trigger === 'interaction') {
    onFirstInteraction(loadVendors);
  } else if ('requestIdleCallback' in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).requestIdleCallback(loadVendors);
  } else {
    setTimeout(loadVendors, 1500);
  }
};

export const queueAnalyticsLoad = (options: LoaderOptions) => {
  if (typeof window === 'undefined') return;
  if (document.readyState === 'complete') {
    bootstrapAnalytics(options);
  } else {
    window.addEventListener('load', () => bootstrapAnalytics(options));
  }
};

export default bootstrapAnalytics;
