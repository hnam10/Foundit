'use client';

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';

/**
 * App design system. Component code must reference these tokens
 * (color="fg", borderColor="border.input", …) instead of raw hex values so
 * palette changes stay a one-file edit.
 */
const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        body: { value: 'var(--font-inter), sans-serif' },
        heading: { value: 'var(--font-inter), sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        // Text: default body ink + secondary/hint text.
        fg: {
          DEFAULT: { value: '#1a1a1a' },
          muted: { value: '#666666' },
          error: { value: '#cd0000' },
        },
        border: {
          input: { value: '#D9D9D9' },
          error: { value: '#cd0000' },
        },
        // Focus outline used by all form controls.
        focusRing: { value: '#009adb' },
      },
    },
  },
});

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      {/* The palette above is light-only; force light so an OS dark-mode
          preference can't produce a half-dark page. Remove `forcedTheme`
          once tokens carry dark values. */}
      <ColorModeProvider forcedTheme="light" {...props} />
    </ChakraProvider>
  );
}
