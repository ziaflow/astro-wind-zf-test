import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--aw-color-primary)',
        secondary: 'var(--aw-color-secondary)',
        accent: 'var(--aw-color-accent)',
        default: 'var(--aw-color-text-default)',
        muted: 'var(--aw-color-text-muted)',
        ink: {
          DEFAULT: '#1A1A1A',
          2: '#232323',
          3: '#2c2c2c',
        },
        'ink-2': '#232323',
        'ink-3': '#2c2c2c',
        bone: '#FFFFFF',
        line: {
          DEFAULT: 'rgba(255, 255, 255, 0.12)',
          strong: 'rgba(255, 255, 255, 0.24)',
        },
        'line-strong': 'rgba(255, 255, 255, 0.24)',
        mute: '#b8b8b8',
        dim: '#7d7d7d',
        signal: {
          DEFAULT: '#A22A36',
          dark: '#7C1E29',
          soft: 'rgba(162, 42, 54, 0.16)',
        },
        'signal-dark': '#7C1E29',
        'signal-soft': 'rgba(162, 42, 54, 0.16)',
        teal: {
          DEFAULT: '#3F9B93',
          soft: 'rgba(63, 155, 147, 0.16)',
        },
        'teal-soft': 'rgba(63, 155, 147, 0.16)',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-display)', 'var(--font-display-face)', 'Cabinet Grotesk', 'sans-serif'],
        body: ['var(--font-body)', 'var(--font-body-face)', 'General Sans', 'sans-serif'],
        mono: ['var(--font-mono)', 'var(--font-mono-face)', 'JetBrains Mono', 'monospace'],
      },
      transitionTimingFunction: {
        '(--ease-out-expo)': 'var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1))',
        '(--ease-in-out-quart)': 'var(--ease-in-out-quart, cubic-bezier(0.76, 0, 0.24, 1))',
        '(--ease-spring)': 'var(--ease-spring, cubic-bezier(0.34, 1.35, 0.64, 1))',
        '(--ease-out-quart)': 'var(--ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1))',
        'out-expo': 'var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1))',
        'in-out-quart': 'var(--ease-in-out-quart, cubic-bezier(0.76, 0, 0.24, 1))',
        spring: 'var(--ease-spring, cubic-bezier(0.34, 1.35, 0.64, 1))',
        'out-quart': 'var(--ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1))',
      },

      animation: {
        fade: 'fadeInUp 1s both',
      },

      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(2rem)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    typographyPlugin,
    plugin(({ addVariant }) => {
      addVariant('intersect', '&:not([no-intersect])');
    }),
  ],
  darkMode: 'class',
};
