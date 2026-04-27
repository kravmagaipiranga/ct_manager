import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Shield } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function AdminLogin() {
  const login = useAuthStore((state) => state.login);
  const academiesSettings = useDataStore((state) => state.academiesSettings);
  const students = useDataStore((state) => state.students);
  const settings = academiesSettings[0]; 
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Wait for data to load from Firebase since we are now authenticated
      const { loadFromFirebase } = await import('../../store/syncFirebase');
      await loadFromFirebase();

      const updatedStudents = useDataStore.getState().students;
      const dbUser = updatedStudents.find(s => s.email.toLowerCase() === email.toLowerCase());

      if (dbUser && (dbUser.role === 'ADMIN' || dbUser.role === 'INSTRUCTOR')) {
         login(dbUser);
         navigate('/admin/dashboard');
      } else {
         setError('Conta autenticada, mas sem permissões de equipe.');
      }
    } catch (err: any) {
      // Fallback para migração local se no Firebase não existir
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message.includes('auth/invalid-login-credentials')) {
         const localUser = students.find(s => s.email.toLowerCase() === email.toLowerCase() && (s.password === password || (!s.password && password === '123456')));
         if (localUser && (localUser.role === 'ADMIN' || localUser.role === 'INSTRUCTOR')) {
            try {
               await createUserWithEmailAndPassword(auth, email, password);
               const { loadFromFirebase } = await import('../../store/syncFirebase');
               await loadFromFirebase();
               login(localUser);
               navigate('/admin/dashboard');
            } catch (err2: any) {
               if (err2.code === 'auth/email-already-in-use') {
                  setError('Esta conta já foi migrada para a nuvem. Digite a senha correta (ou a nova senha criada).');
               } else {
                  setError('Usuário local encontrado, mas erro ao registrar no servidor cloud.');
               }
            }
         } else {
            setError('Credenciais inválidas.');
         }
      } else {
         setError('Erro de comunicação com o servidor.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-6">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 justify-center">
          {settings.logoUrl ? (
            <div className="w-12 h-12 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center p-1">
              <img src={settings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-krav-accent text-white rounded-lg flex items-center justify-center font-bold text-2xl shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white">{settings.systemName}</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">{settings.academyName}</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 justify-center text-zinc-300 border-b border-zinc-800 pb-4 uppercase tracking-widest text-[10px]">
          Acesso Restrito Administrativo
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Email Administrativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg focus:border-krav-accent outline-none text-sm text-zinc-200"
                placeholder="admin@kravmaga.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg focus:border-krav-accent outline-none text-sm text-zinc-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-medium bg-red-950/20 p-3 rounded-lg border border-red-900/50 italic">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-3 bg-krav-card text-black font-black rounded-lg hover:bg-zinc-200 transition-all shadow-md active:scale-[0.98] mt-2 uppercase tracking-widest text-xs"
          >
            AUTENTICAR
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
             <Link to="/login" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                Voltar para Login de Alunos
             </Link>
        </div>
      </div>
    </div>
  );
}
