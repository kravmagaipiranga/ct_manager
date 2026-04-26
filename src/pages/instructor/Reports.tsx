import React, { useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { BarChart3, TrendingUp, TrendingDown, Users, UserPlus, LogOut, Activity, Target } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Reports() {
  const user = useAuthStore((state) => state.user);
  const students = useDataStore((state) => state.students);
  const visits = useDataStore((state) => state.visits);

  if (!user) return null;

  const data = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    
    // Filter to Instructor's responsibilities if needed. Currently looking at all or specific.
    // For now, let's look at all.
    const relevantStudents = students.filter(s => s.role === 'STUDENT');
    const relevantVisits = visits; // .filter(v => v.instructorId === user.id)

    let totalPrevMonth = 0;
    let newEnrollmentsThisMonth = 0;
    let exitsThisMonth = 0;
    let reEnrollmentsThisMonth = 0; // Hard to track without status history, defaulting to 0 or mock

    relevantStudents.forEach(s => {
      const createdTime = new Date(s.createdAt).getTime();
      
      if (s.enrollmentStatus === 'ACTIVE') {
        if (createdTime >= startOfCurrentMonth) {
          newEnrollmentsThisMonth++;
        } else {
          totalPrevMonth++;
        }
      } else {
        // If inactive, count as exit. Ideally we'd know WHEN they exited.
        // Assuming they exited this month for the sake of the report, or if created before current.
        // We will just count all inactive as exits for this month if we don't have history.
        exitsThisMonth++;
        
        // They were active last month, but exited this month:
        if (createdTime < startOfCurrentMonth) {
          totalPrevMonth++;
        }
      }
    });

    const visitsThisMonth = relevantVisits.filter(v => 
      v.type === 'VISIT' && new Date(v.date).getTime() >= startOfCurrentMonth
    ).length;

    const trialsThisMonth = relevantVisits.filter(v => 
      v.type === 'TRIAL' && new Date(v.date).getTime() >= startOfCurrentMonth
    ).length;

    // Total actual month
    const totalCurrentMonth = totalPrevMonth + newEnrollmentsThisMonth + reEnrollmentsThisMonth - exitsThisMonth;

    // Conversions
    const totalOpportunities = visitsThisMonth + trialsThisMonth;
    const conversionRate = totalOpportunities > 0 
      ? Math.round((newEnrollmentsThisMonth / totalOpportunities) * 100) 
      : 0;

    const evolution = totalPrevMonth > 0 
      ? ((totalCurrentMonth - totalPrevMonth) / totalPrevMonth) * 100 
      : 100;

    return {
      totalPrevMonth,
      totalCurrentMonth,
      visitsThisMonth,
      trialsThisMonth,
      newEnrollmentsThisMonth,
      reEnrollmentsThisMonth,
      exitsThisMonth,
      conversionRate,
      evolution
    };
  }, [students, visits]);

  return (
    <div className="p-6 md:p-8 flex flex-col bg-krav-bg/50 flex-1 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-krav-text flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-krav-accent" /> Relatório de Desempenho
        </h1>
        <p className="text-sm text-krav-muted mt-1">Evolução de alunos, visitas e matrículas (Mês Atual x Mês Anterior).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-krav-card p-6 rounded-2xl border border-krav-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
             <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
               <Users className="w-5 h-5 text-blue-500" />
             </div>
             <div className={cn("px-2 py-1 rounded text-xs font-bold flex items-center gap-1", data.evolution >= 0 ? "bg-krav-success/10 text-krav-success" : "bg-krav-danger/10 text-krav-danger")}>
               {data.evolution >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
               {data.evolution > 0 ? '+' : ''}{data.evolution.toFixed(1)}%
             </div>
          </div>
          <div>
            <p className="text-3xl font-black text-krav-text">{data.totalCurrentMonth}</p>
            <p className="text-xs text-krav-muted uppercase font-bold tracking-wider mt-1">Total Alunos (Atual)</p>
            <p className="text-[11px] text-krav-muted mt-2">Mês anterior: <strong className="text-krav-text">{data.totalPrevMonth}</strong></p>
          </div>
        </div>

        <div className="bg-krav-card p-6 rounded-2xl border border-krav-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
             <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
               <Activity className="w-5 h-5 text-indigo-500" />
             </div>
          </div>
          <div>
            <p className="text-3xl font-black text-krav-text">{data.visitsThisMonth + data.trialsThisMonth}</p>
            <p className="text-xs text-krav-muted uppercase font-bold tracking-wider mt-1">Oportunidades (Mês)</p>
            <p className="text-[11px] text-krav-muted mt-2 flex gap-2">
               <span>Visitas: <strong className="text-krav-text">{data.visitsThisMonth}</strong></span>
               <span>Aulas Exp: <strong className="text-krav-text">{data.trialsThisMonth}</strong></span>
            </p>
          </div>
        </div>

        <div className="bg-krav-card p-6 rounded-2xl border border-krav-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
             <div className="w-10 h-10 rounded-full bg-krav-success/10 flex items-center justify-center">
               <UserPlus className="w-5 h-5 text-krav-success" />
             </div>
             <div className="px-2 py-1 rounded bg-krav-bg text-krav-text text-xs font-bold border border-krav-border">
               Taxa: {data.conversionRate}%
             </div>
          </div>
          <div>
            <p className="text-3xl font-black text-krav-text">{data.newEnrollmentsThisMonth + data.reEnrollmentsThisMonth}</p>
            <p className="text-xs text-krav-muted uppercase font-bold tracking-wider mt-1">Boas-vindas (Mês)</p>
            <p className="text-[11px] text-krav-muted mt-2 flex gap-2">
               <span>Matrículas: <strong className="text-krav-text">{data.newEnrollmentsThisMonth}</strong></span>
               <span>Remat.: <strong className="text-krav-text">{data.reEnrollmentsThisMonth}</strong></span>
            </p>
          </div>
        </div>

        <div className="bg-krav-card p-6 rounded-2xl border border-krav-border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
             <div className="w-10 h-10 rounded-full bg-krav-danger/10 flex items-center justify-center">
               <LogOut className="w-5 h-5 text-krav-danger" />
             </div>
          </div>
          <div>
            <p className="text-3xl font-black text-krav-text">{data.exitsThisMonth}</p>
            <p className="text-xs text-krav-muted uppercase font-bold tracking-wider mt-1">Saídas (Mês)</p>
            <p className="text-[11px] text-krav-muted mt-2">
               Impacto retenção
            </p>
          </div>
        </div>

      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm p-6 max-w-4xl">
         <h2 className="text-lg font-bold text-krav-text mb-6 flex items-center gap-2">
           <Target className="w-5 h-5 text-krav-accent" />
           Resumo Consolidado
         </h2>
         <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-krav-border">
              <span className="text-sm font-medium text-krav-muted">Total Alunos (Início do Mês)</span>
              <span className="text-sm font-bold text-krav-text">{data.totalPrevMonth}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-krav-border">
              <span className="text-sm font-medium text-krav-muted">+ Matrículas</span>
              <span className="text-sm font-bold text-krav-success">+{data.newEnrollmentsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-krav-border">
              <span className="text-sm font-medium text-krav-muted">+ Rematrículas</span>
              <span className="text-sm font-bold text-krav-success">+{data.reEnrollmentsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-krav-border">
              <span className="text-sm font-medium text-krav-muted">- Saídas / Cancelamentos</span>
              <span className="text-sm font-bold text-krav-danger">-{data.exitsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-krav-text uppercase tracking-wider text-sm">Total Atual</span>
              <span className="text-lg font-black text-krav-text">{data.totalCurrentMonth}</span>
            </div>
         </div>
      </div>
    </div>
  );
}
