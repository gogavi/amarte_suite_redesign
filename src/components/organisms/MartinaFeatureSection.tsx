import { motion } from 'framer-motion';
import martinaSectionImg from '../../assets/martina_sectionV2_transparent.png';

interface MartinaFeatureSectionProps {
  onSpeakToMartina: () => void;
  onExploreSuites: () => void;
}

export default function MartinaFeatureSection({ onSpeakToMartina, onExploreSuites }: MartinaFeatureSectionProps) {
  const features = [
    {
      title: 'Reserva tu Suite al instante',
      desc: 'Consulta disponibilidad en tiempo real y recibe asistencia en el proceso de pre-reserva express.',
    },
    {
      title: 'Aconseja el mejor plan',
      desc: 'Encuentra el montaje de decoración ideal (romántico, de cumpleaños o fantasía) para tu velada.',
    },
    {
      title: 'Asesora sobre tarifas y suites',
      desc: 'Resuelve todas tus dudas sobre precios por horas (4h, 8h, 12h, Día Hotelero) y equipamiento.',
    },
    {
      title: 'Entrega el AmarTip del día',
      desc: 'Consejos de pareja, tips de seducción y secretos íntimos para encender tu estadía en Amarte.',
    },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative overflow-hidden">
      {/* Subtle static background glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-[#E6007E]/3 rounded-full blur-3xl pointer-events-none" />

      {/* Left Column: Image (lg:col-span-6) */}
      <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-lg flex justify-center"
        >
          <img
            src={martinaSectionImg}
            alt="Interfaz interactiva de Martina Agente Virtual"
            className="w-full h-auto object-contain block drop-shadow-[0_20px_45px_rgba(0,0,0,0.6)] drop-shadow-[0_0_30px_rgba(230,0,126,0.15)]"
          />
        </motion.div>
      </div>

      {/* Right Column: Context / Explanation (lg:col-span-6, order-1 on mobile, order-2 on desktop) */}
      <div className="lg:col-span-6 flex flex-col justify-center order-1 lg:order-2 z-10">
        <span className="text-xs text-[#19A6E0] uppercase tracking-widest font-heading mb-3">
          Anfitriona Digital
        </span>
        <h2 className="font-heading text-4xl md:text-5xl text-white uppercase leading-none mb-6">
          Diseña tu noche ideal <br />
          con nuestra <span className="text-[#E6007E] filter drop-shadow-[0_0_12px_rgba(230,0,126,0.25)]">Agente Virtual</span>
        </h2>
        <p className="font-body text-sm text-[#929095] leading-relaxed mb-8 max-w-xl">
          Martina es tu guía interactiva inteligente. Te ayuda a organizar cada detalle de tu estadía por chat o voz de manera inmediata antes de hablar con nuestro equipo humano.
        </p>

        {/* Feature List */}
        <div className="space-y-4 mb-8">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-[#E6007E] font-bold text-lg select-none">✓</span>
              <div>
                <h4 className="font-heading text-sm text-white uppercase tracking-wide">
                  {feat.title}
                </h4>
                <p className="font-body text-xs text-[#929095] mt-0.5 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onSpeakToMartina}
            className="px-8 py-4 rounded-xl bg-[#E6007E] hover:bg-[#E6007E]/90 text-white font-heading text-xs uppercase tracking-widest text-center transition-all duration-200 shadow-[0_0_15px_rgba(230,0,126,0.2)]"
          >
            Hablar con Martina
          </button>
          <button
            onClick={onExploreSuites}
            className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-heading text-xs uppercase tracking-widest text-center transition-all duration-200"
          >
            Explorar Suites
          </button>
        </div>
      </div>
    </section>
  );
}
