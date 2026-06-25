import { motion } from 'framer-motion';

export default function ContactoSection() {
  return (
    <section className="py-16 px-6 max-w-6xl mx-auto border-t border-white/5" aria-label="Contacto y Ubicación">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Info y Mapas */}
        <div>
          <span className="text-xs text-[#19A6E0] uppercase tracking-widest font-heading mb-2 block">
            Encuéntranos
          </span>
          <h2 className="font-heading text-3xl md:text-4xl text-white uppercase mb-6">
            CONTACTO Y <span className="text-[#E6007E] filter drop-shadow-[0_0_12px_rgba(230,0,126,0.25)]">UBICACIÓN</span>
          </h2>

          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-xl bg-[#17171E]/50 border border-white/5 backdrop-blur-md">
              <p className="font-heading text-white text-sm uppercase tracking-wide">📍 DIRECCIÓN</p>
              <p className="font-body text-xs text-[#D1D1D6] mt-1 leading-relaxed">
                Calle 62 # 14 - 19, Teusaquillo · Bogotá, Colombia
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#17171E]/50 border border-white/5 backdrop-blur-md">
              <p className="font-heading text-white text-sm uppercase tracking-wide">📞 CELULAR & WHATSAPP</p>
              <p className="font-body text-xs text-[#D1D1D6] mt-1 leading-relaxed">
                Celular: <a href="tel:+573007416683" className="text-[#19A6E0] hover:underline font-medium">300 741 6683</a> <br />
                WhatsApp Reservas: <a href="https://wa.me/573007416683" target="_blank" rel="noopener noreferrer" className="text-[#E6007E] hover:underline font-medium">300 741 6683</a>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#17171E]/50 border border-white/5 backdrop-blur-md">
              <p className="font-heading text-white text-sm uppercase tracking-wide">✉️ CORREO ELECTRÓNICO</p>
              <a href="mailto:info@amartesuite.com" className="font-body text-xs text-[#D1D1D6] mt-1 block hover:text-[#E6007E] transition-colors">
                info@amartesuite.com
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://maps.google.com/?q=Amarte+Suite+Calle+62+%2314-19+Bogota"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-[#E6007E] hover:bg-[#E6007E]/90 text-white font-heading text-xs uppercase tracking-widest text-center transition-all duration-200 shadow-[0_0_12px_rgba(230,0,126,0.2)]"
            >
              🗺️ ABRIR GOOGLE MAPS
            </a>
            <a
              href="https://waze.com/ul?ll=4.648281,-74.065842&navigate=yes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-heading text-xs uppercase tracking-widest text-center transition-all duration-200"
            >
              🚙 IR POR WAZE
            </a>
          </div>
        </div>

        {/* Right Column: Redes Sociales */}
        <div className="rounded-2xl bg-[#17171E]/30 border border-white/5 p-8 backdrop-blur-md relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[300px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#E6007E]/5 rounded-full blur-3xl pointer-events-none" />

          <span className="text-[10px] text-[#19A6E0] uppercase tracking-widest font-heading mb-2">
            Únete a nuestra órbita
          </span>
          <h3 className="font-heading text-2xl text-white uppercase mb-4">
            REDES SOCIALES
          </h3>
          <p className="font-body text-xs text-[#D1D1D6] max-w-xs leading-relaxed mb-8">
            Síguenos en nuestras redes sociales oficiales para conocer promociones exclusivas, tips de pareja y echar un vistazo a nuestras suites.
          </p>

          <div className="flex gap-6">
            {/* Instagram */}
            <motion.a
              whileHover={{ scale: 1.1, y: -4 }}
              href="https://instagram.com/amarte_suite"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full border border-[#E6007E]/40 bg-[#17171E] flex items-center justify-center text-white shadow-[0_0_15px_rgba(230,0,126,0.15)] hover:shadow-[0_0_25px_rgba(230,0,126,0.35)] hover:border-[#E6007E] transition-all duration-300"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6 fill-current text-[#E6007E]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </motion.a>

            {/* TikTok */}
            <motion.a
              whileHover={{ scale: 1.1, y: -4 }}
              href="https://tiktok.com/@amarte_suite"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full border border-[#19A6E0]/40 bg-[#17171E] flex items-center justify-center text-white shadow-[0_0_15px_rgba(25,166,224,0.15)] hover:shadow-[0_0_25px_rgba(25,166,224,0.35)] hover:border-[#19A6E0] transition-all duration-300"
              aria-label="TikTok"
            >
              <svg className="w-6 h-6 fill-current text-[#19A6E0]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.97 1.2 2.27 2.01 3.73 2.37v3.9c-1.36-.08-2.68-.53-3.83-1.32-.49-.34-.94-.74-1.33-1.2v7.71c.02 1.63-.37 3.25-1.12 4.67-.74 1.41-1.87 2.58-3.24 3.35-1.37.77-2.92 1.15-4.48 1.11-1.57-.04-3.11-.53-4.43-1.42-1.32-.88-2.34-2.17-2.92-3.66-.58-1.5-.68-3.14-.28-4.69.4-1.55 1.27-2.94 2.49-3.98 1.22-1.04 2.76-1.67 4.38-1.8v4.03c-.82.02-1.62.27-2.29.74-.67.47-1.16 1.14-1.39 1.91-.23.77-.2 1.59.08 2.34.28.75.82 1.37 1.51 1.78.69.4 1.49.57 2.29.49.8-.08 1.54-.44 2.11-.99.57-.55.91-1.3.97-2.1.04-.63.02-6.52.02-11.23z"/>
              </svg>
            </motion.a>

            {/* Facebook */}
            <motion.a
              whileHover={{ scale: 1.1, y: -4 }}
              href="https://facebook.com/amartesuite"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full border border-white/20 bg-[#17171E] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:border-white transition-all duration-300"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6 fill-current text-white/80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}
