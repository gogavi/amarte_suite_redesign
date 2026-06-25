import { ReservationProvider } from './context/ReservationContext';
import Home from './views/Home';

export default function App() {
  return (
    <ReservationProvider>
      <Home />
    </ReservationProvider>
  );
}
