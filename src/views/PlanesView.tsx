import { motion } from 'framer-motion';

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  imageEmoji: string;
  category: 'Romance' | 'Celebración' | 'Fantasía' | 'Bienestar';
}

interface PlanesViewProps {
  onBack: () => void;
  onSelectPlan: (planName: string) => void;
}

const planesList: Plan[] = [
  {
    id: 'decoracion_clasica',
    name: 'Plan Romance Clásico',
    price: '$120.000',
    category: 'Romance',
    description: 'La atmósfera tradicional e infalible para celebrar amor y complicidad.',
    features: [
      'Pétalos de rosa naturales sobre la cama',
      'Globos metalizados de helio (Rojos)',
      'Velas aromáticas led decorativas',
      '1 Botella de vino o champaña de la casa',
    ],
    imageEmoji: '🌹',
  },
  {
    id: 'plan_cumpleanos',
    name: 'Plan Cumpleaños',
    price: '$150.000',
    category: 'Celebración',
    description: 'Festejá tu día especial con un montaje festivo y dulce.',
    features: [
      'Letrero y globos metalizados de Feliz Cumpleaños',
      'Mini torta gourmet para compartir',
      'Globos de helio en colores de la marca',
      'Botella de vino espumoso de la casa',
    ],
    imageEmoji: '🎂',
  },
  {
    id: 'plan_amarte',
    name: 'Plan Amarte',
    price: '$250.000',
    category: 'Romance',
    description: 'Nuestra experiencia insignia de lujo y romance total.',
    features: [
      'Arreglo de rosas premium importadas',
      'Decoración extendida con pétalos y globos de corazón',
      'Botella de champaña Möet o seleccionada',
      'Deliciosas fresas cubiertas con chocolate',
    ],
    imageEmoji: '💖',
  },
  {
    id: 'plan_erotico',
    name: 'Plan Erótico',
    price: '$190.000',
    category: 'Fantasía',
    description: 'Diseñado para romper la rutina y explorar sensaciones apasionantes.',
    features: [
      'Iluminación roja/magenta de acento romántico',
      'Aceites de masaje aromáticos y térmicos',
      'Kit erótico de iniciación (juguete + plumas)',
      'Vino espumoso y fresas con chocolate',
    ],
    imageEmoji: '🖤',
  },
  {
    id: 'plan_humedo',
    name: 'Plan Húmedo',
    price: '$200.000',
    category: 'Bienestar',
    description: 'Relajación absoluta en jacuzzi y sauna para renovar energías.',
    features: [
      'Kit de sales relajantes y espuma para jacuzzi',
      'Esencias de eucalipto para sauna',
      'Uso de dos batas de baño afelpadas premium',
      'Tabla gourmet de quesos y jamones + champaña',
    ],
    imageEmoji: '🛀',
  },
  {
    id: 'plan_cabana',
    name: 'Plan Cabaña',
    price: '$170.000',
    category: 'Romance',
    description: 'Un escape acogedor con calidez de chimenea y detalles rústicos.',
    features: [
      'Decoración rústica con faroles y velas led',
      'Vino caliente aromatizado especial de la casa',
      'Malvaviscos con chocolate caliente',
      'Cobijas térmicas extra para mayor confort',
    ],
    imageEmoji: '🏡',
  },
  {
    id: 'plan_novimiento',
    name: 'Plan Novimiento',
    price: '$195.000',
    category: 'Fantasía',
    description: 'Luces rítmicas en movimiento y sonido envolvente para dejarte llevar.',
    features: [
      'Sistema de luces en movimiento automatizado',
      'Playlist especial sincronizada a altavoces de la suite',
      'Kit erótico premium sorpresa',
      '2 Cócteles de autor de nuestra carta',
    ],
    imageEmoji: '🎬',
  },
];

export default function PlanesView({ onBack, onSelectPlan }: PlanesViewProps) {
  return (
    <div className="min-h-screen bg-[#0D0D11] text-[#FFF5F8] py-16 px-6 relative">
      {/* Lights background */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#E6007E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#19A6E0]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center text-xs uppercase tracking-widest font-heading text-[#929095] hover:text-white transition-colors duration-200"
        >
          ← Regresar al Inicio
        </button>

        {/* Title */}
        <div className="mb-12">
          <span className="text-xs text-[#19A6E0] uppercase tracking-widest font-heading">
            Experiencias de Decoración
          </span>
          <h1 className="font-heading text-4xl md:text-5xl text-white uppercase mt-2">
            NUESTROS <span className="text-[#E6007E] filter drop-shadow-[0_0_12px_rgba(230,0,126,0.25)]">PLANES ({planesList.length})</span>
          </h1>
          <p className="font-body text-[#929095] text-sm mt-3 leading-relaxed max-w-xl">
            Descubre y compara todos nuestros montajes exclusivos para tu velada. Todo listo antes de tu llegada.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {planesList.map((plan, index) => (
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
                <div className="text-2xl font-heading text-[#E6007E] mb-6">{plan.price}</div>

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
