import { useState, useEffect, useRef } from 'react';

interface MagnetOptions {
  strength?: number;
  padding?: number;
}

export function useMagnet(options: MagnetOptions = {}) {
  const { strength = 4, padding = 100 } = options;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = elementRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const elX = rect.left + rect.width / 2;
      const elY = rect.top + rect.height / 2;

      const distanceX = e.clientX - elX;
      const distanceY = e.clientY - elY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Si el cursor está dentro del rango de influencia (padding), atrae el elemento
      if (distance < padding) {
        setPosition({
          x: distanceX / strength,
          y: distanceY / strength
        });
      } else {
        // Retorna a la posición central si el cursor sale del rango
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [strength, padding]);

  return {
    elementRef,
    style: {
      transform: `translate3d(${position.x}px, ${position.y}px, 0px)`,
      transition: position.x === 0 && position.y === 0 
        ? "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)" 
        : "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
      willChange: 'transform'
    }
  };
}
