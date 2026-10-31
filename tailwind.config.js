import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    screens: {
      xs: '480px',
      ...defaultTheme.screens,
    },
    extend: {
      fontSize: {
        hero: ['clamp(3.25rem, 11.4vw, 15rem)', { lineHeight: '0.9', letterSpacing: '-0.045em' }],
        display: ['clamp(2.75rem, 6.4vw, 7.5rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        title: ['clamp(2.25rem, 4.4vw, 4.75rem)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        subtitle: ['clamp(1.5rem, 2.2vw, 2.25rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        lead: ['clamp(1.0625rem, 1.2vw, 1.25rem)', { lineHeight: '1.5' }],
        label: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.06em' }],
      },
      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        17: '4.25rem',
        18: '4.5rem',
        19: '4.75rem',
        21: '5.25rem',
        22: '5.5rem',
        25: '6.25rem',
        26: '6.5rem',
        27: '6.75rem',
        30: '7.5rem',
        34: '8.5rem',
        38: '9.5rem',
        42: '10.5rem',
        46: '11.5rem',
        50: '12.5rem',
      },
      zIndex: {
        60: '60',
        65: '65',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
        110: '110',
      },
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
      addVariant('aria-invalid', '&[aria-invalid="true"]');
    }),
  ],
  darkMode: 'class',
};
