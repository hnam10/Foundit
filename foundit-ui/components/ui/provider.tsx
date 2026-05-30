'use client';

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import type { ReactNode } from 'react';

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        body: { value: 'var(--font-inter), sans-serif' },
        heading: { value: 'var(--font-inter), sans-serif' },
      },
    },
  },
});

export function Provider({ children }: { children: ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
