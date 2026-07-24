import { useState, useEffect, lazy, Suspense } from 'react';
import HeroOrbital from '../components/organisms/HeroOrbital';
import TrustBar from '../components/molecules/TrustBar';
import { Suite } from '../services/ratesService';
import { openChat, prefetchMartinaWidget } from '../services/amarteChatbot';
import { useReservation } from '../context/ReservationContext';

const VideoExperience = lazy(() => import('../components/organisms/VideoExperience'));
const SuitesSection = lazy(() => import('../components/organisms/SuitesSection'));
const ReservaExpressForm = lazy(() => import('../components/organisms/ReservaExpressForm'));
const HubAccessGrid = lazy(() => import('../components/organisms/HubAccessGrid'));
const LocationModal = lazy(() => import('../components/molecules/LocationModal'));
const PromoBanner = lazy(() => import('../components/molecules/PromoBanner'));
const MartinaFeatureSection = lazy(() => import('../components/organisms/MartinaFeatureSection'));
const PlanesSection = lazy(() => import('../components/organisms/PlanesSection'));
const ContactoSection = lazy(() => import('../components/organisms/ContactoSection'));
const PlanesView = lazy(() => import('./PlanesView'));
const SexShopView = lazy(() => import('./SexShopView'));
const RestauranteView = lazy(() => import('./RestauranteView'));
const BebidasView = lazy(() => import('./BebidasView'));

function SectionFallback() {
  return <div className="min-h-[120px] w-full" aria-hidden="true" />;
}

export default function Home() {
  const { dispatch } = useReservation();
  const [activeView, setActiveView] = useState<'home' | 'planes' | 'sexshop' | 'restaurante' | 'bebidas'>('home');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) prefetchMartinaWidget();
    };

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(run, { timeout: 4000 });
    } else {
      timeoutId = setTimeout(run, 2500);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  const handleSelectSuite = (suite: Suite) => {
    void suite;
    setIsFormOpen(true);
  };

  const handleActivateChat = (initialMsg?: string) => {
    void openChat(initialMsg);
  };

  const handleActivateVoice = () => {
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
      <Suspense fallback={<SectionFallback />}>
        <PlanesView
          onBack={() => setActiveView('home')}
          onSelectPlan={(planName) => {
            handleActivateChat(
              `Hola Martina, quiero reservar una suite y agregar el plan de decoración: ${planName}`
            );
          }}
        />
      </Suspense>
    );
  }

  if (activeView === 'sexshop') {
    return (
      <Suspense fallback={<SectionFallback />}>
        <SexShopView onBack={() => setActiveView('home')} />
      </Suspense>
    );
  }

  if (activeView === 'restaurante') {
    return (
      <Suspense fallback={<SectionFallback />}>
        <RestauranteView onBack={() => setActiveView('home')} />
      </Suspense>
    );
  }

  if (activeView === 'bebidas') {
    return (
      <Suspense fallback={<SectionFallback />}>
        <BebidasView onBack={() => setActiveView('home')} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-white relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(ellipse_at_20%_20%,rgba(230,0,126,0.06),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(25,166,224,0.05),transparent_50%)]"
        aria-hidden="true"
      />

      <HeroOrbital onActivateChat={handleActivateChat} onActivateVoice={handleActivateVoice} />

      <div className="py-2">
        <TrustBar />
      </div>

      <Suspense fallback={<SectionFallback />}>
        <VideoExperience videoId="OUDd45y2Fr8" startSeconds={3} />
      </Suspense>

      <div id="suites-section">
        <Suspense fallback={<SectionFallback />}>
          <SuitesSection onSelectSuite={handleSelectSuite} />
        </Suspense>
      </div>

      <Suspense fallback={<SectionFallback />}>
        <MartinaFeatureSection onSpeakToMartina={scrollToHero} onExploreSuites={scrollToSuites} />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <PlanesSection
          onSelectPlan={(planName) => {
            handleActivateChat(`Hola Martina, quiero reservar y añadir el plan: ${planName}`);
          }}
        />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <PromoBanner onPromoClick={(message) => handleActivateChat(message)} />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <HubAccessGrid
          onOpenLocation={() => setIsLocationOpen(true)}
          onNavigateToView={(view) => setActiveView(view as typeof activeView)}
        />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ContactoSection />
      </Suspense>

      <footer className="py-12 border-t border-white/5 bg-bg-dark/80 text-center text-sm text-gris-medio font-light">
        <p className="mb-2">© 2026 Inversiones Ogavi S.A. · Amarte Suite · El Planeta Romántico de Bogotá</p>
        <p className="text-xs text-gris-carbon">Teusaquillo · Calle 62 #14-19 · Bogotá, Colombia</p>
      </footer>

      {isFormOpen && (
        <Suspense fallback={null}>
          <ReservaExpressForm
            onClose={() => {
              setIsFormOpen(false);
              dispatch({ type: 'RESET' });
            }}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
      </Suspense>
    </div>
  );
}
