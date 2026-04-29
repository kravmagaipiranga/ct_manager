import React, { useMemo, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { BeltBadge } from '../../components/shared/BeltBadge';
import { CheckSquare, Check, X, Users, Clock, Plus, Target, UserPlus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Belt } from '../../types';
import BirthdayWidget from '../../components/widgets/BirthdayWidget';

export default function InstructorDashboard() {
  const user = useAuthStore((state) => state.user);
  const classes = useDataStore((state) => state.classes);
  const students = useDataStore((state) => state.students);
  const checkins = useDataStore((state) => state.checkins);
  const approveCheckin = useDataStore((state) => state.approveCheckin);
  const rejectCheckin = useDataStore((state) => state.rejectCheckin);

  const addVisit = useDataStore((state) => state.addVisit);

  const [visitModal, setVisitModal] = useState<'TRIAL' | 'VISIT' | null>(null);
  const [visitForm, setVisitForm] = useState({ name: '', phone: '' });
  const [filterMonth, setFilterMonth] = useState('CURRENT');
  const allVisits = useDataStore((state) => state.visits);

  if (!user) return null;

  const instructorVisits = useMemo(() => {
    let filtered = allVisits.filter(v => v.instructorId === user.id);
    const now = new Date();
    if (filterMonth === 'CURRENT') {
      filtered = filtered.filter(v => new Date(v.date).getMonth() === now.getMonth() && new Date(v.date).getFullYear() === now.getFullYear());
    } else if (filterMonth === 'LAST') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      filtered = filtered.filter(v => new Date(v.date).getMonth() === lastMonth.getMonth() && new Date(v.date).getFullYear() === lastMonth.getFullYear());
    }
    return filtered.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allVisits, user.id, filterMonth]);

  // Find active students of same academy
  const myStudents = useMemo(() => 
    students.filter(s => s.academyId === user.academyId && s.role === 'STUDENT' && s.enrollmentStatus === 'ACTIVE'), 
  [students, user.academyId]);

  // Students by belt
  const studentsByBelt = useMemo(() => {
    const counts: Record<Belt, number> = {
      WHITE: 0, YELLOW: 0, ORANGE: 0, GREEN: 0, BLUE: 0, BROWN: 0, BLACK: 0
    };
    myStudents.forEach(s => {
      if (s.beltLevel) counts[s.beltLevel]++;
    });
    return counts;
  }, [myStudents]);

  // Students with most absences
  const studentsWithAbsences = useMemo(() => {
    const now = new Date();
    return myStudents.map(student => {
      const studentCheckins = checkins.filter(c => c.studentId === student.id && c.status === 'APPROVED');
      let lastCheckinTime = new Date(student.createdAt).getTime();
      if (studentCheckins.length > 0) {
        lastCheckinTime = Math.max(...studentCheckins.map(c => new Date(c.timestamp).getTime()));
      }
      const daysSince = Math.floor((now.getTime() - lastCheckinTime) / (1000 * 3600 * 24));
      return { ...student, daysSince };
    }).sort((a, b) => b.daysSince - a.daysSince).slice(0, 5); // top 5 most absent
  }, [myStudents, checkins]);

  // Students ready for exam
  const studentsReadyForExam = useMemo(() => {
    const now = new Date();
    return myStudents.filter(student => {
      if (!student.beltLevel) return false;
      const refDate = new Date(student.lastExamDate || student.createdAt);
      const monthsSince = (now.getFullYear() - refDate.getFullYear()) * 12 + now.getMonth() - refDate.getMonth();
      
      switch (student.beltLevel) {
        case 'WHITE': return monthsSince >= 4;
        case 'YELLOW': return monthsSince >= 16; // 1 year and 4 months
        case 'ORANGE': return monthsSince >= 20; // 1 year and 8 months
        case 'GREEN': return monthsSince >= 24; // 2 years
        case 'BLUE': return monthsSince >= 24;
        case 'BROWN': return monthsSince >= 36; // 3 years
        case 'BLACK': return false; // Handled differently typically
        default: return false;
      }
    });
  }, [myStudents]);

  // Find academy classes for today
  const todayClasses = classes.filter(
    c => c.academyId === user.academyId && c.dayOfWeek === new Date().getDay()
  );

  // Find pending checkins for these classes (checkins only for this academy)
  const pendingCheckins = checkins
    .filter(chk => chk.status === 'PENDING' && todayClasses.some(c => c.id === chk.classId))
    .map(chk => {
      const student = students.find(s => s.id === chk.studentId && s.academyId === user.academyId);
      const session = classes.find(c => c.id === chk.classId);
      return { ...chk, student, session };
    })
    .filter(chk => chk.student && chk.session);

  const handleApproveAll = () => {
    if (window.confirm(`Tem certeza que deseja aprovar os ${pendingCheckins.length} check-ins pendentes?`)) {
      pendingCheckins.forEach(c => approveCheckin(c.id));
    }
  };

  const handleAddVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitModal) return;
    addVisit({
      type: visitModal,
      academyId: user?.academyId || '',
      studentName: visitForm.name,
      phone: visitForm.phone,
      date: new Date().toISOString(),
      instructorId: user.id
    });
    setVisitModal(null);
    setVisitForm({ name: '', phone: '' });
  };

  return (
    <div className="p-6 md:p-8 flex flex-col bg-krav-bg/50 flex-1">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Painel do Instrutor</h1>
          <p className="text-sm text-krav-muted mt-1">Visão geral dos seus alunos, aulas e registros.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setVisitModal('TRIAL')}
            className="flex-1 sm:flex-none bg-krav-accent text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-krav-accent-light transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Aula Exp.
          </button>
          <button 
             onClick={() => setVisitModal('VISIT')}
            className="flex-1 sm:flex-none bg-krav-card text-krav-text border border-krav-border px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black/5 transition-colors shadow-sm"
          >
            <Users className="w-4 h-4" /> Visita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-krav-card p-5 rounded-2xl border border-krav-border shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center text-center h-full">
           <div className="w-10 h-10 rounded-full bg-krav-accent/10 flex items-center justify-center mb-2">
             <Users className="w-5 h-5 text-krav-accent" />
           </div>
           <p className="text-3xl font-black text-krav-text">{myStudents.length}</p>
           <p className="text-xs text-krav-muted uppercase font-bold tracking-wider mt-1">Alunos Ativos</p>
        </div>
        <div className="bg-krav-card p-5 rounded-2xl border border-krav-border shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center text-center h-full">
           <div className="w-10 h-10 rounded-full bg-krav-success/10 flex items-center justify-center mb-2">
             <Target className="w-5 h-5 text-krav-success" />
           </div>
           <p className="text-3xl font-black text-krav-text">{studentsReadyForExam.length}</p>
           <p className="text-xs text-krav-muted uppercase font-bold tracking-wider mt-1">Prontos p/ Exame</p>
        </div>
        <div className="md:col-span-2 bg-krav-card p-5 rounded-2xl border border-krav-border shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          <p className="text-xs text-krav-muted uppercase font-bold tracking-wider mb-3">Divisão por Faixa</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(studentsByBelt).map(([belt, count]) => (count as number) > 0 && (
              <div key={belt} className="flex items-center gap-1.5 bg-krav-bg border border-krav-border px-2 py-1 rounded w-fit">
                <BeltBadge belt={belt as Belt} />
                <span className="text-sm font-bold ml-1">{count}</span>
              </div>
            ))}
            {myStudents.length === 0 && <p className="text-sm text-krav-muted">Sem alunos ativos</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Avaliação e Alertas */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          <BirthdayWidget />

          <div className="bg-krav-card border text-krav-text border-krav-border rounded-xl p-5 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
               <AlertTriangle className="w-4 h-4 text-krav-warning" />
               <h3 className="text-sm font-bold uppercase tracking-wider">Atenção Crítica (Faltas)</h3>
             </div>
             {studentsWithAbsences.length === 0 ? (
               <p className="text-sm text-krav-muted">Nenhum aluno com faltas excessivas.</p>
             ) : (
               <div className="space-y-3">
                 {studentsWithAbsences.map(student => (
                   <div key={student.id} className="flex justify-between items-center bg-krav-card border border-krav-border p-3 rounded-lg shadow-sm">
                     <div>
                       <p className="font-bold text-sm text-krav-text">{student.name}</p>
                       <p className="text-xs text-krav-danger font-medium mt-0.5">{student.daysSince} dias sem treinar</p>
                     </div>
                     <BeltBadge belt={student.beltLevel} />
                   </div>
                 ))}
               </div>
             )}
          </div>

          <div className="bg-krav-card border text-krav-text border-krav-border rounded-xl p-5 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
               <Target className="w-4 h-4 text-krav-success" />
               <h3 className="text-sm font-bold uppercase tracking-wider">Habilitados para Exame</h3>
             </div>
             {studentsReadyForExam.length === 0 ? (
               <p className="text-sm text-krav-muted">Nenhum aluno atingiu o tempo mínimo.</p>
             ) : (
               <div className="space-y-3">
                 {studentsReadyForExam.map(student => (
                   <div key={student.id} className="flex justify-between items-center bg-krav-card border border-krav-border p-3 rounded-lg shadow-sm">
                     <p className="font-bold text-sm text-krav-text">{student.name}</p>
                     <BeltBadge belt={student.beltLevel} />
                   </div>
                 ))}
               </div>
             )}
          </div>

        </div>

        {/* Check-ins e Aulas (Right Side) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Aulas Hoje */}
          <div className="bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm shrink-0">
             <h3 className="text-sm font-semibold uppercase tracking-wide border-b border-krav-border pb-3 mb-3">
               Minhas Turmas (Hoje)
             </h3>
             {todayClasses.length === 0 ? (
               <p className="text-sm text-krav-muted py-2">Sem aulas programadas para hoje.</p>
             ) : (
               <div className="flex gap-3 overflow-x-auto pb-2">
                 {todayClasses.map(session => (
                   <div key={session.id} className="flex-none w-48 flex justify-between items-start bg-krav-bg p-3 rounded-lg border border-krav-border">
                     <div>
                       <p className="font-bold text-krav-text text-sm">{session.name}</p>
                       <p className="text-xs text-krav-muted flex items-center gap-1 mt-1">
                         <Clock className="w-3 h-3" /> {session.time} ({session.durationMinutes}m)
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

          <div className="bg-krav-card border border-krav-border rounded-xl flex-col shadow-sm">
            <div className="p-5 border-b border-krav-border flex items-center justify-between gap-3 shrink-0 bg-krav-bg/50">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-krav-warning/10 flex items-center justify-center">
                   <CheckSquare className="w-4 h-4 text-krav-warning" />
                 </div>
                 <div>
                    <h2 className="text-sm font-bold text-krav-text">Fila de Liberação (Catraca)</h2>
                    <p className="text-[11px] text-krav-muted">Check-ins pendentes ({pendingCheckins.length})</p>
                 </div>
               </div>
               {pendingCheckins.length > 0 && (
                 <button
                   onClick={handleApproveAll}
                   className="hidden sm:flex text-xs items-center gap-1.5 font-bold text-krav-success bg-krav-success/10 hover:bg-krav-success/20 px-3 py-1.5 rounded-lg transition-colors border border-krav-success/20"
                 >
                   <CheckCircle2 className="w-3.5 h-3.5" />
                   Aprovar Todos
                 </button>
               )}
            </div>

            <div className="p-0">
               {pendingCheckins.length > 0 && (
                 <div className="sm:hidden p-4 border-b border-krav-border bg-krav-bg flex justify-end">
                   <button
                     onClick={handleApproveAll}
                     className="w-full flex text-sm items-center justify-center gap-1.5 font-bold text-krav-success bg-krav-success/10 hover:bg-krav-success/20 px-3 py-2.5 rounded-lg transition-colors border border-krav-success/20"
                   >
                     <CheckCircle2 className="w-4 h-4" />
                     Aprovar Todos
                   </button>
                 </div>
               )}
               {pendingCheckins.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                   <div className="w-12 h-12 bg-krav-bg border border-krav-border rounded-full flex items-center justify-center mb-3">
                     <CheckSquare className="w-5 h-5 text-krav-border" />
                   </div>
                   <p className="text-krav-muted font-medium text-sm">Nenhum check-in pendente.</p>
                   <p className="text-xs text-krav-muted mt-1">Alunos da sua aula aparecerão aqui.</p>
                 </div>
               ) : (
                 <ul className="divide-y divide-krav-border">
                   {pendingCheckins.map(({ id, student, session }) => (
                     <li key={id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-black/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-krav-border flex items-center justify-center font-bold text-krav-muted shrink-0 text-sm">
                            {student?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-krav-text text-sm">{student?.name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <BeltBadge belt={student?.beltLevel} />
                              <span className="text-[10px] text-krav-muted bg-krav-bg border border-krav-border px-1.5 py-0.5 rounded">
                                {session?.time}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button 
                            onClick={() => rejectCheckin(id)}
                            className="w-8 h-8 rounded-full border border-krav-border flex items-center justify-center text-krav-muted hover:text-krav-danger hover:border-krav-danger transition-colors bg-krav-card shadow-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => approveCheckin(id)}
                            className="bg-krav-accent hover:bg-krav-accent-light text-white px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            Liberar
                          </button>
                        </div>
                     </li>
                   ))}
                 </ul>
               )}
            </div>
          </div>
          
          <div className="bg-krav-card border text-krav-text border-krav-border rounded-xl p-5 shadow-sm mt-6 shrink-0 mb-6 lg:mb-0">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <Users className="w-4 h-4 text-krav-accent" />
                 <h3 className="text-sm font-bold uppercase tracking-wider">Histórico de Visitas ({instructorVisits.length})</h3>
               </div>
               <select 
                 value={filterMonth}
                 onChange={(e) => setFilterMonth(e.target.value)}
                 className="text-xs border border-krav-border bg-krav-bg rounded p-1"
               >
                 <option value="ALL">Todos os meses</option>
                 <option value="CURRENT">Mês Atual</option>
                 <option value="LAST">Mês Anterior</option>
               </select>
             </div>
             {instructorVisits.length === 0 ? (
               <p className="text-sm text-krav-muted">Nenhum registro encontrado para este período.</p>
             ) : (
               <div className="space-y-3 pr-2">
                 {instructorVisits.map(visit => (
                   <div key={visit.id} className="flex justify-between items-center bg-krav-card border border-krav-border p-3 rounded-lg shadow-sm">
                     <div>
                       <p className="font-bold text-sm text-krav-text flex items-center gap-1.5">
                         {visit.studentName}
                         <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest", visit.type === 'TRIAL' ? "bg-krav-accent/10 text-krav-accent" : "bg-neutral-100 text-neutral-500")}>
                           {visit.type === 'TRIAL' ? 'Aula Exp.' : 'Visita'}
                         </span>
                       </p>
                       <p className="text-xs text-krav-muted mt-0.5">{visit.phone}</p>
                     </div>
                     <span className="text-xs text-krav-muted">
                        {new Date(visit.date).toLocaleDateString('pt-BR')}
                     </span>
                   </div>
                 ))}
               </div>
             )}
          </div>

        </div>
      </div>

      {visitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-krav-card rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-krav-border flex justify-between items-center bg-krav-bg/50">
              <h2 className="font-bold text-krav-text uppercase tracking-wider text-sm flex items-center gap-2">
                {visitModal === 'TRIAL' ? <UserPlus className="w-4 h-4 text-krav-accent" /> : <Users className="w-4 h-4 text-krav-accent" />}
                {visitModal === 'TRIAL' ? 'Nova Aula Experimental' : 'Nova Visita'}
              </h2>
              <button onClick={() => setVisitModal(null)} className="text-krav-muted hover:text-krav-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddVisit} className="p-5 flex flex-col gap-4">
               <div>
                  <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Nome Completo</label>
                  <input type="text" required value={visitForm.name} onChange={e => setVisitForm({...visitForm, name: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg outline-none" placeholder="Ex: João da Silva" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Telefone / WhatsApp</label>
                  <input type="text" required value={visitForm.phone} onChange={e => setVisitForm({...visitForm, phone: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg outline-none" placeholder="(11) 99999-9999" />
               </div>
               <div className="mt-4 pt-4 border-t border-krav-border flex justify-end gap-3">
                 <button type="button" onClick={() => setVisitModal(null)} className="px-4 py-2 text-sm font-bold text-krav-text hover:bg-black/5 rounded-lg transition-colors">Cancelar</button>
                 <button type="submit" className="px-5 py-2 text-sm font-bold bg-krav-accent text-white rounded-lg hover:bg-krav-accent-light transition-colors shadow-sm">Registrar</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
