export default function TrustBar() {
  const trustStats = [
    { label: 'Parejas Felices', value: '+50.000' },
    { label: 'Se vale explorar', value: 'Suites Temáticas' },
    { label: 'Calificación Google', value: '4.8 ★' },
    { label: 'Atención Digital', value: '24/7' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="relative rounded-brand px-6 py-4 flex flex-wrap justify-around items-center gap-6 overflow-hidden border border-white/8 bg-[#17171E]">
        {trustStats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center z-10">
            <span className="font-heading text-2xl text-cyan-orbital tracking-wider">{stat.value}</span>
            <span className="font-body text-xs text-gris-medio uppercase tracking-widest mt-1">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
