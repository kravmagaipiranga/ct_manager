import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { cn } from '../../lib/utils';
import { auth } from '../../lib/firebase';
import { updatePassword } from 'firebase/auth';
import {
  Home,
  Calendar,
  BookOpen,
  History,
  ShoppingCart,
  LogOut,
  User as UserIcon,
  Bell,
  CreditCard,
  Moon,
  Sun,
  X,
  MapPin,
  Lock,
  Briefcase
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Início', path: '/student/home', icon: Home },
  { label: 'Horários', path: '/student/schedule', icon: Calendar },
  { label: 'Currículo', path: '/student/curriculum', icon: BookOpen },
  { label: 'Finanças', path: '/student/financial', icon: CreditCard },
  { label: 'Histórico', path: '/student/history', icon: History },
  { label: 'Contato', path: '/student/contact', icon: MapPin },
  { label: 'Perfil', path: '/student/profile', icon: UserIcon },
];

function ForcePasswordChange({ onComplete }: { onComplete: () => void }) {
  const user = useAuthStore(state => state.user);
  const updateStudent = useDataStore(state => state.updateStudent);
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(pass !== confirm) return setErr("As senhas não coincidem.");
    if(pass.length < 6) return setErr("A senha deve ter pelo menos 6 caracteres.");
    
    setLoading(true);
    setErr('');
    try {
       if(auth.currentUser) {
          await updatePassword(auth.currentUser, pass);
       }
       if(user) {
          updateStudent(user.id, { password: pass, mustChangePassword: false });
          useAuthStore.getState().login({ ...user, password: pass, mustChangePassword: false });
       }
       onComplete();
    } catch(error) {
       setErr("Erro ao atualizar senha. Tente fazer login novamente.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-sm">
       <div className="bg-krav-card p-8 rounded-2xl w-full max-w-md shadow-2xl border border-krav-border">
          <div className="w-12 h-12 bg-krav-accent/20 rounded-full flex items-center justify-center mb-4 mx-auto text-krav-accent">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-center mb-2">Bem-vindo(a) ao Portal!</h2>
          <p className="text-sm text-krav-muted text-center mb-6">Como este é seu primeiro acesso com uma conta migrada, precisamos que você defina uma nova senha de segurança.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
             <div>
                <label className="text-xs font-bold uppercase tracking-wider text-krav-muted">Nova Senha</label>
                <input type="password" required value={pass} onChange={e=>setPass(e.target.value)} className="w-full mt-1 px-4 py-2 bg-krav-bg border border-krav-border rounded-lg text-krav-text" placeholder="Mínimo 6 caracteres" />
             </div>
             <div>
                <label className="text-xs font-bold uppercase tracking-wider text-krav-muted">Confirme a Nova Senha</label>
                <input type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full mt-1 px-4 py-2 bg-krav-bg border border-krav-border rounded-lg text-krav-text" />
             </div>
             {err && <p className="text-xs text-red-500 font-bold bg-red-500/10 p-2 rounded">{err}</p>}
             <button disabled={loading} type="submit" className="w-full py-3 bg-krav-accent hover:bg-krav-accent-light text-white font-bold rounded-lg transition-colors shadow-md mt-2 disabled:opacity-50">
               {loading ? "Salvando..." : "Atualizar Senha e Continuar"}
             </button>
          </form>
       </div>
    </div>
  );
}

export default function StudentLayout() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  
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
    navigate('/login');
  };

  const MOCK_NOTIFICATIONS = [
    { id: 1, title: 'Anúncio Novo', text: 'Seminário de Defesa Contra Faca aberto para inscrições!', time: '2h', read: false },
    { id: 2, title: 'Check-in Aprovado', text: 'Seu check-in na aula de 19:00 foi aprovado.', time: '1d', read: true },
    { id: 3, title: 'Mensalidade', text: 'Seu plano vence amanhã, verifique o financeiro.', time: '2d', read: true },
    { id: 4, title: 'Parabéns!', text: 'Feliz aniversário! Desejamos muitas felicidades e treino!', time: '3d', read: true },
  ];

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <main className="flex flex-col min-h-screen w-full bg-krav-bg text-krav-text font-sans relative md:h-screen transition-colors">
      
      {user?.mustChangePassword && (
         <ForcePasswordChange onComplete={() => {}} />
      )}

      {/* Top Header - Mobile friendly */}
      <header className="h-16 px-4 md:px-6 border-b border-krav-border flex items-center justify-between bg-krav-sidebar z-30 sticky top-0 transition-colors shadow-sm">
        <div className="flex items-center gap-3 md:hidden">
          <div className="w-8 h-8 flex-shrink-0 bg-krav-accent rounded flex items-center justify-center font-bold text-lg text-white shadow-sm overflow-hidden">
            <img src="https://yata-apix-c1ca31d6-cb5d-4e4c-94a2-7c6a7dc7c677.s3-object.locaweb.com.br/2eb38dd66b5b41d783090f2373d971f5.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
             <h1 className="font-bold text-sm leading-tight truncate">Olá, {user?.name.split(' ')[0]}</h1>
             <p className="text-[10px] text-krav-muted truncate">Faixa {user?.beltLevel}</p>
          </div>
        </div>

        {/* Desktop Brand */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-8 h-8 flex-shrink-0 bg-krav-accent rounded flex items-center justify-center font-bold text-lg text-white shadow-sm overflow-hidden">
            <img src="https://yata-apix-c1ca31d6-cb5d-4e4c-94a2-7c6a7dc7c677.s3-object.locaweb.com.br/2eb38dd66b5b41d783090f2373d971f5.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-wide">Área do Aluno</p>
            <p className="text-[10px] text-krav-muted mt-0.5 truncate">{user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3 relative" ref={notifRef}>
          <button 
            onClick={toggleTheme} 
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full text-krav-muted hover:text-krav-accent hover:bg-black/5 dark:hover:bg-krav-card/5 transition-colors"
          >
             {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full text-krav-muted hover:text-krav-text hover:bg-black/5 dark:hover:bg-krav-card/5 transition-colors relative"
          >
             <Bell className="w-4 h-4 md:w-5 md:h-5" />
             {unreadCount > 0 && (
               <span className="absolute top-1.5 md:top-2 right-1.5 md:right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-krav-sidebar" />
             )}
          </button>

          {(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') && (
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-8 h-8 flex md:hidden items-center justify-center rounded-full text-krav-muted hover:text-krav-text hover:bg-black/5 dark:hover:bg-krav-card/5 transition-colors bg-krav-card border border-krav-border ml-1"
            >
              <Briefcase className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-8 h-8 flex md:hidden items-center justify-center rounded-full text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors bg-red-500/5 ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-12 right-0 w-72 md:w-80 bg-krav-card border border-krav-border rounded-xl shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in">
              <div className="p-3 text-sm font-bold border-b border-krav-border flex items-center justify-between bg-black/5 dark:bg-krav-card/5">
                <span>Notificações</span>
                <span className="text-[10px] bg-krav-accent text-white px-2 py-0.5 rounded-full">{unreadCount} novas</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
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
      </header>

      <div className="flex-1 flex flex-col md:flex-row relative min-h-0 overflow-hidden">
        {/* Sidebar for Desktop ONLY */}
        <aside className="w-[240px] bg-krav-sidebar border-r border-krav-border hidden md:flex flex-col py-6 shrink-0 transition-colors z-20 overflow-y-auto">
          <nav className="flex-1 flex flex-col gap-1 px-3">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'px-4 py-3 flex items-center gap-3 text-sm font-bold transition-all duration-200 rounded-lg',
                    isActive
                      ? 'bg-krav-accent text-white shadow-md shadow-krav-accent/20'
                      : 'text-krav-muted hover:text-krav-text hover:bg-black/5 dark:hover:bg-krav-card/5 border border-transparent'
                  )
                }
              >
                <item.icon className={cn("w-4 h-4", "flex-shrink-0")} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="px-5 mt-8 pt-6 border-t border-krav-border flex flex-col gap-2">
            {user?.role === 'INSTRUCTOR' && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-3 text-sm font-bold text-krav-muted hover:text-krav-text transition-colors w-full p-2 rounded-lg hover:bg-black/5 dark:hover:bg-krav-card/5"
              >
                <Briefcase className="w-4 h-4" />
                Painel do Instrutor
              </button>
            )}
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-3 text-sm font-bold text-krav-muted hover:text-krav-text transition-colors w-full p-2 rounded-lg hover:bg-black/5 dark:hover:bg-krav-card/5"
              >
                <Briefcase className="w-4 h-4" />
                Painel do Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-sm font-bold text-krav-muted hover:text-red-500 transition-colors w-full p-2 rounded-lg hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              Sair do Sistema
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-krav-bg relative min-w-0 pb-20 md:pb-6">
          <Outlet />
        </div>
      </div>

      {/* Bottom Navigation - Mobile ONLY */}
      <nav className="h-16 bg-krav-sidebar border-t border-krav-border flex items-center justify-between px-1 fixed bottom-0 w-full md:hidden z-40 pb-safe">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all duration-200',
                isActive 
                  ? 'text-krav-accent scale-110 -translate-y-1' 
                  : 'text-krav-muted hover:text-krav-text'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-[9px] font-bold tracking-tight truncate w-full text-center px-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </main>
  );
}

