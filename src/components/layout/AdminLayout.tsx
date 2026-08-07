import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Image, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

export const AdminLayout = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Pacientes', href: '/admin/pacientes', icon: Users },
    { name: 'Anamneses', href: '/admin/anamneses', icon: FileText },
    { name: 'Procedimentos', href: '/admin/procedimentos', icon: Image },
    { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-clinic-bg flex">
      {/* Sidebar */}
      <div className="w-64 bg-clinic-surface border-r border-clinic-border hidden md:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-clinic-border">
          <img src="/logo.png" alt="Logo" className="h-8 object-contain" />
          <span className="ml-3 font-serif text-clinic-gold font-medium">ClinicOS</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
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
        </nav>
        
        <div className="p-4 border-t border-clinic-border">
          <button
            onClick={signOut}
            className="group flex w-full items-center px-3 py-2 text-sm font-medium text-clinic-danger hover:bg-clinic-surfaceHover rounded-md transition-colors"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-clinic-danger" />
            Sair
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header placeholder */}
        <div className="md:hidden h-16 bg-clinic-surface border-b border-clinic-border flex items-center px-4">
          <span className="font-serif text-clinic-gold">ClinicOS</span>
        </div>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
