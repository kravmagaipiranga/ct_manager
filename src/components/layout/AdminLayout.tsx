import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  DollarSign,
  ShoppingCart,
  CalendarDays,
  Settings,
  LogOut,
  BookOpen,
  Menu,
  X,
  Briefcase,
  BarChart3,
  Moon,
  Sun,
  Bell
} from 'lucide-react';

const ALL_NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Gestão de Alunos', path: '/admin/students', icon: Users },
  { label: 'Gestão de Instrutores', path: '/admin/instructors', icon: Briefcase },
  { label: 'Fila de Check-ins', path: '/admin/checkins', icon: CheckSquare },
  { label: 'Grade de Horários', path: '/admin/schedule', icon: Calendar },
  { label: 'Exames de Faixa', path: '/admin/exams', icon: CalendarDays },
  { label: 'Eventos Gerais', path: '/admin/events', icon: CalendarDays },
  { label: 'Agendamentos', path: '/admin/appointments', icon: Briefcase },
  { label: 'Relatórios', path: '/admin/reports', icon: BarChart3 },
  { label: 'Financeiro', path: '/admin/financial', icon: DollarSign },
  { label: 'Loja / Pedidos', path: '/admin/store', icon: ShoppingCart },
  { label: 'Curriculum', path: '/admin/curriculum', icon: BookOpen },
  { label: 'Configurações', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const academiesSettings = useDataStore((state) => state.academiesSettings);
  const settings = academiesSettings.find(s => s.id === user?.academyId) || academiesSettings[0];
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newState = !prev;
      if (newState) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newState;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = user?.role === 'INSTRUCTOR' 
    ? ALL_NAV_ITEMS.filter(i => !['Financeiro', 'Curriculum', 'Configurações'].includes(i.label))
    : ALL_NAV_ITEMS;

  const MOCK_NOTIFICATIONS = [
    { id: 1, title: 'Alerta Financeiro', text: '7 alunos em atraso neste mês.', time: '10m', read: false },
    { id: 2, title: 'Check-in Pendente', text: '5 alunos aguardando aprovação na aula de 19:00.', time: '1h', read: false },
  ];

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <main className="flex flex-col h-screen w-full bg-krav-bg text-krav-text font-sans relative overflow-hidden transition-colors">
      {/* Top Application Bar */}
      <header className="h-16 px-4 sm:px-6 border-b border-krav-border flex justify-between items-center bg-krav-sidebar z-30 shrink-0 shadow-sm transition-colors">
        {/* Left: Logo & Context */}
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            <div className="w-8 h-8 sm:w-10 sm:h-10 border border-krav-border rounded overflow-hidden bg-krav-card flex items-center justify-center p-0.5 shadow-sm">
              <img src={settings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-krav-accent text-white rounded flex items-center justify-center font-bold text-lg sm:text-xl shadow-sm">
              {settings.systemName.charAt(0)}
            </div>
          )}
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm sm:text-base tracking-wide text-krav-text leading-tight">{settings.systemName}</h1>
            <p className="text-[10px] sm:text-xs text-krav-muted uppercase tracking-widest">{settings.academyName}</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-3 text-sm mr-2">
            <span className="text-krav-muted">
              Olá, <strong className="text-krav-text font-medium">{user?.name}</strong>
            </span>
            <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-krav-card/5 flex items-center justify-center text-xs font-bold text-krav-text border border-krav-border">
              {user?.name.charAt(0)}
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2 mr-2" ref={notifRef}>
            <button 
              onClick={toggleTheme} 
              className="w-10 h-10 flex items-center justify-center rounded-full text-krav-muted hover:text-krav-accent hover:bg-black/5 dark:hover:bg-krav-card/5 transition-colors"
            >
               {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 flex items-center justify-center rounded-full text-krav-muted hover:text-krav-text hover:bg-black/5 dark:hover:bg-krav-card/5 transition-colors relative"
            >
               <Bell className="w-5 h-5" />
               {unreadCount > 0 && (
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-krav-sidebar" />
               )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-12 right-0 w-72 md:w-80 bg-krav-card border border-krav-border rounded-xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in">
                <div className="p-3 text-sm font-bold border-b border-krav-border flex items-center justify-between bg-black/5 dark:bg-krav-card/5">
                  <span>Notificações Sistema</span>
                  <span className="text-[10px] bg-krav-accent text-white px-2 py-0.5 rounded-full">{unreadCount} novas</span>
                </div>
                <div className="max-h-80 overflow-y-auto w-full">
                  {MOCK_NOTIFICATIONS.map((notif) => (
                    <div key={notif.id} className={cn("p-4 border-b border-krav-border last:border-0 flex flex-col gap-1 hover:bg-black/5 dark:hover:bg-krav-card/5 transition-colors cursor-pointer", !notif.read && "bg-blue-500/5 dark:bg-blue-500/10")}>
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-bold", !notif.read ? "text-krav-text" : "text-krav-muted")}>{notif.title}</span>
                        <span className="text-[10px] text-krav-muted">{notif.time}</span>
                      </div>
                      <p className="text-xs text-krav-muted leading-relaxed">{notif.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 sm:p-2.5 bg-krav-accent hover:bg-krav-accent-light rounded-lg text-white transition-colors shadow-sm md:hidden"
            title="Menu Principal"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Desktop */}
        <aside className="w-64 bg-krav-sidebar border-r border-krav-border flex-col py-6 shrink-0 transition-colors hidden md:flex overflow-y-auto">
          <nav className="flex-1 px-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-bold transition-all duration-200',
                    isActive
                      ? 'bg-krav-accent text-white shadow-md shadow-krav-accent/20'
                      : 'text-krav-muted hover:text-krav-text hover:bg-black/5 dark:hover:bg-krav-card/5 border border-transparent'
                  )
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="px-5 mt-6 pt-6 border-t border-krav-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-sm font-bold text-krav-muted hover:text-red-500 transition-colors w-full p-2 rounded-lg hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              Sair do Sistema
            </button>
          </div>
        </aside>

        {/* Fullscreen Overlay Menu Mobile */}
        {isMenuOpen && (
          <div className="absolute inset-0 z-20 flex flex-col bg-krav-bg/95 backdrop-blur-md animate-in fade-in duration-200 md:hidden overflow-y-auto text-krav-text pb-20">
            <nav className="flex-1 px-4 py-6 sm:p-8 flex flex-col gap-2 max-w-3xl mx-auto w-full">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'px-6 py-4 rounded-xl flex items-center gap-4 text-sm sm:text-base font-bold transition-all duration-200',
                      isActive
                        ? 'bg-krav-accent text-white shadow-md shadow-krav-accent/20'
                        : 'text-krav-muted hover:text-krav-text hover:bg-krav-sidebar border border-transparent'
                    )
                  }
                >
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-8 pt-8 border-t border-krav-border px-6">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 text-sm sm:text-base font-bold text-krav-muted hover:text-red-500 transition-colors w-full"
                >
                  <LogOut className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                  Sair do Sistema
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Scrollable Page Content */}
        <div className="flex-1 w-full bg-krav-bg relative z-0 overflow-y-auto pb-safe">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
