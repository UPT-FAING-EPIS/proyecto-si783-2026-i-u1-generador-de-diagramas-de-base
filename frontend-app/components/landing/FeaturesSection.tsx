'use client';

import { useState } from 'react';
import { Zap, Network, Link2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  {
    id: 'realtime',
    title: "Tiempo real absoluto",
    icon: <Zap className="w-6 h-6" />,
    description: "Cada cambio que haces en el esquema se refleja instantáneamente en el canvas. Sin botones de 'refrescar' ni tiempos de carga.",
    color: "bg-blue-100 text-blue-600",
    visual: (
      <div className="w-full h-full bg-[#0F172A] rounded-t-[2rem] flex items-center justify-center p-4 md:p-8 gap-4 md:gap-8 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
        
        {/* Left: Code Editor */}
        <div className="w-1/2 h-full bg-[#1E293B] rounded-xl p-4 border border-slate-700 font-mono text-[10px] md:text-xs text-slate-300 shadow-2xl relative z-10 flex flex-col justify-center">
           <div className="flex gap-1.5 mb-3">
             <div className="w-2 h-2 rounded-full bg-rose-500" />
             <div className="w-2 h-2 rounded-full bg-amber-500" />
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
           </div>
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.1 }}>
             <span className="text-pink-400">CREATE TABLE</span> <span className="text-emerald-300">users</span> (
           </motion.div>
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.1 }} className="ml-4">
             <span className="text-blue-300">id</span> <span className="text-purple-400">INT PRIMARY KEY</span>,
           </motion.div>
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.1 }} className="ml-4 flex items-center">
             <span className="text-blue-300">email</span> <span className="text-purple-400 ml-1">VARCHAR</span>
             <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-3 bg-blue-400 ml-1 inline-block" />
           </motion.div>
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.1 }}>);</motion.div>
        </div>
        
        {/* Right: ER Diagram Node */}
        <div className="w-1/2 flex items-center relative z-10">
           {/* Connecting pulse line */}
           <div className="absolute -left-8 top-1/2 w-8 h-px bg-blue-500/30 overflow-hidden">
             <motion.div 
                initial={{ x: -20 }} animate={{ x: 40 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-4 h-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" 
             />
           </div>

           <motion.div 
             initial={{ scale: 0.8, opacity: 0, y: 10 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 15 }}
             className="w-full bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden"
           >
              <div className="bg-blue-50 px-3 py-2 text-xs font-bold text-blue-900 border-b border-blue-100 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" /> users
              </div>
              <motion.div 
                initial={{ backgroundColor: "#ffffff" }} animate={{ backgroundColor: ["#ffffff", "#eff6ff", "#ffffff"] }} transition={{ delay: 1.2, duration: 1 }}
                className="px-3 py-2 text-[10px] flex justify-between border-b border-slate-50"
              >
                <span className="font-medium text-slate-700">id</span> <span className="text-slate-400 font-mono">INT</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 1.8, duration: 0.3 }}
                className="px-3 py-2 text-[10px] flex justify-between overflow-hidden bg-blue-50/30"
              >
                <span className="font-medium text-slate-700">email</span> <span className="text-blue-500 font-mono">VARCHAR</span>
              </motion.div>
           </motion.div>
        </div>
      </div>
    )
  },
  {
    id: 'autolayout',
    title: "Autolayout inteligente",
    icon: <Network className="w-6 h-6" />,
    description: "Nuestro algoritmo de posicionamiento organiza automáticamente miles de nodos y relaciones para que siempre se vea perfecto.",
    color: "bg-purple-100 text-purple-600",
    visual: (
      <div className="w-full h-full bg-slate-50 rounded-t-[2rem] flex items-center justify-center relative overflow-hidden">
        {/* Nodes starting chaotic and flying to positions */}
        <motion.div 
          initial={{ x: -80, y: -60, rotate: -15 }}
          animate={{ x: -60, y: -30, rotate: 0 }}
          transition={{ duration: 1.5, ease: "circOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
          className="absolute w-20 h-24 bg-white shadow-lg border border-slate-200 rounded-lg z-10 flex flex-col" 
        >
          <div className="h-5 bg-purple-100 rounded-t-lg border-b border-purple-200" />
          <div className="flex-1 p-2 flex flex-col gap-1.5">
            <div className="h-1.5 w-full bg-slate-100 rounded" />
            <div className="h-1.5 w-3/4 bg-slate-100 rounded" />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ x: 100, y: 60, rotate: 25 }}
          animate={{ x: 60, y: 40, rotate: 0 }}
          transition={{ duration: 1.5, ease: "circOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
          className="absolute w-20 h-24 bg-white shadow-lg border border-slate-200 rounded-lg z-10 flex flex-col" 
        >
          <div className="h-5 bg-purple-100 rounded-t-lg border-b border-purple-200" />
          <div className="flex-1 p-2 flex flex-col gap-1.5">
            <div className="h-1.5 w-full bg-slate-100 rounded" />
            <div className="h-1.5 w-2/3 bg-slate-100 rounded" />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ x: 40, y: -90, rotate: 10 }}
          animate={{ x: -60, y: 50, rotate: 0 }}
          transition={{ duration: 1.5, ease: "circOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
          className="absolute w-20 h-24 bg-white shadow-lg border border-slate-200 rounded-lg z-10 flex flex-col" 
        >
           <div className="h-5 bg-purple-100 rounded-t-lg border-b border-purple-200" />
           <div className="flex-1 p-2 flex flex-col gap-1.5">
            <div className="h-1.5 w-full bg-slate-100 rounded" />
          </div>
        </motion.div>

        {/* SVG connecting lines that draw themselves when nodes align */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
           <motion.path 
             d="M 50% 50% L 50% 50%" // Fallback for hydration
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1.2, duration: 0.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 3 }}
             className="hidden md:block" // Approximate positions work best when container size is stable
           />
           {/* Hardcoded paths for the specific relative layout */}
           <g transform="translate(180, 125)">
             <motion.path 
               d="M -30 -10 L 10 -10 L 10 30 L 50 30" 
               stroke="#c084fc" strokeWidth="2" fill="none"
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ pathLength: 1, opacity: 1 }}
               transition={{ duration: 0.6, delay: 1.2, ease: "easeOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 2.3 }}
             />
             <motion.path 
               d="M -30 65 L 10 65 L 10 30 L 50 30" 
               stroke="#c084fc" strokeWidth="2" fill="none"
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ pathLength: 1, opacity: 1 }}
               transition={{ duration: 0.6, delay: 1.4, ease: "easeOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 2.1 }}
             />
           </g>
        </svg>
      </div>
    )
  },
  {
    id: 'relations',
    title: "Relaciones automáticas",
    icon: <Link2 className="w-6 h-6" />,
    description: "Detecta claves foráneas e índices y dibuja las flechas con la cardinalidad correcta sin que tengas que configurar nada.",
    color: "bg-emerald-100 text-emerald-600",
    visual: (
      <div className="w-full h-full bg-slate-50 rounded-t-[2rem] flex items-center justify-center relative overflow-hidden px-8">
        
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />

        <div className="flex w-full max-w-[300px] justify-between items-center relative z-10">
          {/* Table A */}
          <div className="w-[110px] bg-white rounded-lg shadow-xl border border-slate-200">
            <div className="bg-emerald-50 px-2 py-1.5 text-[10px] font-bold text-emerald-800 border-b border-emerald-100 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> orders
            </div>
            <div className="px-2 py-1.5 text-[8px] flex justify-between border-b border-slate-50">
              <span className="text-slate-600 font-medium">id</span> <span className="text-slate-400">PK</span>
            </div>
            <motion.div 
              animate={{ backgroundColor: ["#ffffff", "#ecfdf5", "#ffffff"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="px-2 py-1.5 text-[8px] flex justify-between relative"
            >
              <span className="text-slate-600 font-medium">user_id</span> <span className="text-emerald-600 font-bold">FK</span>
              <motion.div 
                animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" 
              />
            </motion.div>
          </div>

          {/* Connection Area */}
          <div className="flex-1 h-full relative flex items-center justify-center">
            {/* SVG Bezier connection */}
            <svg className="absolute inset-0 w-full h-[100px] -translate-y-[10px] pointer-events-none overflow-visible">
              <motion.path 
                d="M 0 50 C 30 50, 40 20, 80 20" 
                stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 }}
              />
              <motion.path 
                d="M 0 50 C 30 50, 40 20, 80 20" 
                stroke="#34d399" strokeWidth="4" fill="none"
                style={{ filter: "blur(4px)" }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 }}
              />
            </svg>
          </div>

          {/* Table B */}
          <div className="w-[110px] bg-white rounded-lg shadow-xl border border-slate-200 -translate-y-[30px]">
            <div className="bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-slate-700 border-b border-slate-200 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> users
            </div>
            <motion.div 
              animate={{ backgroundColor: ["#ffffff", "#ecfdf5", "#ffffff"] }}
              transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 1 }}
              className="px-2 py-1.5 text-[8px] flex justify-between border-b border-slate-50 relative"
            >
              <span className="text-slate-600 font-medium">id</span> <span className="text-emerald-600 font-bold">PK</span>
              <motion.div 
                animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 1 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full -translate-x-1" 
              />
            </motion.div>
            <div className="px-2 py-1.5 text-[8px] flex justify-between">
              <span className="text-slate-600 font-medium">email</span> <span className="text-slate-400">VARCHAR</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'export',
    title: "Exportación fácil",
    icon: <Share2 className="w-6 h-6" />,
    description: "Exporta tu diagrama completo como PNG transparente, SVG vectorial o comparte un enlace público de solo lectura.",
    color: "bg-orange-100 text-orange-600",
    visual: (
      <div className="w-full h-full bg-slate-50 rounded-t-[2rem] flex items-center justify-center relative overflow-hidden" style={{ perspective: "1000px" }}>
        
        {/* Background glow */}
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ffedd5,transparent_60%)]"
        />

        {/* 3D Morphing Container */}
        <motion.div 
          animate={{ 
            rotateX: [30, 0, 0, 30], 
            rotateY: [-20, 0, 0, -20],
            scale: [0.85, 1.1, 1.1, 0.85],
            y: [15, 0, 0, 15]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex items-center justify-center w-36 h-44 z-10"
        >
          {/* State 1: The Diagram */}
          <motion.div 
            animate={{ opacity: [1, 0, 0, 1], scale: [1, 0.9, 0.9, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-white border border-slate-200 rounded-xl shadow-xl p-3 flex flex-col gap-2.5 overflow-hidden"
          >
            <div className="w-full h-5 bg-orange-100 rounded-md border border-orange-200" />
            <div className="flex gap-2 h-12">
              <div className="w-1/2 h-full bg-slate-50 rounded border border-slate-200" />
              <div className="w-1/2 h-full bg-slate-50 rounded border border-slate-200" />
            </div>
            <div className="w-full h-px bg-slate-200 mt-2 relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border border-slate-200 rounded-full flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
               </div>
            </div>
            <div className="w-2/3 h-2 bg-slate-100 rounded mx-auto mt-2" />
          </motion.div>

          {/* State 2: The Exported File Icon */}
          <motion.div 
            animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 0.9] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-2xl flex flex-col items-center justify-center text-white border border-orange-400"
          >
             <Share2 className="w-12 h-12 mb-3 drop-shadow-md text-orange-50" />
             <div className="bg-white/20 backdrop-blur px-4 py-1.5 rounded-full border border-white/30">
               <span className="font-bold text-sm tracking-widest text-white drop-shadow">PNG</span>
             </div>
          </motion.div>
        </motion.div>

        {/* Laser Scanner Effect */}
        <motion.div 
          animate={{ top: ["-20%", "120%", "120%", "-20%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-1.5 bg-orange-400 shadow-[0_0_20px_4px_#f97316] z-20 mix-blend-overlay"
        />
      </div>
    )
  }
];

export default function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const feat = features[activeIndex];

  return (
    <section className="bg-slate-50 relative w-full" id="caracteristicas">
      <div className="max-w-6xl mx-auto px-6 relative">
        
        {/* Invisible Scroll Triggers (These give the section its natural height) */}
        <div className="w-full">
          {features.map((_, i) => (
            <motion.div 
              key={i}
              className="h-[80vh] w-full"
              onViewportEnter={() => setActiveIndex(i)}
              viewport={{ margin: "-40% 0px -40% 0px" }}
            />
          ))}
        </div>

        {/* Absolute Container that covers the triggers, holding the sticky elements */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col lg:flex-row gap-12 lg:gap-20 pointer-events-none px-6">
          
          {/* Left: Sticky Text Area */}
          <div className="w-full lg:w-1/3 sticky top-0 h-screen flex flex-col justify-center pointer-events-auto">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight leading-tight">
              Todo lo que necesitas, <span className="text-[#1A6CF6] block mt-2">sin lo que sobra.</span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Diseñado específicamente para ingenieros de datos y desarrolladores que quieren ir rápido y sin fricciones.
            </p>
          </div>

          {/* Right: In-Place AnimatePresence Card Area */}
          <div className="w-full lg:w-2/3 sticky top-0 h-screen flex items-center justify-center pointer-events-auto">
            <div className="relative w-full h-[450px] md:h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={feat.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col"
                >
                  {/* Top Text Content */}
                  <div className="p-8 md:p-12 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <div className={`p-2 rounded-xl ${feat.color}`}>
                        {feat.icon}
                      </div>
                      <span className="text-xs font-bold bg-slate-100 text-slate-500 uppercase tracking-wider px-3 py-1 rounded-full">
                        {feat.id}
                      </span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 mb-4">{feat.title}</h3>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                      {feat.description}
                    </p>
                  </div>
                  
                  {/* Bottom Visual Area */}
                  <div className="h-[200px] md:h-[250px] w-full p-6 pb-0 flex items-end justify-center">
                    <div className="w-full h-full rounded-t-3xl overflow-hidden relative shadow-inner">
                      {feat.visual}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
