import { useTheme } from './useTheme';
import type { MantineGradient } from '@mantine/core';

export function useThemeColors() {
  const { isDarkMode } = useTheme();
  
  return {
    primaryText: isDarkMode ? 'white' : undefined,
    secondaryText: isDarkMode ? 'gray.2' : 'dimmed',
    subtleText: isDarkMode ? 'gray.3' : 'dark.6',
    strongText: isDarkMode ? 'white' : 'dark.8',
    
    // For gradient text that should fall back to solid in dark mode
    getGradientOrSolid: (gradient: MantineGradient) => 
      isDarkMode ? { c: 'white' } : { gradient, variant: 'gradient' as const }
  };
}
