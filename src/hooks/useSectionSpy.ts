import { useCallback, useEffect, useState } from 'react';
import { SECTION_NAV_ITEMS } from '../data/sectionNav';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useSectionSpy(enabled = true) {
  const [activeId, setActiveId] = useState(SECTION_NAV_ITEMS[0]?.id ?? 'inicio');

  useEffect(() => {
    if (!enabled) return;

    const ratios = new Map<string, number>();
    const ids = SECTION_NAV_ITEMS.map((item) => item.id);
    const observed = new Set<string>();

    const pickActive = () => {
      let bestId = ids[0] ?? 'inicio';
      let bestRatio = -1;

      for (const id of ids) {
        const ratio = ratios.get(id) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      }

      if (bestRatio <= 0) {
        let closestId = bestId;
        let closestDistance = Number.POSITIVE_INFINITY;
        const mid = window.innerHeight * 0.35;

        for (const id of ids) {
          const el = document.getElementById(id);
          if (!el) continue;
          const top = el.getBoundingClientRect().top;
          const distance = Math.abs(top - mid);
          if (top <= mid + 80 && distance < closestDistance) {
            closestDistance = distance;
            closestId = id;
          }
        }
        setActiveId(closestId);
        return;
      }

      setActiveId(bestId);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!id) continue;
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        pickActive();
      },
      {
        root: null,
        rootMargin: '-20% 0px -45% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    const attachMissing = () => {
      for (const id of ids) {
        if (observed.has(id)) continue;
        const el = document.getElementById(id);
        if (!el) continue;
        ratios.set(id, 0);
        observer.observe(el);
        observed.add(id);
      }
      pickActive();
      return observed.size >= ids.length;
    };

    attachMissing();

    // Lazy sections mount after Suspense — retry until all are attached
    const retryTimers = [400, 1000, 2000].map((ms) =>
      setTimeout(() => {
        if (observed.size < ids.length) attachMissing();
      }, ms)
    );

    return () => {
      observer.disconnect();
      for (const timer of retryTimers) clearTimeout(timer);
    };
  }, [enabled]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';

    if (id === 'inicio') {
      window.scrollTo({ top: 0, behavior });
      setActiveId(id);
      return;
    }

    el.scrollIntoView({ behavior, block: 'start' });
    setActiveId(id);
  }, []);

  return { activeId, scrollToSection };
}
