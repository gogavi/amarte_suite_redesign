import { motion } from 'framer-motion';

interface Dish {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  imageEmoji: string;
}

const RESTAURANTE_STORE_URL = 'https://hotelamartesuite.store/collections/restaurante';

interface RestauranteViewProps {
  onBack: () => void;
}

const dishes: Dish[] = [
  {
    id: 'lomo_orbital',
    name: 'Tbone Steak',
    category: 'Platos Fuertes',
    price: '$45.000',
    description: 'Medallón de lomo fino bañado en salsa de vino tinto con puré trufado.',
    imageEmoji: '🥩',
  },
  {
    id: 'sushi_amarte',
    name: 'Sushi Roll Amarte (10 bocados)',
    category: 'Platos Fuertes',
    price: '$48.000',
    description: 'Salmón fresco, palmitos de cangrejo, aguacate y queso crema con salsa teriyaki dulce.',
    imageEmoji: '🍣',
  },
  {
    id: 'fondue_amor',
    name: 'Fondue Romántico de Queso',
    category: 'Para Compartir',
    price: '$55.000',
    description: 'Mezcla de quesos premium fundidos acompañados de pan artesanal y embutidos.',
    imageEmoji: '🫕',
  },
  {
    id: 'fresas_chocolate',
    name: 'Volcán de Chocolate & Fresas',
    category: 'Postres',
    price: '$28.000',
    description: 'Esponjoso volcán con centro líquido de chocolate caliente y fresas frescas.',
    imageEmoji: '🍫',
  },
];

export default function RestauranteView({ onBack }: RestauranteViewProps) {
  return (
    <div className="min-h-screen bg-[#0D0D11] text-[#FFF5F8] py-16 px-6 relative">
      {/* Lights background */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-[#19A6E0]/10 rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#E6007E]/10 rounded-full pointer-events-none" />

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
          <span className="text-xs text-[#19A6E0] uppercase tracking-widest font-heading">
            Gastronomía en Suite
          </span>
          <h1 className="font-heading text-4xl md:text-5xl text-white uppercase mt-2">
            RESTAURANTE <span className="text-[#E6007E] ">GOURMET</span>
          </h1>
          <p className="font-body text-[#929095] text-sm mt-3 leading-relaxed max-w-xl">
            Deleítate con nuestra carta gastronómica sin salir de la comodidad de tu suite. Platos preparados al instante por nuestros chefs colaboradores.
          </p>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {dishes.map((dish, index) => (
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="rounded-xl bg-[#17171E] border border-white/5 p-5 flex flex-col justify-between hover:border-[#19A6E0]/30 transition-[border-color] duration-200"
            >
              <div>
                <span className="text-[10px] text-[#19A6E0] uppercase tracking-wider font-heading block mb-3">
                  {dish.category}
                </span>
                <div className="text-4xl my-4 text-center bg-white/2 rounded-lg py-4 border border-white/3">
                  {dish.imageEmoji}
                </div>
                <h3 className="font-heading text-base text-white uppercase mb-1">{dish.name}</h3>
                <p className="font-body text-[11px] text-[#929095] leading-relaxed mb-4">{dish.description}</p>
              </div>

              <div>
                <div className="text-lg font-heading text-white mb-4">{dish.price}</div>
                <a
                  href={RESTAURANTE_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-lg border border-[#19A6E0]/25 hover:bg-[#19A6E0] hover:text-black hover:border-transparent text-[#19A6E0] font-heading text-xs uppercase tracking-widest transition-[background-color,color,border-color] duration-200 text-center block"
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
