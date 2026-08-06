/*
 * JS mirror of the CSS theme tokens for charting libraries (Recharts),
 * which read colors at runtime. Values reference the CSS variables so a
 * future dark mode swap happens automatically.
 */
export const theme = {
  colors: {
    primary: 'var(--color-primary)',
    primaryHover: 'var(--color-primary-hover)',
    secondary: 'var(--color-secondary)',
    surfaceTint: 'var(--color-surface-tint)',
    accent: 'var(--color-accent)',
    deep: 'var(--color-deep)',
    page: 'var(--color-page)',
    card: 'var(--color-card)',
    ink: 'var(--color-ink)',
    muted: 'var(--color-muted)',
    line: 'var(--color-line)',
    success: 'var(--color-success)',
    danger: 'var(--color-danger)',
  },
} as const
