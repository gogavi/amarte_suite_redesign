export function viewportMatches(query: string): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(query).matches;
}

export function shouldMountHeroVideo(input: {
  isMobile: boolean;
  reducedMotion: boolean;
  inView: boolean;
  armed: boolean;
}): boolean {
  return input.armed && input.inView && !input.reducedMotion && !input.isMobile;
}
