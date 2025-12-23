import "@testing-library/jest-dom";
import { vi } from "vitest";
import testData from "./fixtures/test-data.json";

const translations = testData.translations as Record<string, any>;

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => testData.mocks.navigation.pathname,
  useSearchParams: () =>
    new URLSearchParams(testData.mocks.navigation.searchParams),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string): any => {
    const translator = (key: string): string => {
      if (namespace && translations[namespace]) {
        return translations[namespace][key] ?? key;
      }

      // Fallback for keys without namespace
      for (const ns of Object.values(translations)) {
        if (typeof ns === "object" && (ns as Record<string, string>)[key]) {
          return (ns as Record<string, string>)[key];
        }
      }

      return key;
    };

    // Add the raw method for accessing raw translation objects
    translator.raw = (key: string): any => {
      if (namespace && translations[namespace]) {
        return translations[namespace][key] ?? {};
      }
      return translations[key] ?? {};
    };

    return translator;
  },
  useLocale: (): string => "en",
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: (): any => ({
    theme: testData.mocks.theme.theme,
    setTheme: vi.fn(),
    themes: testData.mocks.theme.themes,
    systemTheme: testData.mocks.theme.systemTheme,
  }),
  ThemeProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactNode => children,
}));

// Mock Material-UI icons
vi.mock("@mui/icons-material", () => ({
  Brightness4: (): string => "Brightness4",
  Brightness7: (): string => "Brightness7",
}));

// Mock dangerouslySetInnerHTML for SVG content
Object.defineProperty(window.Element.prototype, "innerHTML", {
  set: vi.fn(),
});
