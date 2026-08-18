import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Image, Settings, LogOut, Menu, X, Calendar, ClipboardList, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

export const AdminLayout = () => {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/painel', icon: LayoutDashboard, roles: ['admin', 'staff'] },
    { name: 'Solicitações', href: '/painel/solicitacoes', icon: ClipboardList, roles: ['admin', 'staff'] },
    { name: 'Agenda', href: '/painel/agenda', icon: Calendar, roles: ['admin', 'staff'] },
    { name: 'Pacientes', href: '/painel/pacientes', icon: Users, roles: ['admin', 'staff'] },
    { name: 'Procedimentos', href: '/painel/procedimentos', icon: Settings, roles: ['admin', 'staff'] },
  ];

  const filteredNavigation = navigation.filter(item => profile && item.roles.includes(profile.role));

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const NavLinks = () => (
    <>
      {filteredNavigation.map((item) => {
        const isActive = location.pathname === item.href || (location.pathname !== '/painel' && item.href !== '/painel' && location.pathname.startsWith(item.href));
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={closeMobileMenu}
            className={cn(
              isActive ? 'bg-clinic-surfaceHover text-clinic-gold' : 'text-clinic-textSecondary hover:bg-clinic-surfaceHover hover:text-clinic-textPrimary',
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
            )}
          >
            <item.icon className={cn('mr-3 flex-shrink-0 h-5 w-5', isActive ? 'text-clinic-gold' : 'text-clinic-textSecondary')} />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-clinic-bg flex">
      {/* Desktop Sidebar */}
      <div className="w-64 bg-clinic-surface border-r border-clinic-border hidden md:flex flex-col fixed inset-y-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-clinic-border bg-clinic-surface shrink-0">
          <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
          <span className="ml-3 font-serif text-clinic-gold font-medium">ClinicOS</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        
        <div className="p-4 border-t border-clinic-border bg-clinic-surface shrink-0">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-clinic-textPrimary truncate">{profile?.full_name}</p>
            <p className="text-xs text-clinic-textSecondary uppercase tracking-wider">{profile?.role}</p>
          </div>
          <button
            onClick={signOut}
            className="group flex w-full items-center px-3 py-2 text-sm font-medium text-clinic-danger hover:bg-clinic-danger/10 rounded-md transition-colors"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5" />
            Sair
          </button>
        </div>
      </div>

      {/* Mobile Offcanvas overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={closeMobileMenu} />
          
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-clinic-surface shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-clinic-border">
              <div className="flex items-center">
                <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
                <span className="ml-3 font-serif text-clinic-gold font-medium">ClinicOS</span>
              </div>
              <button
                type="button"
                className="text-clinic-textSecondary hover:text-clinic-textPrimary"
                onClick={closeMobileMenu}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <NavLinks />
            </nav>

            <div className="p-4 border-t border-clinic-border bg-clinic-surface shrink-0">
              <div className="px-3 py-2 mb-2">
                <p className="text-sm font-medium text-clinic-textPrimary truncate">{profile?.full_name}</p>
                <p className="text-xs text-clinic-textSecondary uppercase tracking-wider">{profile?.role}</p>
              </div>
              <button
                onClick={() => { closeMobileMenu(); signOut(); }}
                className="group flex w-full items-center px-3 py-2 text-sm font-medium text-clinic-danger hover:bg-clinic-danger/10 rounded-md transition-colors"
              >
                <LogOut className="mr-3 flex-shrink-0 h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content wrapper (margin left on desktop to accommodate fixed sidebar) */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-10 h-16 bg-clinic-surface border-b border-clinic-border flex items-center justify-between px-4 shrink-0 shadow-sm">
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-8 object-contain" />
            <span className="ml-3 font-serif text-clinic-gold font-medium">ClinicOS</span>
          </div>
          <button
            type="button"
            className="text-clinic-textSecondary hover:text-clinic-textPrimary p-2 -mr-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
