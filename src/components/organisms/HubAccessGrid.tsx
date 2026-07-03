import { motion } from 'framer-motion';

interface HubAccessItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  tag?: string;
  glowColor: 'magenta' | 'cyan' | 'gold';
  action: () => void;
}

interface HubAccessGridProps {
  onOpenLocation: () => void;
  onNavigateToView: (view: string) => void;
}

export default function HubAccessGrid({ onOpenLocation, onNavigateToView }: HubAccessGridProps) {
  const items: HubAccessItem[] = [
    {
      id: 'sexshop',
      title: 'Boutique Erótica',
      description: 'Juguetes, lencería y secretos para tu noche.',
      icon: '🖤',
      tag: 'Premium',
      glowColor: 'gold',
      action: () => onNavigateToView('sexshop'),
    },
    {
      id: 'restaurante',
      title: 'Restaurante Gourmet',
      description: 'Platos exclusivos y cenas románticas servidas en la suite.',
      icon: '🍽️',
      glowColor: 'cyan',
      action: () => onNavigateToView('restaurante'),
    },
    {
      id: 'bebidas',
      title: 'Bar & Coctelería',
      description: 'Licores premium, champaña y cócteles de autor.',
      icon: '🥂',
      glowColor: 'magenta',
      action: () => onNavigateToView('bebidas'),
    },
    {
      id: 'ubicacion',
      title: 'Contacto y Ubicación',
      description: 'Cómo llegar a Teusaquillo, Waze, Google Maps y atención.',
      icon: '📍',
      glowColor: 'cyan',
      action: onOpenLocation,
    },
  ];

  const glowStyles = {
    magenta: 'hover:shadow-[0_0_20px_rgba(230,0,126,0.35)] hover:border-[#E6007E]/40',
    cyan: 'hover:shadow-[0_0_20px_rgba(25,166,224,0.35)] hover:border-[#19A6E0]/40',
    gold: 'hover:shadow-[0_0_20px_rgba(241,229,172,0.35)] hover:border-[#F1E5AC]/40',
  };

  const tagStyles = {
    magenta: 'bg-[#E6007E]/10 text-[#E6007E] border-[#E6007E]/20',
    cyan: 'bg-[#19A6E0]/10 text-[#19A6E0] border-[#19A6E0]/20',
    gold: 'bg-[#F1E5AC]/10 text-[#F1E5AC] border-[#F1E5AC]/20',
  };

  return (
    <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto" aria-label="Experiences Hub">
      <div className="text-center mb-8">
        <h3 className="font-heading text-xs text-[#19A6E0] uppercase tracking-widest mb-2">
          Completa tu Estadía
        </h3>
        <h2 className="font-heading text-3xl md:text-4xl text-white uppercase">
          UNIVERSO DE <span className="text-[#E6007E] filter drop-shadow-[0_0_12px_rgba(230,0,126,0.25)]">EXPERIENCIAS</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            onClick={item.action}
            className={`group cursor-pointer relative rounded-xl bg-[#17171E]/50 backdrop-blur-md border border-white/5 p-6 flex flex-col justify-between transition-all duration-300 ${glowStyles[item.glowColor]}`}
          >
            {/* Tag Flotante */}
            {item.tag && (
              <span className={`absolute top-4 right-4 text-[10px] uppercase tracking-widest font-heading px-2 py-0.5 rounded-full border ${tagStyles[item.glowColor]}`}>
                {item.tag}
              </span>
            )}

            <div>
              {/* Icono */}
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
                {item.icon}
              </div>

              {/* Título */}
              <h4 className="font-heading text-lg text-white mb-2 group-hover:text-[#E6007E] transition-colors duration-300 uppercase">
                {item.title}
              </h4>

              {/* Descripción */}
              <p className="font-body text-xs text-[#929095] font-light leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Micro-acción visual */}
            <div className="mt-6 flex items-center text-[10px] uppercase tracking-widest font-heading text-[#E6007E] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Explorar <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
