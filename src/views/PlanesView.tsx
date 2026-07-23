import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PLANES_CONTENT, type PlanContent } from '../data/planesContent';
import {
  fetchPlanWeekday6hPrices,
  formatPlanPrice,
} from '../services/plansCatalogService';

type PlanCard = PlanContent & {
  priceLabel: string;
};

interface PlanesViewProps {
  onBack: () => void;
  onSelectPlan: (planName: string) => void;
}

export default function PlanesView({ onBack, onSelectPlan }: PlanesViewProps) {
  const [planes, setPlanes] = useState<PlanCard[]>(() =>
    PLANES_CONTENT.map((plan) => ({ ...plan, priceLabel: '…' }))
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPrices() {
      try {
        const prices = await fetchPlanWeekday6hPrices();
        if (cancelled) return;

        setPlanes(
          PLANES_CONTENT.map((plan) => {
            const amount = prices[plan.dbName];
            return {
              ...plan,
              priceLabel:
                typeof amount === 'number' && amount > 0
                  ? formatPlanPrice(amount)
                  : 'Consultar',
            };
          })
        );
      } catch {
        if (cancelled) return;
        setPlanes(
          PLANES_CONTENT.map((plan) => ({ ...plan, priceLabel: 'Consultar' }))
        );
      }
    }

    void loadPrices();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D11] text-[#FFF5F8] py-16 px-6 relative">
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#E6007E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#19A6E0]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <button
          onClick={onBack}
          className="mb-8 flex items-center text-xs uppercase tracking-widest font-heading text-[#929095] hover:text-white transition-colors duration-200"
        >
          ← Regresar al Inicio
        </button>

        <div className="mb-12">
          <span className="text-xs text-[#19A6E0] uppercase tracking-widest font-heading">
            Experiencias de Decoración
          </span>
          <h1 className="font-heading text-4xl md:text-5xl text-white uppercase mt-2">
            NUESTROS <span className="text-[#E6007E] filter drop-shadow-[0_0_12px_rgba(230,0,126,0.25)]">PLANES ({planes.length})</span>
          </h1>
          <p className="font-body text-[#929095] text-sm mt-3 leading-relaxed max-w-xl">
            Precios desde pack 6 horas · Domingo a Jueves. Todo listo antes de tu llegada.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {planes.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="rounded-2xl bg-[#17171E] border border-white/5 p-6 flex flex-col justify-between hover:border-[#E6007E]/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(230,0,126,0.15)]"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl">{plan.imageEmoji}</div>
                  <span className="text-[10px] text-[#19A6E0] uppercase tracking-wider font-heading px-2 py-0.5 rounded bg-[#19A6E0]/10 border border-[#19A6E0]/20">
                    {plan.category}
                  </span>
                </div>
                <h3 className="font-heading text-xl text-white uppercase mb-2">{plan.name}</h3>
                <p className="font-body text-xs text-[#929095] leading-relaxed mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-[10px] text-[#929095] block uppercase tracking-widest font-heading mb-1">
                    Desde (6h)
                  </span>
                  <div className="text-2xl font-heading text-[#E6007E]">{plan.priceLabel}</div>
                </div>

                <ul className="space-y-2 border-t border-white/5 pt-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="font-body text-xs text-[#929095] flex items-start">
                      <span className="text-[#19A6E0] mr-2">✦</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onSelectPlan(plan.name)}
                className="w-full py-3 rounded-xl bg-[#E6007E] hover:bg-[#E6007E]/90 text-white font-heading text-xs uppercase tracking-widest transition-all duration-200"
              >
                Añadir con Martina
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
