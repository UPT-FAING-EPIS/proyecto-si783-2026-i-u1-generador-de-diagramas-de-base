'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, MousePointer2, Hand, MessageSquarePlus, Sun, Moon } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';

const fullCode = `-- Prueba tu SQL aquí (Límite 4 tablas en Demo)

CREATE TABLE clientes (
  id UUID PRIMARY KEY,
  nombre VARCHAR,
  email VARCHAR
);

CREATE TABLE ventas (
  id UUID PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  producto_id UUID REFERENCES productos(id),
  total NUMERIC
);

CREATE TABLE productos (
  id UUID PRIMARY KEY,
  nombre VARCHAR,
  precio NUMERIC,
  categoria_id UUID
);

CREATE TABLE categorias (
  id UUID PRIMARY KEY,
  nombre VARCHAR
);`;

export default function HeroSection() {
  const mounted = useMounted();
  const [typedCode, setTypedCode] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTool, setActiveTool] = useState<'cursor' | 'hand' | 'comment'>('cursor');
  const [notes, setNotes] = useState<{ id: string, x: number, y: number, text: string }[]>([
    { id: '1', x: 400, y: 150, text: 'Revisar tipo de dato aquí 👇' }
  ]);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mounted) return;
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullCode.length) {
        setTypedCode(fullCode.slice(0, currentIndex));
        currentIndex += 3;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [mounted]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool === 'comment' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setNotes([...notes, { id: Date.now().toString(), x, y, text: '' }]);
      setActiveTool('cursor');
    }
  };

  const updateNote = (id: string, text: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, text } : n));
  };

  const showClientes = typedCode.includes('CREATE TABLE clientes');
  const showVentas = typedCode.includes('CREATE TABLE ventas');
  const showProductos = typedCode.includes('CREATE TABLE productos');
  const showCategorias = typedCode.includes('CREATE TABLE categorias');

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
      
      {/* Top Illustration Placeholder */}
      <div className="relative w-full max-w-3xl mx-auto h-24 mb-8 flex justify-center items-end">
        <div className="z-10 bg-white border-2 border-slate-800 shadow-xl rounded-full px-8 py-3 flex items-center gap-3 transform hover:scale-105 transition-transform cursor-pointer">
          <span className="font-semibold text-slate-800">Generar diagramas</span>
          <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">👉</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto flex flex-col items-center z-10">
        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
          Diseña bases de datos <br className="hidden sm:block" />
          en equipo, <span className="text-[#1A6CF6]">en segundos.</span>
        </h1>

        <p className="text-slate-600 text-lg sm:text-xl mt-6 max-w-2xl">
          Convierte tu SQL en diagramas visuales en tiempo real. Colabora, exporta y optimiza sin instalar nada, todo en un solo clic.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center bg-[#1A6CF6] hover:bg-[#1557d4] text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-[#1A6CF6]/20"
          >
            Empezar gratis
          </Link>
          <button className="border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg transition-colors bg-white">
            Aprender más
          </button>
        </div>

        {/* DB Carousel (Marquee) */}
        <div className="mt-16 w-full max-w-5xl mx-auto overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10" />
          
          <div className="flex w-[200%] animate-[marquee_20s_linear_infinite]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex flex-1 justify-around items-center opacity-40 grayscale gap-12 px-6">
                <span className="text-xl font-bold text-slate-800">PostgreSQL</span>
                <span className="text-xl font-bold text-slate-800">MongoDB</span>
                <span className="text-xl font-bold text-slate-800 font-serif">MySQL</span>
                <span className="text-xl font-bold text-slate-800">Cassandra</span>
                <span className="text-xl font-bold text-slate-800 font-mono">Redis</span>
                <span className="text-xl font-bold text-slate-800">Neo4j</span>
                <span className="text-xl font-bold text-slate-800 font-serif">SQL Server</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Split-screen Interactive Demo Container */}
      <div className="mt-20 w-full max-w-6xl mx-auto relative rounded-3xl overflow-hidden shadow-2xl shadow-[#1A6CF6]/5 border-2 border-slate-200 flex flex-col md:flex-row h-[600px] text-left">
        
        {/* Left Panel: SQL Editor */}
        <div className={`w-full md:w-[40%] flex flex-col transition-colors duration-300 border-r border-slate-200 ${theme === 'dark' ? 'bg-[#060913]' : 'bg-white'}`}>
          <div className={`h-14 border-b flex items-center px-4 justify-between ${theme === 'dark' ? 'border-[#1E2A45] bg-[#0B1120]' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            
            <div className={`text-xs font-mono font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>schema.sql</div>

            {/* Theme Toggle */}
            <div className="flex bg-slate-200/50 p-1 rounded-lg">
              <button 
                onClick={() => setTheme('light')} 
                className={`p-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                title="Modo Claro"
              >
                <Sun size={14}/>
              </button>
              <button 
                onClick={() => setTheme('dark')} 
                className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-[#1E2A45] shadow-sm text-white' : 'text-slate-400 hover:text-slate-600'}`}
                title="Modo Oscuro"
              >
                <Moon size={14}/>
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 relative">
            <textarea 
              value={typedCode}
              onChange={(e) => setTypedCode(e.target.value)}
              readOnly={isTyping}
              className={`w-full h-full bg-transparent text-[13px] font-mono focus:outline-none resize-none leading-relaxed transition-colors duration-300 ${theme === 'dark' ? 'text-emerald-400' : 'text-slate-800'}`}
              spellCheck="false"
            />
            {isTyping && (
              <motion.div 
                animate={{ opacity: [1, 0] }} 
                transition={{ duration: 0.5, repeat: Infinity }}
                className={`absolute inline-block w-2 h-4 ml-1 ${theme === 'dark' ? 'bg-emerald-400' : 'bg-slate-800'}`}
                style={{
                  top: '1rem',
                  left: '1rem'
                }} // Simplified caret, actual positioning depends on textarea text length, but we show a static one conceptually or let native handle it.
              />
            )}
            
            {!isTyping && (
              <div className={`absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t pointer-events-none flex items-end justify-center pb-4 ${theme === 'dark' ? 'from-[#060913] to-transparent' : 'from-white to-transparent'}`}>
                <span className={`text-xs px-3 py-1.5 rounded-full shadow-sm font-medium border ${theme === 'dark' ? 'bg-[#0F1A2E] text-slate-400 border-[#1E2A45]' : 'bg-white text-slate-600 border-slate-200'}`}>¡El código es editable! Haz la prueba 👇</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Canvas Diagram (Light Miro-Style) */}
        <div 
          ref={canvasRef}
          className={`w-full md:w-[60%] relative overflow-hidden bg-slate-50 ${activeTool === 'comment' ? 'cursor-cell' : activeTool === 'hand' ? 'cursor-grab' : 'cursor-default'}`}
          onClick={handleCanvasClick}
        >
          {/* Toolbar */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white shadow-xl shadow-slate-200/50 rounded-xl flex flex-col p-1.5 gap-1 border border-slate-200 z-50">
            <button onClick={() => setActiveTool('cursor')} className={`p-2.5 rounded-lg transition-colors ${activeTool === 'cursor' ? 'bg-slate-100 text-[#1A6CF6]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} title="Seleccionar">
              <MousePointer2 size={18} className={activeTool === 'cursor' ? 'fill-current' : ''}/>
            </button>
            <button onClick={() => setActiveTool('hand')} className={`p-2.5 rounded-lg transition-colors ${activeTool === 'hand' ? 'bg-slate-100 text-[#1A6CF6]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} title="Mover lienzo">
              <Hand size={18} className={activeTool === 'hand' ? 'fill-current' : ''} />
            </button>
            <div className="w-8 mx-auto border-b border-slate-200 my-1"></div>
            <button onClick={() => setActiveTool('comment')} className={`p-2.5 rounded-lg transition-colors ${activeTool === 'comment' ? 'bg-slate-100 text-[#1A6CF6]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} title="Añadir nota">
              <MessageSquarePlus size={18} className={activeTool === 'comment' ? 'fill-current' : ''} />
            </button>
          </div>

          {!mounted && (
            <div className="w-full h-full bg-slate-50" />
          )}

          {/* Actual Nodes & SVG when mounted */}
          {mounted && (
            <div className="w-full h-full relative scale-90 sm:scale-100 origin-center">
              {/* SVG Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <marker id="arrowhead-gray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#64748b" />
                  </marker>
                </defs>
                
                {showClientes && showVentas && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    d="M 220 120 Q 300 120 320 200" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="5 5" markerEnd="url(#arrowhead-gray)" 
                  />
                )}
                
                {showProductos && showVentas && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    d="M 220 380 Q 300 380 320 300" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="5 5" markerEnd="url(#arrowhead-gray)" 
                  />
                )}
                
                {showCategorias && showProductos && (
                  <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    d="M 100 480 Q 100 440 120 420" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="5 5" markerEnd="url(#arrowhead-gray)" 
                  />
                )}
              </svg>

              <AnimatePresence>
                {/* Node 1: clientes */}
                {showClientes && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute top-10 left-16 bg-white border border-slate-300 rounded-xl w-48 shadow-lg overflow-hidden z-10"
                  >
                    <div className="bg-[#FFF9C4] px-3 py-2 border-b border-slate-300 flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">clientes</span>
                    </div>
                    <div className="p-3 text-[11px] font-mono text-slate-600 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5"><span className="text-amber-500">🔑</span> id <span className="text-slate-400">UUID</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-300">──</span> nombre <span className="text-slate-400">VARCHAR</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-300">──</span> email <span className="text-slate-400">VARCHAR</span></div>
                    </div>
                  </motion.div>
                )}

                {/* Node 2: ventas */}
                {showVentas && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute top-[30%] right-12 bg-white border border-slate-300 rounded-xl w-52 shadow-xl z-10 overflow-hidden"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1A6CF6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20 shadow-md">Alejandro</div>
                    <div className="bg-[#FFF9C4] px-3 py-2 border-b border-slate-300 flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-slate-800">ventas</span>
                    </div>
                    <div className="p-3 text-[11px] font-mono text-slate-600 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5"><span className="text-amber-500">🔑</span> id <span className="text-slate-400">UUID</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-400">🔗</span> cliente_id <span className="text-slate-400">UUID</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-400">🔗</span> producto_id <span className="text-slate-400">UUID</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-300">──</span> total <span className="text-slate-400">NUMERIC</span></div>
                    </div>
                  </motion.div>
                )}

                {/* Node 3: productos */}
                {showProductos && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute bottom-32 left-16 bg-white border border-slate-300 rounded-xl w-48 shadow-lg overflow-hidden z-10"
                  >
                    <div className="bg-[#FFF9C4] px-3 py-2 border-b border-slate-300 flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">productos</span>
                    </div>
                    <div className="p-3 text-[11px] font-mono text-slate-600 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5"><span className="text-amber-500">🔑</span> id <span className="text-slate-400">UUID</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-300">──</span> nombre <span className="text-slate-400">VARCHAR</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-300">──</span> precio <span className="text-slate-400">NUMERIC</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-400">🔗</span> categoria_id <span className="text-slate-400">UUID</span></div>
                    </div>
                  </motion.div>
                )}

                {/* Node 4: categorias */}
                {showCategorias && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute bottom-4 left-4 bg-white border border-slate-300 rounded-xl w-44 shadow-lg overflow-hidden z-10"
                  >
                    <div className="bg-[#FFF9C4] px-3 py-2 border-b border-slate-300 flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">categorias</span>
                    </div>
                    <div className="p-3 text-[11px] font-mono text-slate-600 space-y-1.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5"><span className="text-amber-500">🔑</span> id <span className="text-slate-400">UUID</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-300">──</span> nombre <span className="text-slate-400">VARCHAR</span></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sticky Notes */}
              {notes.map(note => (
                <motion.div 
                  key={note.id} 
                  initial={{ scale: 0, rotate: -5 }} 
                  animate={{ scale: 1, rotate: 0 }} 
                  className="absolute bg-[#FFEAA7] text-amber-900 p-3 rounded-lg shadow-md font-medium w-40 z-30 cursor-text" 
                  style={{ left: note.x, top: note.y }}
                  onClick={(e) => e.stopPropagation()} // Prevent adding another note when clicking inside
                >
                  <textarea 
                    value={note.text} 
                    onChange={(e) => updateNote(note.id, e.target.value)}
                    placeholder="Escribe algo..."
                    className="bg-transparent border-none outline-none w-full h-16 resize-none text-sm placeholder-amber-900/50 leading-tight" 
                    autoFocus
                  />
                  {/* Decorative pin or fold */}
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-8 border-l-8 border-t-amber-200 border-l-transparent opacity-60"></div>
                </motion.div>
              ))}

              {/* Decorative Cursors mapping from Miro style */}
              <div className="absolute top-[20%] left-[45%] flex flex-col items-center animate-bounce z-20 pointer-events-none">
                <div className="bg-[#7C3AED] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Mae</div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#7C3AED] transform -translate-y-0.5"></div>
              </div>
              <div className="absolute bottom-[20%] right-[15%] flex flex-col items-center animate-pulse z-20 pointer-events-none" style={{ animationDuration: '3s' }}>
                <div className="bg-[#F59E0B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Matt</div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#F59E0B] transform -translate-y-0.5"></div>
              </div>

            </div>
          )}
        </div>
      </div>
    </section>
  );
}
