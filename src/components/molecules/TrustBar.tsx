export default function TrustBar() {
  const trustStats = [
    { label: "Parejas Felices", value: "+50.000" },
    { label: "Se vale explorar", value: "Suites Temáticas" },
    { label: "Calificación Google", value: "4.8 ★" },
    { label: "Atención Digital", value: "24/7" }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="relative glass-panel rounded-brand px-6 py-4 flex flex-wrap justify-around items-center gap-6 overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-12 bg-cyan-orbital/10 blur-xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-12 bg-magenta-digital/10 blur-xl pointer-events-none"></div>

        {trustStats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center text-center z-10">
            <span className="font-heading text-2xl text-cyan-orbital tracking-wider">
              {stat.value}
            </span>
            <span className="font-body text-xs text-gris-medio uppercase tracking-widest mt-1">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
