import { motion, AnimatePresence } from 'framer-motion';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-2xl bg-[#17171E] border border-white/8 p-8 overflow-hidden"
          >
            {/* Ambient light glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#19A6E0]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] text-[#19A6E0] uppercase tracking-widest font-heading">
                  ¿Cómo encontrarnos?
                </span>
                <h3 className="font-heading text-2xl text-white uppercase mt-1">
                  UBICACIÓN Y CONTACTO
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-[#929095] hover:text-white transition-colors duration-250 text-xl font-light"
              >
                ✕
              </button>
            </div>

            {/* Dirección */}
            <div className="mb-6 p-4 rounded-xl bg-white/3 border border-white/5">
              <p className="font-heading text-[#FFF5F8] text-sm uppercase tracking-wide">
                📌 Amarte Suite Teusaquillo
              </p>
              <p className="font-body text-xs text-[#929095] mt-1 leading-relaxed">
                Calle 62 #14-19 · Bogotá, Colombia
              </p>
              <p className="font-body text-xs text-[#E6007E] mt-2 font-medium">
                Atención y Reservas 24/7
              </p>
            </div>

            {/* Canales */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-lg border border-white/5 bg-white/2">
                <span className="text-[10px] text-[#929095] uppercase block">WhatsApp</span>
                <a
                  href="https://wa.me/573007416683"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-heading text-sm text-[#FFF5F8] hover:text-[#E6007E] transition-colors"
                >
                  +573007416683
                </a>
              </div>
              <div className="p-3 rounded-lg border border-white/5 bg-white/2">
                <span className="text-[10px] text-[#929095] uppercase block">Teléfono Fijo</span>
                <span className="font-heading text-sm text-[#FFF5F8]">
                  (601) 255-8420
                </span>
              </div>
            </div>

            {/* Botones de Navegación */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://waze.com/ul?ll=4.648281,-74.065842&navigate=yes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-[#19A6E0] hover:bg-[#19A6E0]/90 text-white font-heading text-xs uppercase tracking-widest text-center transition-all duration-200"
              >
                🚙 IR POR WAZE
              </a>
              <a
                href="https://maps.google.com/?q=Amarte+Suite+Calle+62+%2314-19+Bogota"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-heading text-xs uppercase tracking-widest text-center transition-all duration-200"
              >
                🗺️ GOOGLE MAPS
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
