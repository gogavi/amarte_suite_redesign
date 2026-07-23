import { motion } from 'framer-motion';

interface Drink {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  imageEmoji: string;
}

const BEBIDAS_STORE_URL = 'https://hotelamartesuite.store/collections/bebidas-y-licores';

interface BebidasViewProps {
  onBack: () => void;
}

const drinks: Drink[] = [
  {
    id: 'champaña_moet',
  name: 'Vino Tinto Casillero del Diablo',
    category: 'Vinos & Burbujas',
    price: '$100.000',
    description: 'Vino tinto de la casa para brindar en las ocasiones más especiales.',
    imageEmoji: '🍾',
  },
  {
    id: 'gin_tonic_orbital',
    name: 'Gin Tonic de Frutos Rojos',
    category: 'Cócteles de Autor',
    price: '$32.000',
    description: 'Ginebra premium infusionada con arándanos, fresas y tónica premium.',
    imageEmoji: '🍸',
  },
  {
    id: 'margarita_pasion',
    name: 'Margarita Pasión',
    category: 'Cócteles Clásicos',
    price: '$28.000',
    description: 'Tequila, triple sec y zumo de maracuyá fresco con escarchado de sal picante.',
    imageEmoji: '🍹',
  },
  {
    id: 'limonada_coco',
    name: 'Limonada de Coco Orbital',
    category: 'Sin Alcohol',
    price: '$18.000',
    description: 'Refrescante mezcla de leche de coco cremosa y zumo de limón fresco.',
    imageEmoji: '🥥',
  },
];

export default function BebidasView({ onBack }: BebidasViewProps) {
  return (
    <div className="min-h-screen bg-[#0D0D11] text-[#FFF5F8] py-16 px-6 relative">
      {/* Lights background */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#E6007E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#19A6E0]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center text-xs uppercase tracking-widest font-heading text-[#929095] hover:text-white transition-colors duration-200"
        >
          ← Regresar al Inicio
        </button>

        {/* Title */}
        <div className="mb-12">
          <span className="text-xs text-[#E6007E] uppercase tracking-widest font-heading">
            Bar & Coctelería
          </span>
          <h1 className="font-heading text-4xl md:text-5xl text-white uppercase mt-2">
            BEBIDAS <span className="text-[#19A6E0] filter drop-shadow-[0_0_12px_rgba(25,166,224,0.25)]">Y LICORES</span>
          </h1>
          <p className="font-body text-[#929095] text-sm mt-3 leading-relaxed max-w-xl">
            Acompaña tu noche con nuestra coctelería de autor y licores premium. Ordena directo a tu suite con total privacidad.
          </p>
        </div>

        {/* Drinks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {drinks.map((drink, index) => (
            <motion.div
              key={drink.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="rounded-xl bg-[#17171E] border border-white/5 p-5 flex flex-col justify-between hover:border-[#19A6E0]/30 transition-all duration-300"
            >
              <div>
                <span className="text-[10px] text-[#19A6E0] uppercase tracking-wider font-heading block mb-3">
                  {drink.category}
                </span>
                <div className="text-4xl my-4 text-center bg-white/2 rounded-lg py-4 border border-white/3">
                  {drink.imageEmoji}
                </div>
                <h3 className="font-heading text-base text-white uppercase mb-1">{drink.name}</h3>
                <p className="font-body text-[11px] text-[#929095] leading-relaxed mb-4">{drink.description}</p>
              </div>

              <div>
                <div className="text-lg font-heading text-white mb-4">{drink.price}</div>
                <a
                  href={BEBIDAS_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-lg border border-[#E6007E]/25 hover:bg-[#E6007E] hover:text-white hover:border-transparent text-[#E6007E] font-heading text-xs uppercase tracking-widest transition-all duration-200 text-center block"
                >
                  Ordenar a la Suite
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
