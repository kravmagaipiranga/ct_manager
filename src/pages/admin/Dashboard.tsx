import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';
import BirthdayWidget from '../../components/widgets/BirthdayWidget';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const students = useDataStore((state) => state.students);
  const checkins = useDataStore((state) => state.checkins);
  const financials = useDataStore((state) => state.financials);
  const classes = useDataStore((state) => state.classes);
  
  const updateStudent = useDataStore((state) => state.updateStudent);
  const approveCheckin = useDataStore((state) => state.approveCheckin);
  const rejectCheckin = useDataStore((state) => state.rejectCheckin);

  const academyStudents = useMemo(() => 
    students.filter(s => s.academyId === user?.academyId), 
  [students, user]);

  const activeCount = useMemo(() => 
    academyStudents.filter(s => s.role === 'STUDENT' && s.enrollmentStatus === 'ACTIVE').length,
  [academyStudents]);

  const pendingReg = useMemo(() => 
    academyStudents.filter(s => s.role === 'STUDENT' && s.enrollmentStatus === 'PENDING'),
  [academyStudents]);

  const pendingCheckins = useMemo(() => {
    return checkins.filter(c => {
      const s = students.find(st => st.id === c.studentId);
      return s?.academyId === user?.academyId && c.status === 'PENDING';
    });
  }, [checkins, students, user]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const checkinsToday = checkins.filter(c => {
      const s = students.find(st => st.id === c.studentId);
      return s?.academyId === user?.academyId && c.timestamp.startsWith(today);
    }).length;

    const billing = financials
      .filter(f => {
        const s = students.find(st => st.id === f.studentId);
        return s?.academyId === user?.academyId && f.referenceMonth === 'Maio/2026'; // Mock reference
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    return { checkinsToday, billing };
  }, [checkins, financials, students, user]);

  return (
    <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 content-start min-h-full">
      {/* KPI Cards */}
      <div className="bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm">
        <p className="text-[11px] uppercase tracking-wider text-krav-muted font-bold">Alunos Ativos</p>
        <p className="text-2xl font-black mt-2 text-krav-text">{activeCount}</p>
        <p className="text-[10px] text-green-500 font-medium mt-1 uppercase tracking-widest">{user?.academyId}</p>
      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm">
        <p className="text-[11px] uppercase tracking-wider text-krav-muted font-bold">Check-ins Hoje</p>
        <p className="text-2xl font-black mt-2 text-krav-text">{stats.checkinsToday}</p>
        <p className="text-[10px] text-krav-muted font-medium mt-1 uppercase tracking-widest">Sincronizado</p>
      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm">
        <p className="text-[11px] uppercase tracking-wider text-krav-muted font-bold">Matrículas e Check-ins</p>
        <p className="text-2xl font-black mt-2 text-krav-accent">{pendingReg.length + pendingCheckins.length}</p>
        <p className="text-[10px] text-krav-warning font-medium mt-1 uppercase tracking-widest">Aguardando Avaliação</p>
      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm">
        <p className="text-[11px] uppercase tracking-wider text-krav-muted font-bold">Faturamento</p>
        <p className="text-2xl font-black mt-2 text-krav-text">R$ {(stats.billing / 1000).toFixed(1)}k</p>
        <p className="text-[10px] text-krav-muted font-medium mt-1 uppercase tracking-widest">Maio/2026</p>
      </div>

      {/* Birthday Widget */}
      <section className="col-span-1 md:col-span-2 lg:col-span-2 h-full">
        <BirthdayWidget />
      </section>

      {/* Approvals Section (Matrículas) */}
      <section className="col-span-1 md:col-span-2 lg:col-span-2 bg-krav-card border border-krav-border rounded-xl flex flex-col shadow-sm">
        <div className="px-5 py-4 border-b border-krav-border flex justify-between items-center shrink-0 bg-black/5 dark:bg-krav-card/5">
          <h2 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
            Matrículas Pendentes
            {pendingReg.length > 0 && <span className="bg-krav-warning text-krav-bg px-2 py-0.5 rounded-full text-[10px]">{pendingReg.length}</span>}
          </h2>
        </div>

        <div className="flex-1 p-0">
          {pendingReg.length > 0 ? (
            pendingReg.map(s => (
              <ListItem
                key={s.id}
                name={s.name}
                subtext={`Registrado em: ${new Date(s.createdAt).toLocaleDateString()}`}
                beltColor={(s.beltLevel?.toLowerCase() as any) || 'white'}
                onApprove={() => updateStudent(s.id, { enrollmentStatus: 'ACTIVE' })}
                onReject={() => updateStudent(s.id, { enrollmentStatus: 'SUSPENDED' })}
              />
            ))
          ) : (
            <div className="p-8 text-center text-krav-muted text-sm italic">
              Nenhuma matrícula pendente.
            </div>
          )}
        </div>
      </section>

      {/* Approvals Section (Check-ins) */}
      <section className="col-span-1 md:col-span-2 lg:col-span-2 bg-krav-card border border-krav-border rounded-xl flex flex-col shadow-sm">
        <div className="px-5 py-4 border-b border-krav-border flex justify-between items-center shrink-0 bg-black/5 dark:bg-krav-card/5">
          <h2 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
            Aprovar Check-ins
            {pendingCheckins.length > 0 && <span className="bg-krav-accent text-white px-2 py-0.5 rounded-full text-[10px]">{pendingCheckins.length}</span>}
          </h2>
        </div>

        <div className="flex-1 p-0">
          {pendingCheckins.length > 0 ? (
            pendingCheckins.map(c => {
              const student = students.find(s => s.id === c.studentId);
              const cls = classes.find(cl => cl.id === c.classId);
              const timeStr = new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
              return (
                <ListItem
                  key={c.id}
                  name={student?.name || 'Desconhecido'}
                  subtext={`Aula: ${cls?.name || 'Desconhecida'} | Check-in às ${timeStr}`}
                  beltColor={(student?.beltLevel?.toLowerCase() as any) || 'white'}
                  onApprove={() => approveCheckin(c.id)}
                  onReject={() => rejectCheckin(c.id)}
                />
              )
            })
          ) : (
            <div className="p-8 text-center text-krav-muted text-sm italic">
               Nenhum check-in pendente.
            </div>
          )}
        </div>
      </section>

      {/* Financial Section */}
      <section className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col gap-4 sm:gap-6">
        {/* Chart Card */}
        <div className="bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-4 text-krav-text flex items-center gap-2">
            Saúde Financeira (6 meses)
          </h2>
          
          <div className="h-[150px] w-full flex items-end gap-3 pt-4">
            <div className="flex-1 bg-krav-accent opacity-60 rounded-t-sm hover:opacity-100 transition-opacity" style={{ height: '40%' }}></div>
            <div className="flex-1 bg-krav-accent opacity-60 rounded-t-sm hover:opacity-100 transition-opacity" style={{ height: '55%' }}></div>
            <div className="flex-1 bg-krav-accent opacity-60 rounded-t-sm hover:opacity-100 transition-opacity" style={{ height: '52%' }}></div>
            <div className="flex-1 bg-krav-accent opacity-60 rounded-t-sm hover:opacity-100 transition-opacity" style={{ height: '68%' }}></div>
            <div className="flex-1 bg-krav-accent opacity-60 rounded-t-sm hover:opacity-100 transition-opacity" style={{ height: '85%' }}></div>
            <div className="flex-1 bg-krav-accent opacity-100 rounded-t-sm shadow-[0_0_15px_rgba(0,0,142,0.4)]" style={{ height: '92%' }}></div>
          </div>
          
          <div className="flex justify-between mt-3 text-[10px] text-krav-muted font-bold tracking-wider">
            <span>DEZ</span>
            <span>JAN</span>
            <span>FEV</span>
            <span>MAR</span>
            <span>ABR</span>
            <span className="text-krav-accent">MAI</span>
          </div>
        </div>

        {/* Delinquency List */}
        <div className="flex-1 bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-4 text-krav-danger flex items-center gap-2">
            Inadimplência Crítica
          </h2>
          
          <div className="flex flex-col gap-0 pr-2">
            {financials.filter(f => {
              const s = students.find(st => st.id === f.studentId);
              return s?.academyId === user?.academyId && f.status === 'OVERDUE';
            }).length > 0 ? (
              financials.filter(f => {
                const s = students.find(st => st.id === f.studentId);
                return s?.academyId === user?.academyId && f.status === 'OVERDUE';
              }).map(f => {
                const s = students.find(st => st.id === f.studentId);
                return (
                  <div key={f.id} className="flex justify-between items-center py-3 border-b border-krav-border text-sm hover:bg-black/5 dark:hover:bg-krav-card/5 transition-colors px-2 rounded -mx-2">
                    <span className="font-bold text-krav-text">{s?.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">Atrasado</span>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-krav-muted text-xs italic opacity-70">
                Nenhuma inadimplência crítica.
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

interface ListItemProps {
  key?: any;
  name: string;
  subtext: string;
  beltColor: string;
  onApprove: () => void;
  onReject: () => void;
}

function ListItem({ 
  name, 
  subtext, 
  beltColor, 
  onApprove,
  onReject
}: ListItemProps) {
  
  const beltBorderColor: Record<string, string> = {
    white: 'border-l-gray-300',
    yellow: 'border-l-[#ffdf00]',
    orange: 'border-l-[#ff8c00]',
    green: 'border-l-[#008000]',
    blue: 'border-l-[#0000ff]',
    brown: 'border-l-[#8b4513]',
    black: 'border-l-black',
  };

  const borderColor = beltBorderColor[beltColor] || 'border-l-gray-300';

  return (
    <div className="px-4 py-3 border-b border-krav-border flex flex-col sm:flex-row sm:items-center justify-between text-sm hover:bg-black/5 dark:hover:bg-krav-card/5 transition-colors gap-3">
      <div className={cn('border-l-4 pl-3', borderColor)}>
        <strong className="block text-krav-text text-sm">{name}</strong>
        <span className="text-xs text-krav-muted mt-0.5 block">{subtext}</span>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <button 
          onClick={onReject}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
          title="Rejeitar"
        >
          <XCircle className="w-5 h-5" />
        </button>
        <button 
          onClick={onApprove}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white transition-colors"
          title="Aprovar"
        >
          <CheckCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

