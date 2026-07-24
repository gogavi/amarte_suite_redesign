import { useState } from 'react';

interface VideoExperienceProps {
  videoId?: string;
  /** Segundo de inicio (equivalente a `t=` en YouTube). */
  startSeconds?: number;
}

export default function VideoExperience({ videoId = 'OUDd45y2Fr8', startSeconds = 0 }: VideoExperienceProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const startParam = startSeconds > 0 ? `&start=${startSeconds}` : '';
  const youtubeUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3${startParam}`;

  return (
    <section className="relative w-full max-w-5xl mx-auto py-16 md:py-20 px-6 flex flex-col items-center content-visibility-auto">
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

      <div className="relative w-full aspect-video rounded-brand overflow-hidden reflective-glass border border-white/10 shadow-2xl hover:border-magenta-digital/20 transition-[border-color] duration-300">
        {!isPlaying ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer group"
            aria-label="Iniciar video experiencia"
          >
            <img
              src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200"
              alt="Miniatura de Experiencia Amarte"
              className="w-full h-full object-cover opacity-60 group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-bg-dark/20" />

            <div className="relative z-10 w-20 h-20 bg-magenta-digital group-hover:bg-magenta-digital/90 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform duration-200 group-hover:scale-105 active:scale-95">
              <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>

            <span className="absolute bottom-6 font-heading text-xs uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
              Iniciar Experiencia Inmersiva
            </span>
          </button>
        ) : (
          <iframe
            src={youtubeUrl}
            title="Así se vive una noche en AMARTE"
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>
    </section>
  );
}
