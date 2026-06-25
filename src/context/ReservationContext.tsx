import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Suite } from '../services/ratesService';

export interface ReservationState {
  selectedSuite: Suite | null;
  date: string;
  time: string;
  hours: "4h" | "8h" | "12h" | "day_hotelero";
  userName: string;
  userDocument: string;
  userWhatsapp: string;
  userEmail: string;
  decorationPlan: string;
  totalPrice: number;
}

type ReservationAction =
  | { type: 'SET_SUITE'; payload: Suite }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_TIME'; payload: string }
  | { type: 'SET_HOURS'; payload: "4h" | "8h" | "12h" | "day_hotelero" }
  | { type: 'SET_USER_DATA'; payload: { name: string; document: string; whatsapp: string; email: string } }
  | { type: 'SET_PLAN'; payload: string }
  | { type: 'CALCULATE_PRICE'; payload: number }
  | { type: 'RESET' };

const initialState: ReservationState = {
  selectedSuite: null,
  date: '',
  time: '',
  hours: '4h',
  userName: '',
  userDocument: '',
  userWhatsapp: '',
  userEmail: '',
  decorationPlan: 'ninguno',
  totalPrice: 0
};

const reservationReducer = (state: ReservationState, action: ReservationAction): ReservationState => {
  switch (action.type) {
    case 'SET_SUITE':
      return { ...state, selectedSuite: action.payload };
    case 'SET_DATE':
      return { ...state, date: action.payload };
    case 'SET_TIME':
      return { ...state, time: action.payload };
    case 'SET_HOURS':
      return { ...state, hours: action.payload };
    case 'SET_USER_DATA':
      return {
        ...state,
        userName: action.payload.name,
        userDocument: action.payload.document,
        userWhatsapp: action.payload.whatsapp,
        userEmail: action.payload.email
      };
    case 'SET_PLAN':
      return { ...state, decorationPlan: action.payload };
    case 'CALCULATE_PRICE':
      return { ...state, totalPrice: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const ReservationContext = createContext<{
  state: ReservationState;
  dispatch: React.Dispatch<ReservationAction>;
} | undefined>(undefined);

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reservationReducer, initialState);
  return (
    <ReservationContext.Provider value={{ state, dispatch }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation debe ser usado dentro de un ReservationProvider');
  }
  return context;
};
