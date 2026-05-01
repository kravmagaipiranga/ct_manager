import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function StudentLogin() {
  const { academyId } = useParams();
  const login = useAuthStore((state) => state.login);
  const academiesSettings = useDataStore((state) => state.academiesSettings);
  const students = useDataStore((state) => state.students);
  
  const settings = academiesSettings.find(s => s.id === academyId) || academiesSettings[0]; 
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const regLink = academyId ? `/matricula/${academyId}` : '/matricula';

  const handleResetPassword = async () => {
     if (!email) {
        setError('Digite seu e-mail acima para redefinir a senha.');
        return;
     }
     try {
       const { sendPasswordResetEmail } = await import('firebase/auth');
       await sendPasswordResetEmail(auth, email);
       setResetSent(true);
       setError('');
     } catch (err: any) {
       setError('Erro ao enviar e-mail de redefinição: ' + err.message);
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const safePassword = password.length < 6 ? password.padEnd(6, '0') : password;

    try {
      await signInWithEmailAndPassword(auth, email, safePassword);
      const { loadFromFirebase } = await import('../../store/syncFirebase');
      await loadFromFirebase();

      const updatedStudents = useDataStore.getState().students;
      const dbUser = updatedStudents.find(s => s.email.toLowerCase() === email.toLowerCase());

      if (dbUser && dbUser.role === 'STUDENT') {
         if (dbUser.enrollmentStatus === 'PENDING') {
           setError('Sua matrícula está em análise. Aguarde a aprovação da academia!');
           await auth.signOut();
           return;
         }
         if (dbUser.enrollmentStatus === 'SUSPENDED') {
           setError('Sua conta está suspensa. Entre em contato com a secretaria.');
           await auth.signOut();
           return;
         }
         login({ ...dbUser, mustChangePassword: password.length < 6 ? true : dbUser.mustChangePassword });
         navigate('/student/home');
      } else {
         setError('Conta autenticada, mas sem permissões de aluno.');
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message.includes('auth/invalid-login-credentials')) {
         const localUser = students.find(s => s.email.toLowerCase() === email.toLowerCase() && (s.password === password || (!s.password && password === '123456')));
         if (localUser && localUser.role === 'STUDENT') {
            if (localUser.enrollmentStatus === 'PENDING') {
              setError('Sua matrícula está em análise. Aguarde a aprovação da academia!');
              return;
            }
            if (localUser.enrollmentStatus === 'SUSPENDED') {
              setError('Sua conta está suspensa. Entre em contato com a secretaria.');
              return;
            }
            try {
               await createUserWithEmailAndPassword(auth, email, safePassword);
               const { loadFromFirebase } = await import('../../store/syncFirebase');
               await loadFromFirebase();
               login({ ...localUser, mustChangePassword: true });
               navigate('/student/home');
            } catch (err2: any) {
               if (err2.code === 'auth/email-already-in-use') {
                  setError('Esta conta já foi migrada para a nuvem. Digite a senha correta atualizada.');
               } else {
                  setError('Verifique seu e-mail e senha. Erro ao autenticar no servidor seguro: ' + err2.message);
               }
            }
         } else {
            setError('Credenciais inválidas ou aluno não encontrado.');
         }
      } else {
         setError('Erro ao se comunicar com o servidor.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-krav-bg text-krav-text p-6">
      <div className="w-full max-w-md bg-krav-card border border-krav-border rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8 justify-center flex-col text-center">
          {settings.logoUrl ? (
            <div className="max-w-[120px] mx-auto mb-2">
              <img src={settings.logoUrl} alt="Logo" className="w-full h-auto object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-krav-accent text-white rounded-2xl flex items-center justify-center font-bold text-4xl shadow-md">
              {settings.systemName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="font-bold text-2xl tracking-tight text-krav-text">{settings.systemName}</h1>
            <p className="text-xs text-krav-muted uppercase tracking-widest mt-1">{settings.academyName}</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 justify-center">
          Portal do Aluno 
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-krav-muted uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-krav-muted" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-krav-bg border border-krav-border rounded-lg focus:border-krav-accent outline-none text-sm"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-krav-muted uppercase tracking-wider mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-krav-muted" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-krav-bg border border-krav-border rounded-lg focus:border-krav-accent outline-none text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100 italic">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-3 bg-krav-accent text-white font-bold rounded-lg hover:bg-krav-accent-light transition-all shadow-md active:scale-[0.98] mt-2"
          >
            ENTRAR NO PORTAL
          </button>
        </form>

        <div className="mt-4 text-center">
          {resetSent ? (
             <p className="text-sm text-green-500 font-bold">✓ E-mail de redefinição enviado!</p>
          ) : (
             <button type="button" onClick={handleResetPassword} className="text-sm text-krav-muted hover:text-krav-text transition-colors">
                Esqueceu a senha?
             </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-krav-border text-center flex flex-col gap-3">
             <Link to={regLink} className="text-sm font-bold text-krav-accent hover:underline">
                Ainda não é aluno? Matricule-se aqui
             </Link>
             <Link to="/admin/login" className="text-xs text-krav-muted hover:text-krav-accent transition-colors">
                Sou administrador / instrutor
             </Link>
        </div>
      </div>
    </div>
  );
}
