// Theme utilities for consistent dark mode colors

export const getCardBackground = (lightColor: string = 'gray.0') => {
  // This will be 'gray.0' in light mode and adapt to dark mode automatically
  return lightColor;
};

export const getSurfaceBackground = () => {
  // This will be light in light mode and dark grey in dark mode
  return 'var(--mantine-color-default)';
};

// Dynamic text colors that adapt to theme
export const getPrimaryTextColor = () => {
  // Returns appropriate text color for the current theme
  // In high contrast mode, uses CSS custom properties
  // In regular dark/light mode, uses default Mantine colors
  return 'var(--swatchx-text-primary, var(--mantine-color-text))';
};

export const getSecondaryTextColor = () => {
  return 'var(--swatchx-text-secondary, var(--mantine-color-dimmed))';
};

export const getBorderColor = () => {
  return 'var(--swatchx-border, var(--mantine-color-default-border))';
};

// For hardcoded colors that need to be theme-aware
export const getThemeAwareColor = (lightColor: string) => {
  // This is a utility function - actual implementation would need to check theme context
  // For now, returning CSS custom property fallback
  return `var(--swatchx-text-primary, ${lightColor})`;
};
