import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BottomCTA() {
  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-4xl mx-auto relative overflow-hidden bg-[#0F1A2E] border border-[#1E2A45] rounded-3xl p-12 md:p-16 text-center shadow-2xl shadow-[#1A6CF6]/5">
        
        {/* Decorative Glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#1A6CF6]/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#7C3AED]/15 blur-3xl rounded-full pointer-events-none" />
        
        <h2 className="relative text-3xl md:text-4xl font-bold mb-4">
          Empieza a diseñar tu base de datos ahora
        </h2>
        
        <p className="relative text-slate-400 text-lg mb-8 max-w-xl mx-auto">
          Únete a cientos de equipos que ya diseñan mejor.
        </p>
        
        <Link 
          href="/register"
          className="relative inline-flex items-center justify-center gap-2 bg-[#1A6CF6] hover:bg-[#1557d4] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
        >
          Crear cuenta gratis <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}
