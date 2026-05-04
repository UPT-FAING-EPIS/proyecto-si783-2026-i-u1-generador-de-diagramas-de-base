'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Database } from 'lucide-react';

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column */}
        <div className="flex flex-col items-start z-10">
          <span className="inline-flex items-center gap-2 border border-[#1A6CF6]/40 bg-[#1A6CF6]/10 text-[#1A6CF6] text-sm px-4 py-1.5 rounded-full mb-6">
            ✨ Colaboración en tiempo real
          </span>

          <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
            Diseña bases de datos<br />en equipo,{" "}
            <span className="text-[#1A6CF6]">en segundos</span>
          </h1>

          <p className="text-slate-400 text-lg mt-5 max-w-lg">
            Convierte tu SQL en diagramas visuales en tiempo real. Colabora, exporta y optimiza sin instalar nada.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 bg-[#1A6CF6] hover:bg-[#1557d4] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Empezar gratis <ArrowRight size={18} />
            </Link>
            <button className="border border-[#1E2A45] hover:border-[#1A6CF6]/60 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Ver demo
            </button>
          </div>

          <ul className="flex flex-col gap-2 mt-6">
            {["Sin tarjeta de crédito", "Colaboración en tiempo real", "Compatible con PostgreSQL, MySQL"].map(text => (
              <li key={text} className="flex items-center gap-2 text-sm text-slate-400">
                <Check size={14} className="text-[#1A6CF6]" /> {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column - Animated ER Diagram */}
        <div className="relative w-full h-[480px] lg:h-[520px]">
          
          {/* Decorative Glow */}
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-72 h-72 bg-[#1A6CF6]/10 blur-[80px] rounded-full" />
            <div className="absolute w-48 h-48 bg-[#7C3AED]/10 blur-[60px] rounded-full" />
          </div>

          {/* Skeletons to avoid Hydration Mismatch */}
          {!mounted && (
            <div className="w-full h-full animate-pulse bg-[#0F1A2E]/50 rounded-2xl border border-[#1E2A45]/50" />
          )}

          {/* Actual Nodes & SVG when mounted */}
          {mounted && (
            <>
              {/* SVG Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <marker id="arrowhead-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#1A6CF6" />
                  </marker>
                  <marker id="arrowhead-purple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#7C3AED" />
                  </marker>
                </defs>
                
                {/* clientes -> ventas */}
                <path d="M 180 80 Q 250 80 270 120" stroke="#1A6CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.6" markerEnd="url(#arrowhead-blue)" />
                
                {/* productos -> ventas */}
                <path d="M 180 340 Q 250 340 270 280" stroke="#1A6CF6" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.6" markerEnd="url(#arrowhead-blue)" />
                
                {/* categorias -> productos */}
                <path d="M 100 440 Q 100 400 120 380" stroke="#7C3AED" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.5" markerEnd="url(#arrowhead-purple)" />
              </svg>

              {/* Node 1: clientes */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="absolute top-4 left-4 bg-[#0F1A2E] border border-[#1E2A45] rounded-xl p-4 w-48 shadow-lg shadow-[#1A6CF6]/5"
              >
                <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-[#1E2A45]">
                  <Database size={12} className="text-[#1A6CF6]" />
                  <span className="text-xs font-mono font-bold text-[#1A6CF6]">clientes</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono text-slate-400">
                  <div className="text-yellow-400">🔑 id · uuid</div>
                  <div>── nombre · varchar</div>
                  <div>── email · varchar</div>
                  <div>── created_at</div>
                </div>
              </motion.div>

              {/* Node 2: ventas */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute top-[20%] right-4 bg-[#0F1A2E] border border-[#1E2A45] rounded-xl p-4 w-52 shadow-lg shadow-[#1A6CF6]/5 z-10"
              >
                <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-[#1E2A45]">
                  <Database size={12} className="text-[#1A6CF6]" />
                  <span className="text-xs font-mono font-bold text-[#1A6CF6]">ventas</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono text-slate-400">
                  <div className="text-yellow-400">🔑 id · uuid</div>
                  <div className="text-slate-300">🔗 cliente_id · uuid</div>
                  <div className="text-slate-300">🔗 producto_id · uuid</div>
                  <div>── total · numeric</div>
                  <div>── fecha · timestamp</div>
                </div>
              </motion.div>

              {/* Node 3: productos */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute bottom-24 left-10 bg-[#0F1A2E] border border-[#1E2A45] rounded-xl p-4 w-48 shadow-lg shadow-[#1A6CF6]/5"
              >
                <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-[#1E2A45]">
                  <Database size={12} className="text-[#1A6CF6]" />
                  <span className="text-xs font-mono font-bold text-[#1A6CF6]">productos</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono text-slate-400">
                  <div className="text-yellow-400">🔑 id · uuid</div>
                  <div>── nombre · varchar</div>
                  <div>── precio · numeric</div>
                  <div className="text-slate-300">🔗 categoria_id</div>
                </div>
              </motion.div>

              {/* Node 4: categorias */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="absolute bottom-4 right-16 bg-[#0F1A2E] border border-[#1E2A45] rounded-xl p-4 w-44 shadow-lg shadow-[#7C3AED]/10"
              >
                <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-[#1E2A45]">
                  <Database size={12} className="text-[#7C3AED]" />
                  <span className="text-xs font-mono font-bold text-[#7C3AED]">categorias</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono text-slate-400">
                  <div className="text-yellow-400">🔑 id · uuid</div>
                  <div>── nombre · varchar</div>
                  <div>── descripcion</div>
                </div>
              </motion.div>
            </>
          )}
        </div>
        
      </div>
    </section>
  );
}
