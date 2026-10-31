export interface SiteConfig {
  name: string;
  site?: string;
  base?: string;
  trailingSlash?: boolean;
  googleSiteVerificationId?: string;
}

export interface MetaDataConfig {
  title?: {
    default: string;
    template: string;
  };
  description?: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  openGraph?: {
    site_name?: string;
    images?: Array<{ url: string; width?: number; height?: number }>;
    type?: string;
  };
  twitter?: {
    handle?: string;
    site?: string;
    cardType?: string;
  };
}

export interface I18NConfig {
  language: string;
  textDirection: string;
  dateFormatter?: Intl.DateTimeFormat;
}

export interface AppBlogConfig {
  isEnabled: boolean;
  postsPerPage: number;
  isRelatedPostsEnabled: boolean;
  relatedPostsCount: number;
  post: {
    isEnabled: boolean;
    permalink: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
  };
  list: {
    isEnabled: boolean;
    pathname: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
  };
  category: {
    isEnabled: boolean;
    pathname: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
  };
  tag: {
    isEnabled: boolean;
    pathname: string;
    robots: {
      index: boolean;
      follow: boolean;
    };
  };
}

export interface AnalyticsConfig {
  vendors: {
    googleAnalytics?: {
      id?: string;
      partytown?: boolean;
    };
    googleTagManager?: {
      id?: string;
      partytown?: boolean;
    };
    clarity?: {
      id?: string;
    };
  };
}

export interface UIConfig {
  theme: string;
}

export const SITE: SiteConfig = {
  name: 'ZiaFlow',
  site: 'https://ziaflow.com',
  base: '/',
  trailingSlash: false,
  googleSiteVerificationId: 'orcPxI47GSa-cRvY11tUe6iGg2IO_RPvnA1q95iEM3M',
};

export const METADATA: MetaDataConfig = {
  title: {
    default: 'ZiaFlow — Your Partner in Digital Transformation',
    template: '%s — ZiaFlow',
  },
  description:
    'AI-driven SEO & conversion optimization for B2B SaaS and agencies. Call (602) 834-4239 to rank higher and convert better.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    site_name: 'ZiaFlow',
    images: [
      {
        url: '~/assets/images/default.png',
        width: 1200,
        height: 628,
      },
    ],
    type: 'website',
  },
  twitter: {
    handle: '@ziaflow',
    site: '@ziaflow',
    cardType: 'summary_large_image',
  },
};

export const I18N: I18NConfig = {
  language: 'en',
  textDirection: 'ltr',
};

export const APP_BLOG: AppBlogConfig = {
  isEnabled: true,
  postsPerPage: 6,
  isRelatedPostsEnabled: true,
  relatedPostsCount: 4,
  post: {
    isEnabled: true,
    permalink: '/%slug%',
    robots: {
      index: true,
      follow: true,
    },
  },
  list: {
    isEnabled: true,
    pathname: 'blog',
    robots: {
      index: true,
      follow: true,
    },
  },
  category: {
    isEnabled: true,
    pathname: 'category',
    robots: {
      index: false,
      follow: true,
    },
  },
  tag: {
    isEnabled: true,
    pathname: 'tag',
    robots: {
      index: false,
      follow: true,
    },
  },
};

export const ANALYTICS: AnalyticsConfig = {
  vendors: {
    googleAnalytics: {
      id: 'G-HE4BRSW364',
      partytown: true,
    },
    googleTagManager: {
      id: 'GTM-5Q2JZPVG',
      partytown: true,
    },
    clarity: {
      id: 'rc0l0o7tmd',
    },
  },
};

export const UI: UIConfig = {
  theme: 'light:only',
};

export default {
  SITE,
  METADATA,
  I18N,
  APP_BLOG,
  ANALYTICS,
  UI,
};
