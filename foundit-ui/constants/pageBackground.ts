/**
 * Shared bg.svg positioning — zoomed so large color blocks match Figma.
 * (SVG is 2560×1440; `cover` alone shows too much of the full pattern.)
 */
export const PAGE_BACKGROUND_PROPS = {
  backgroundImage: "url('/bg.svg')",
  backgroundRepeat: 'no-repeat',
  backgroundSize: {
    base: '280%',
    sm: '240%',
    md: '200%',
    lg: '175%',
    xl: '155%',
  },
  backgroundPosition: {
    base: '44% 52%',
    md: '38% 46%',
    xl: '34% 42%',
  },
} as const;
