import { useState, useEffect } from 'react';
import HeroOrbital from '../components/organisms/HeroOrbital';
import TrustBar from '../components/molecules/TrustBar';
import VideoExperience from '../components/organisms/VideoExperience';
import SuitesSection from '../components/organisms/SuitesSection';
import ReservaExpressForm from '../components/organisms/ReservaExpressForm';
import HubAccessGrid from '../components/organisms/HubAccessGrid';
import LocationModal from '../components/molecules/LocationModal';
import PromoBanner from '../components/molecules/PromoBanner';
import MartinaFeatureSection from '../components/organisms/MartinaFeatureSection';
import PlanesSection from '../components/organisms/PlanesSection';
import PlanesView from './PlanesView';
import SexShopView from './SexShopView';
import RestauranteView from './RestauranteView';
import BebidasView from './BebidasView';
import ContactoSection from '../components/organisms/ContactoSection';
import { Suite } from '../services/ratesService';
import { motion, AnimatePresence } from 'framer-motion';
import { openChat, prefetchMartinaWidget } from '../services/amarteChatbot';
import { useReservation } from '../context/ReservationContext';

export default function Home() {
  const { dispatch } = useReservation();
  const [activeView, setActiveView] = useState<'home' | 'planes' | 'sexshop' | 'restaurante' | 'bebidas'>('home');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  useEffect(() => {
    prefetchMartinaWidget();
  }, []);

  const handleSelectSuite = (suite: Suite) => {
    // SuiteCard ya hace SET_SUITE; el formulario reutiliza ese contexto
    // para fijar la habitación y aplicar tarifas/enlaces del mismo flujo.
    void suite;
    setIsFormOpen(true);
  };

  const handleActivateChat = (initialMsg?: string) => {
    void openChat(initialMsg);
  };

  const handleActivateVoice = () => {
    // Voz en vivo temporalmente en “Próximamente”: abre chat de texto.
    void openChat();
  };

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void openChat('Hola Martina, quiero reservar una suite.');
  };

  const scrollToSuites = () => {
    const el = document.getElementById('suites-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (activeView === 'planes') {
    return (
      <PlanesView
        onBack={() => setActiveView('home')}
        onSelectPlan={(planName) => {
          handleActivateChat(`Hola Martina, quiero reservar una suite y agregar el plan de decoración: ${planName}`);
        }}
      />
    );
  }

  if (activeView === 'sexshop') {
    return (
      <SexShopView
        onBack={() => setActiveView('home')}
      />
    );
  }

  if (activeView === 'restaurante') {
    return (
      <RestauranteView
        onBack={() => setActiveView('home')}
      />
    );
  }

  if (activeView === 'bebidas') {
    return (
      <BebidasView
        onBack={() => setActiveView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-white relative">


      {/* Luces atmosféricas de fondo de marca */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-magenta-digital/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-cyan-orbital/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. Hero Orbital (Martina en el portal + CTAs conversacionales) */}
      <HeroOrbital 
        onActivateChat={handleActivateChat} 
        onActivateVoice={handleActivateVoice}
      />

      {/* Trust Bar (Validación Social Rápida) */}
      <div className="py-2">
        <TrustBar />
      </div>

      {/* 2. Video Experience (Venta Emocional Cinemática) */}
      <VideoExperience videoId="OUDd45y2Fr8" startSeconds={3} />

      {/* 3. Suites Section (Híbrido: Mobile Deck / Desktop Grid con H1) */}
      <div id="suites-section">
        <SuitesSection onSelectSuite={handleSelectSuite} />
      </div>

      {/* 4. Martina Feature Section (Agent-First Showcase con Mockup) */}
      <MartinaFeatureSection 
        onSpeakToMartina={scrollToHero}
        onExploreSuites={scrollToSuites}
      />

      {/* 5. Planes Románticos (Carrusel Horizontal) */}
      <PlanesSection 
        onSelectPlan={(planName) => {
          handleActivateChat(`Hola Martina, quiero reservar y añadir el plan: ${planName}`);
        }}
      />

      {/* 6. Promociones Banner (Independiente y fácil de editar) */}
      <PromoBanner 
        onPromoClick={(message) => handleActivateChat(message)}
      />

      {/* 7. Hub de Accesos Rápidos Premium (SexShop, Restaurante, Bebidas, Ubicación) */}
      <HubAccessGrid 
        onOpenLocation={() => setIsLocationOpen(true)}
        onNavigateToView={(view) => setActiveView(view as any)}
      />

      {/* 8. Contacto y Ubicación (Dirección visible, mapas y redes) */}
      <ContactoSection />

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-bg-dark/80 text-center text-sm text-gris-medio font-light">
        <p className="mb-2">© 2026 Inversiones Ogavi S.A. · Amarte Suite · El Planeta Romántico de Bogotá</p>
        <p className="text-xs text-gris-carbon">Teusaquillo · Calle 62 #14-19 · Bogotá, Colombia</p>
      </footer>

      {/* Formulario de reserva express */}
      {isFormOpen && (
        <ReservaExpressForm
          onClose={() => {
            setIsFormOpen(false);
            dispatch({ type: 'RESET' });
          }}
        />
      )}

      {/* Modal de Contacto y Ubicación */}
      <LocationModal 
        isOpen={isLocationOpen} 
        onClose={() => setIsLocationOpen(false)} 
      />

      {/* Modal de Promociones Vigentes */}
      <AnimatePresence>
        {isPromoOpen && (
          <div className="fixed inset-0 z-[900] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPromoOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl bg-[#17171E] border border-white/8 p-8 overflow-hidden z-10"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] text-[#E6007E] uppercase tracking-widest font-heading">
                    Descuentos Especiales
                  </span>
                  <h3 className="font-heading text-2xl text-white uppercase mt-1">
                    PROMOCIONES ORBITALES
                  </h3>
                </div>
                <button
                  onClick={() => setIsPromoOpen(false)}
                  className="text-[#929095] hover:text-white transition-colors duration-250 text-xl font-light"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-white/5 bg-white/2">
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-sm text-white">✨ LUNES A JUEVES</span>
                    <span className="text-xs font-bold text-[#E6007E]">-15% OFF</span>
                  </div>
                  <p className="font-body text-xs text-[#929095] mt-1">
                    En estadías de 8 horas o más seleccionando Suite temática.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-white/2">
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-sm text-white">🎂 CUMPLEAÑOS</span>
                    <span className="text-xs font-bold text-[#19A6E0]">PLAN GRATIS</span>
                  </div>
                  <p className="font-body text-xs text-[#929095] mt-1">
                    Obtén el Plan Romance Básico sin costo reservando Suite con Jacuzzi VIP en tu mes de cumpleaños.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsPromoOpen(false);
                  handleActivateChat("Hola Martina, vi las promociones de cumpleaños/lunes a jueves y quiero aplicar una.");
                }}
                className="w-full mt-6 py-3 rounded-xl bg-[#E6007E] hover:bg-[#E6007E]/90 text-white font-heading text-xs uppercase tracking-widest transition-all duration-200"
              >
                Preguntar a Martina por WhatsApp
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

