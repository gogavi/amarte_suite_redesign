import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMagnet } from '../../hooks/useMagnet';

interface MartinaHeroProps {
  onActivateChat: () => void;
}

export default function MartinaHero({ onActivateChat }: MartinaHeroProps) {
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  
  const magnet = useMagnet({ strength: 5, padding: 120 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setBubbleText("¡Hola! Soy Martina, tu anfitriona digital. ¿Listos para despegar al Planeta Romántico? 🚀💖");
      setShowSpeechBubble(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const martinaFloat = {
    animate: {
      y: [0, -8, 0],
      rotate: [0, 0.5, -0.5, 0],
      transition: {
        duration: 5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror" as const
      }
    }
  };

  return (
    <div className="relative flex flex-col lg:flex-row items-center justify-center gap-10 w-full max-w-4xl mx-auto py-16 px-6">
      
      {/* Contenedor Izquierdo: Info de Martina */}
      <div className="flex flex-col flex-1 text-center lg:text-left z-10 max-w-md">
        <span className="text-xs text-cyan-orbital uppercase tracking-widest font-heading mb-2">
          Anfitriona Digital Agent-First
        </span>
        <h2 className="font-heading text-4xl md:text-5xl text-white mb-4 uppercase">
          CONOCE A <span className="text-magenta-digital filter drop-shadow-[0_0_12px_rgba(230,0,126,0.25)]">MARTINA</span>
        </h2>
        <p className="font-body text-rosa-cuarzo text-base font-light mb-6 leading-relaxed">
          Diseñada para ayudarte a personalizar tu escape. Consúltale por disponibilidad, precios de suites, juguetes del Sexshop, o pídele que prepare una sorpresa especial para tu pareja antes de que lleguen.
        </p>
        <button
          onClick={onActivateChat}
          className="bg-bg-dark hover:bg-magenta-digital text-white font-heading text-sm px-6 py-3 rounded-brand border border-magenta-digital/40 transition-all hover:scale-105 active:scale-95 duration-300 w-fit mx-auto lg:mx-0 shadow-lg glow-magenta-hover"
        >
          Iniciar Conversación
        </button>
      </div>

      {/* Contenedor Derecho: Avatar SVG e Interacciones */}
      <div className="relative flex items-center justify-center w-full max-w-sm h-[320px] md:h-[400px]">
        {/* Glow de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-magenta-digital/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        {/* Burbuja de diálogo con efecto Glassmorphism */}
        <AnimatePresence>
          {showSpeechBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 15 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[-10%] z-30 reflective-glass rounded-brand px-5 py-4 max-w-[260px] shadow-2xl text-left border border-white/10"
            >
              <p className="font-body text-xs text-white/95 leading-relaxed">
                {bubbleText}
              </p>
              {/* Indicador curvo */}
              <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 lg:left-12 lg:translate-x-0 w-3 h-3 bg-bg-dark border-r border-b border-white/10 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar magnético de Martina */}
        <div 
          ref={magnet.elementRef}
          style={magnet.style}
          className="w-60 h-60 md:w-72 md:h-72 flex items-center justify-center relative"
        >
          <motion.div
            variants={martinaFloat}
            animate="animate"
            onClick={onActivateChat}
            className="cursor-pointer relative z-20 w-full h-full flex items-center justify-center group"
          >
            {/* Halo de órbita interactivo */}
            <div className="absolute inset-2 rounded-full border border-cyan-orbital/20 group-hover:border-magenta-digital/40 group-hover:scale-105 transition-all duration-700 animate-spin" style={{ animationDuration: '30s' }}></div>

            {/* Ilustración Vectorial Premium SVG de Martina (Casco cromado de astronauta) */}
            <div className="relative w-44 h-44 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-[#0D0D11] to-[#17171E] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner group-hover:border-magenta-digital/30 group-hover:shadow-2xl transition-all duration-300">
              
              <svg className="w-full h-full filter drop-shadow-[0_0_15px_rgba(230,0,126,0.2)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Silueta abstracta de Martina */}
                <path d="M50 160 C50 125, 70 95, 100 95 C130 95, 150 125, 150 160" fill="url(#silueta-grad)" opacity="0.8" />
                <circle cx="100" cy="74" r="22" fill="url(#cara-grad)" />
                
                {/* Visor de astronauta esmerilado */}
                <ellipse cx="100" cy="85" rx="50" ry="32" fill="url(#visor-bg)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                
                {/* Reflejos de luz */}
                <path d="M62 76 C80 66, 120 66, 138 76" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
                <path d="M60 90 C80 102, 120 102, 140 90" fill="none" stroke="url(#visor-reflex)" strokeWidth="2" strokeLinecap="round" opacity="0.15" />
                
                {/* Destello de cristal diagonal */}
                <path d="M75 58 L125 108" stroke="rgba(255,255,255,0.12)" strokeWidth="6" strokeLinecap="round" opacity="0.2" />
                
                <defs>
                  <linearGradient id="silueta-grad" x1="50" y1="95" x2="150" y2="160">
                    <stop offset="0%" stopColor="#CB7BA7" />
                    <stop offset="100%" stopColor="#E6007E" />
                  </linearGradient>
                  <linearGradient id="cara-grad" x1="100" y1="52" x2="100" y2="96">
                    <stop offset="0%" stopColor="#FFE0E9" />
                    <stop offset="100%" stopColor="#CB7BA7" />
                  </linearGradient>
                  <linearGradient id="visor-bg" x1="100" y1="53" x2="100" y2="117">
                    <stop offset="0%" stopColor="rgba(25, 166, 224, 0.25)" />
                    <stop offset="50%" stopColor="rgba(230, 0, 126, 0.15)" />
                    <stop offset="100%" stopColor="rgba(13, 13, 17, 0.8)" />
                  </linearGradient>
                  <linearGradient id="visor-reflex" x1="60" y1="90" x2="140" y2="90">
                    <stop offset="0%" stopColor="#19A6E0" />
                    <stop offset="50%" stopColor="transparent" />
                    <stop offset="100%" stopColor="#E6007E" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Reflejo del visor interactivo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity"></div>
            </div>

            {/* Botón de Voz / Micrófono flotante con onda expansiva animada (ping) */}
            <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-30">
              <div className="absolute inset-0 rounded-full bg-cyan-orbital/30 animate-ping opacity-75 pointer-events-none group-hover:bg-magenta-digital/30"></div>
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="bg-cyan-orbital hover:bg-magenta-digital text-bg-dark hover:text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 z-nav glow-cyan"
              >
                <span className="text-xl">🎙️</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
