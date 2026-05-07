import { Zap, Network, Link2, Share2 } from 'lucide-react';

const features = [
  {
    title: "Tiempo real",
    icon: <Zap className="w-6 h-6" />,
    description: "Cambios reflejados instantáneamente en el canvas."
  },
  {
    title: "Autolayout inteligente",
    icon: <Network className="w-6 h-6" />,
    description: "Organización automática de nodos y relaciones."
  },
  {
    title: "Relaciones automáticas",
    icon: <Link2 className="w-6 h-6" />,
    description: "Detecta FKs y dibuja flechas automáticamente."
  },
  {
    title: "Exportación fácil",
    icon: <Share2 className="w-6 h-6" />,
    description: "Exporta como PNG, SVG o comparte enlace público."
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6" id="caracteristicas">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">Características principales</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <div 
              key={feat.title}
              className="bg-[#0F1A2E] border border-[#1E2A45] rounded-2xl p-6 hover:border-[#1A6CF6]/50 transition-colors duration-200"
            >
              <div className="bg-[#1A6CF6]/10 text-[#1A6CF6] p-3 rounded-xl w-fit mb-6">
                {feat.icon}
              </div>
              
              <h3 className="text-lg font-bold mb-3">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
