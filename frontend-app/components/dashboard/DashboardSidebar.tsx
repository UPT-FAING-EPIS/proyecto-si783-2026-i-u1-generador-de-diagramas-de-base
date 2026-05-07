'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Clock, Users, Trash2, History, LogOut, Settings } from 'lucide-react';
import { logoutAction } from '@/lib/backend/actions/auth/logout';
import { getInitials, getAvatarColor } from '@/lib/utils/avatar';

const NAV_ITEMS = [
  { icon: Home, label: 'Proyectos', href: '/dashboard' },
  { icon: Clock, label: 'Recientes', href: '/dashboard?section=recientes' },
  { icon: Users, label: 'Compartidos', href: '/dashboard?section=compartidos' },
  { icon: Trash2, label: 'Papelera', href: '/dashboard?section=papelera' },
  { icon: History, label: 'Historial', href: '/dashboard?section=historial' }
];

interface DashboardSidebarProps {
  userName: string
  userEmail?: string
  userAvatarUrl?: string | null
}

export function DashboardSidebar({ userName, userEmail, userAvatarUrl }: DashboardSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get('section');

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' && !currentSection;
    }
    const sectionMatch = href.match(/section=([^&]+)/);
    if (sectionMatch) {
      return currentSection === sectionMatch[1];
    }
    return false;
  };

  return (
    <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 h-screen sticky top-0"
      style={{ backgroundColor: '#0D1117', borderRight: '1px solid #1E2A45' }}>
      
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: '1px solid #1E2A45' }}>
        <div className="w-7 h-7 bg-[#1A6CF6] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">DB</span>
        </div>
        <span className="text-white font-semibold text-base">DBCanvas</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => (
          <Link key={label} href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: isActive(href) ? '#1E2A45' : 'transparent',
              color: isActive(href) ? '#FFFFFF' : '#6B7280',
            }}>
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Usuario en la parte inferior */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid #1E2A45' }}>
        <div className="flex items-center gap-2.5 mb-3 px-1">
          {userAvatarUrl ? (
            <Image
              src={userAvatarUrl}
              alt={userName}
              width={32}
              height={32}
              unoptimized
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              style={{ border: '2px solid #1E2A45' }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ backgroundColor: getAvatarColor(userName) }}>
              {getInitials(userName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm text-white font-medium truncate">{userName}</p>
            {userEmail && <p className="text-xs truncate" style={{ color: '#6B7280' }}>{userEmail}</p>}
          </div>
        </div>
        <Link
          href="/profile"
          className="flex items-center gap-2 text-xs w-full px-3 py-2 rounded-lg transition-colors hover:text-white mb-1"
          style={{ color: '#6B7280' }}
        >
          <Settings size={14} />
          Configuración
        </Link>
        <form action={logoutAction}>
          <button type="submit"
            className="flex items-center gap-2 text-xs w-full px-3 py-2 rounded-lg transition-colors hover:text-white"
            style={{ color: '#6B7280' }}>
            <LogOut size={14} />
            Salir
          </button>
        </form>
      </div>
    </aside>
  );
}
