import { lazy, Suspense } from 'react';
import { ReservationProvider } from './context/ReservationContext';
import { isGraciasPath } from './lib/thanksReturn';
import Home from './views/Home';

const GraciasView = lazy(() => import('./views/GraciasView'));

function GraciasFallback() {
  return (
    <main className="min-h-screen bg-bg-dark text-white font-body flex items-center justify-center px-4">
      <p className="font-heading uppercase tracking-widest text-sm" role="status">Confirmando tu pago</p>
    </main>
  );
}

export default function App() {
  if (typeof window !== 'undefined' && isGraciasPath(window.location.pathname)) {
    return (
      <Suspense fallback={<GraciasFallback />}>
        <GraciasView />
      </Suspense>
    );
  }

  return (
    <ReservationProvider>
      <Home />
    </ReservationProvider>
  );
}
