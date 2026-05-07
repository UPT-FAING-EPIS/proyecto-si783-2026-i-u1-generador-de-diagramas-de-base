import { Code2, Network, Users } from 'lucide-react';

const steps = [
  {
    num: "1",
    title: "Pega tu SQL",
    icon: <Code2 className="w-6 h-6" />,
    description: "Escribe o pega tu DDL en el editor Monaco integrado."
  },
  {
    num: "2",
    title: "Visualiza el diagrama",
    icon: <Network className="w-6 h-6" />,
    description: "El canvas genera automáticamente el diagrama ER con React Flow."
  },
  {
    num: "3",
    title: "Colabora en tiempo real",
    icon: <Users className="w-6 h-6" />,
    description: "Comparte el enlace y edita con tu equipo simultáneamente."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 relative z-10" id="producto">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">¿Cómo funciona?</h2>
        <p className="text-slate-400 text-center mb-16 text-lg">
          Tres pasos para pasar de SQL a diagrama visual
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div 
              key={step.num}
              className="bg-[#0F1A2E] border border-[#1E2A45] rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <span className="text-5xl font-bold text-[#1A6CF6]/10 font-mono">0{step.num}</span>
              </div>
              
              <div className="bg-[#1A6CF6]/10 text-[#1A6CF6] p-3 rounded-xl w-fit mb-6">
                {step.icon}
              </div>
              
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
