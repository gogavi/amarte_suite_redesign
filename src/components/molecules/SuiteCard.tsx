import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Suite } from '../../services/ratesService';
import { useReservation } from '../../context/ReservationContext';

interface SuiteCardProps {
  suite: Suite;
  onSelect: (suite: Suite) => void;
  isActiveDeckCard?: boolean; // True si es la tarjeta superior activa en el mazo móvil
}

export default function SuiteCard({ suite, onSelect, isActiveDeckCard = false }: SuiteCardProps) {
  const { dispatch } = useReservation();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPlayingMobile, setIsPlayingMobile] = useState(false);

  // Detectar pantalla móvil/táctil para desactivar el hover de video
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reiniciar estado de video si la tarjeta deja de ser la activa en el mazo
  useEffect(() => {
    if (!isActiveDeckCard) {
      setIsPlayingMobile(false);
    }
  }, [isActiveDeckCard]);

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'SET_SUITE', payload: suite });
    onSelect(suite);
  };

  const handlePlayClickMobile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingMobile(true);
  };

  // URL de YouTube embebido optimizada para bucle silencioso
  const videoUrl = suite.videoYoutubeId
    ? `https://www.youtube.com/embed/${suite.videoYoutubeId}?autoplay=1&mute=1&loop=1&playlist=${suite.videoYoutubeId}&controls=0&modestbranding=1&rel=0`
    : '';

  // Determinar si debemos renderizar el reproductor de video
  const shouldPlayVideo = isMobile 
    ? (isActiveDeckCard && isPlayingMobile) 
    : (isHovered && suite.videoYoutubeId);

  return (
    <motion.div
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      whileHover={!isActiveDeckCard ? { y: -6 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative reflective-glass glow-magenta-hover rounded-brand overflow-hidden flex flex-col h-full group border border-white/10 shadow-lg select-none"
    >
      {/* Contenedor de la Imagen / Video */}
      <div className="relative h-52 md:h-56 overflow-hidden bg-[#0D0D11]">
        
        {/* Renderizado de Video Embebido de YouTube */}
        <AnimatePresence>
          {shouldPlayVideo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full z-10 pointer-events-none"
            >
              <iframe
                src={videoUrl}
                title={`Vista previa de ${suite.name}`}
                className="w-full h-full scale-[1.35] object-cover border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Imagen de Portada Estática */}
        <img
          src={suite.image}
          alt={suite.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-transparent to-transparent z-[5]"></div>

        {/* Etiqueta de Categoría */}
        <span className="absolute top-4 right-4 bg-bg-dark/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-cyan-orbital border border-cyan-orbital/25 uppercase tracking-widest font-heading z-[5]">
          {suite.category}
        </span>

        {/* Botón Play Explicito para móviles (solo si hay video y es la carta activa del mazo) */}
        {suite.videoYoutubeId && isMobile && isActiveDeckCard && !isPlayingMobile && (
          <button
            onClick={handlePlayClickMobile}
            className="absolute inset-0 m-auto z-[8] w-14 h-14 bg-bg-dark/90 text-white rounded-full flex items-center justify-center border border-white/20 shadow-2xl hover:scale-105 active:scale-95 transition-transform"
          >
            <svg className="w-6 h-6 fill-current text-magenta-digital ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="p-5 flex flex-col flex-grow relative z-[5]">
        <h3 className="font-heading text-lg md:text-xl text-white tracking-wide mb-2 group-hover:text-magenta-digital transition-colors uppercase">
          {suite.name}
        </h3>
        
        <p className="font-body text-xs md:text-sm text-gris-medio font-light line-clamp-3 mb-4 leading-relaxed flex-grow">
          {suite.description}
        </p>

        {/* Comodidades destacadas */}
        <div className="flex flex-wrap gap-2.5 mb-5 text-[10px] text-rosa-cuarzo font-light uppercase tracking-wider">
          {suite.features.jacuzzi && <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/5">🛁 Jacuzzi</span>}
          {suite.features.sauna && <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/5">♨️ Sauna</span>}
          {suite.features.cama_movimiento && <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/5">🌪️ Cama de Movimiento</span>}
          {suite.features.aire_acondicionado && <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/5">❄️ A/C</span>}
        </div>

        {/* Precios e Interacción de Conversión */}
        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gris-medio block uppercase tracking-widest font-heading">Desde (4h)</span>
            <span className="text-base md:text-lg font-heading text-cyan-orbital font-bold">
              ${suite.rates.weekday['4h'].toLocaleString('es-CO')} COP
            </span>
          </div>
          <button
            onClick={handleBookClick}
            className="bg-magenta-digital hover:bg-magenta-digital/90 text-white font-heading text-xs uppercase tracking-widest px-4 py-2.5 rounded-brand transition-all hover:scale-105 active:scale-95 duration-200 shadow-md glow-magenta"
          >
            Reservar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
