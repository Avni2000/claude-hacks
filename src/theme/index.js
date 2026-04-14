export const colors = {
  primary: '#5B21B6',
  primaryLight: '#7C3AED',
  primaryDark: '#4C1D95',
  accent: '#06B6D4',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  success: '#059669',
  error: '#DC2626',
  warning: '#D97706',
  gold: '#F59E0B',
  white: '#FFFFFF',
};

export const gradients = {
  card: ['#5B21B6', '#1D4ED8'],
  welcome: ['#3B0764', '#1E3A8A'],
  discover: ['#0F172A', '#1E1B4B'],
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 24, card: 20, full: 999,
};

export const shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 5 },
  lg: { shadowColor: '#5B21B6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  h2: { fontSize: 26, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600' },
  h4: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24 },
  bodySmall: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
};
