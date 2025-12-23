'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderWrapper } from '@/lib/theme';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeProviderWrapper>
        {children}
      </ThemeProviderWrapper>
    </NextThemesProvider>
  );
}
