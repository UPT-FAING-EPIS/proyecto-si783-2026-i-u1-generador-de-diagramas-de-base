import Link from 'next/link';
import { Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#1E2A45] bg-[#0B1120] py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Database className="w-6 h-6 text-[#1A6CF6]" />
            <span className="text-xl font-bold text-white tracking-tight">DBCanvas</span>
          </Link>
          <p className="text-slate-400 text-sm">
            La forma más rápida de diseñar bases de datos en equipo.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Producto</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="#caracteristicas" className="hover:text-white transition-colors">Características</Link></li>
            <li><Link href="#precios" className="hover:text-white transition-colors">Precios</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Recursos</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="#docs" className="hover:text-white transition-colors">Documentación</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Empresa</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="#" className="hover:text-white transition-colors">Acerca de</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Términos</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#1E2A45] flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
        <p>© 2026 DBCanvas — Universidad Privada de Tacna. Todos los derechos reservados.</p>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Link href="https://github.com" className="hover:text-white transition-colors">
            <span className="sr-only">GitHub</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}
