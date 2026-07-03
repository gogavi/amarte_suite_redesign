import { useState } from 'react';
import { motion } from 'framer-motion';

interface VideoExperienceProps {
  videoId?: string;
}

export default function VideoExperience({ videoId = "dQw4w9WgXcQ" }: VideoExperienceProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Parámetros de YouTube optimizados bajo el dominio youtube-nocookie para mayor privacidad:
  // - autoplay=1: se reproduce al hacer clic en Play
  // - mute=1: obligatorio para autoplay
  // - loop=1: reproduce infinitamente
  // - playlist=videoId: necesario para que loop funcione
  // - controls=0: oculta controles de reproducción para una experiencia limpia
  // - modestbranding=1: oculta marcas de agua
  const youtubeUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;

  return (
    <section className="relative w-full max-w-5xl mx-auto py-16 md:py-20 px-6 flex flex-col items-center">
      
      {/* Encabezado de la Sección */}
      <div className="text-center mb-10 z-10 max-w-2xl">
        <span className="text-xs text-magenta-digital uppercase tracking-widest font-heading mb-2 block">
          Video Experiencia
        </span>
        <h2 className="font-heading text-4xl md:text-5xl text-white mb-4 uppercase">
          Así se vive una noche en AMARTE
        </h2>
        <p className="font-body text-rosa-cuarzo text-base font-light leading-relaxed">
          Descubre suites temáticas, experiencias románticas, gastronomía y momentos inolvidables.
        </p>
      </div>

      {/* Contenedor del Reproductor con Efecto Liquid Glass */}
      <div className="relative w-full aspect-video rounded-brand overflow-hidden reflective-glass border border-white/10 shadow-2xl hover:border-magenta-digital/20 transition-all duration-300">
        
        {!isPlaying ? (
          // Miniatura de Portada (Poster Image) con Botón de Play
          <div className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer group">
            {/* Imagen de fondo (unsplash premium de romance/luces de neón) */}
            <img 
              src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200" 
              alt="Miniatura de Experiencia Amarte" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-bg-dark/20"></div>

            {/* Botón de Play Animado */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(true)}
              className="relative z-10 w-20 h-20 bg-magenta-digital hover:bg-magenta-digital/90 text-white rounded-full flex items-center justify-center shadow-2xl glow-magenta transition-colors"
            >
              {/* Onda expansiva de audio */}
              <div className="absolute inset-0 rounded-full bg-magenta-digital/30 animate-ping pointer-events-none"></div>
              
              <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.div>

            {/* Instrucción sutil */}
            <span className="absolute bottom-6 font-heading text-xs uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
              Iniciar Experiencia Inmersiva
            </span>
          </div>
        ) : (
          // YouTube Iframe Embebido e Inmune a la Carga Inicial de la Página
          <iframe
            src={youtubeUrl}
            title="Así se vive una noche en AMARTE"
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy" // Lazy loading para que no afecte el LCP
          />
        )}
      </div>

    </section>
  );
}
