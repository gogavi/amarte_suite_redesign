import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  imageEmoji: string;
}

const SEXSHOP_STORE_URL = 'https://hotelamartesuite.store/collections/sex-shop';

interface SexShopViewProps {
  onBack: () => void;
}

const products: Product[] = [
  {
    id: 'lenceria_satina',
    name: 'Conjunto Lencería Satín',
    category: 'Lencería',
    price: '$85.000',
    description: 'Elegancia y textura ultrasuave para encender la noche.',
    imageEmoji: '👙',
  },
  {
    id: 'bala_vibradora',
    name: 'Bala Vibradora Recargable',
    category: 'Juguetes',
    price: '$65.000',
    description: 'Silenciosa, resistente al agua y con múltiples modos de vibración.',
    imageEmoji: '🖤',
  },
  {
    id: 'aceite_termo',
    name: 'Aceite de Masaje Térmico',
    category: 'Cuidado & Sensaciones',
    price: '$35.000',
    description: 'Efecto calor al soplar con delicioso aroma a frutos rojos.',
    imageEmoji: '✨',
  },
  {
    id: 'kit_placer',
    name: 'Kit Placer Completo',
    category: 'Kits',
    price: '$120.000',
    description: 'Antifaz de satín, esposas suaves de felpa, pluma y lubricante íntimo.',
    imageEmoji: '🎁',
  },
];

export default function SexShopView({ onBack }: SexShopViewProps) {
  return (
    <div className="min-h-screen bg-[#0D0D11] text-[#FFF5F8] py-16 px-6 relative">
      {/* Lights background */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-[#F1E5AC]/10 rounded-full pointer-events-none" />
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
          <span className="text-xs text-[#F1E5AC] uppercase tracking-widest font-heading">
            Boutique Erótica
          </span>
          <h1 className="font-heading text-4xl md:text-5xl text-white uppercase mt-2">
            SEXSHOP <span className="text-[#E6007E] ">PREMIUM</span>
          </h1>
          <p className="font-body text-[#929095] text-sm mt-3 leading-relaxed max-w-xl">
            Descubre nuestra fina selección de accesorios y juguetes eróticos. Puedes solicitar que los dejemos listos en tu habitación de manera 100% discreta.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="rounded-xl bg-[#17171E] border border-white/5 p-5 flex flex-col justify-between hover:border-[#F1E5AC]/30 transition-[border-color] duration-200"
            >
              <div>
                <span className="text-[10px] text-[#F1E5AC] uppercase tracking-wider font-heading block mb-3">
                  {product.category}
                </span>
                <div className="text-4xl my-4 text-center bg-white/2 rounded-lg py-4 border border-white/3">
                  {product.imageEmoji}
                </div>
                <h3 className="font-heading text-base text-white uppercase mb-1">{product.name}</h3>
                <p className="font-body text-[11px] text-[#929095] leading-relaxed mb-4">{product.description}</p>
              </div>

              <div>
                <div className="text-lg font-heading text-white mb-4">{product.price}</div>
                <a
                  href={SEXSHOP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-lg border border-[#F1E5AC]/25 hover:bg-[#F1E5AC] hover:text-black hover:border-transparent text-[#F1E5AC] font-heading text-xs uppercase tracking-widest transition-[background-color,color,border-color] duration-200 text-center block"
                >
                  Añadir Discretamente
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
