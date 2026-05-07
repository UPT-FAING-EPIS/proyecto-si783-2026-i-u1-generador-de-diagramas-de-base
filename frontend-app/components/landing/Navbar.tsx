import Link from 'next/link';
import { Database } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0B1120]/80 backdrop-blur-md border-b border-[#1E2A45]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Database className="w-6 h-6 text-[#1A6CF6]" />
          <span className="text-xl font-bold text-white tracking-tight">FluxSQL</span>
        </Link>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#producto" className="text-slate-400 hover:text-white transition-colors">Producto</Link>
          <Link href="#caracteristicas" className="text-slate-400 hover:text-white transition-colors">Características</Link>
          <Link href="#precios" className="text-slate-400 hover:text-white transition-colors">Precios</Link>
          <Link href="#docs" className="text-slate-400 hover:text-white transition-colors">Docs</Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="hidden md:block text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link 
            href="/register" 
            className="bg-[#1A6CF6] hover:bg-[#1557d4] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Empezar gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}
