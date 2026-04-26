import React, { useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { BeltBadge } from '../../components/shared/BeltBadge';
import { cn } from '../../lib/utils';

export default function StudentCurriculum() {
  const user = useAuthStore((state) => state.user);
  const curriculumTexts = useDataStore((state) => state.curriculumTexts);
  const checkins = useDataStore((state) => state.checkins);
  const classLogs = useDataStore((state) => state.classLogs);
  
  if (!user || !user.beltLevel) return null;

  // Derive accomplished techniques based on attendance and logs
  const accomplishedTechniques = useMemo(() => {
    const passed = new Set<string>();

    const approvedCheckins = checkins.filter(c => c.studentId === user.id && c.status === 'APPROVED');
    
    // Create a Set of "YYYY-MM-DD|classId" strings representing successful attended instances
    const attendedSessions = new Set(approvedCheckins.map(c => {
      const dt = new Date(c.timestamp);
      const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      return `${dateStr}|${c.classId}`;
    }));

    classLogs.forEach(log => {
      if (log.belt === user.beltLevel) {
        if (attendedSessions.has(`${log.dateStr}|${log.classId}`)) {
          log.techniques.forEach(t => passed.add(t));
        }
      }
    });

    return passed;
  }, [user, checkins, classLogs]);

  // Read curriculum block specifically from the curriculumTexts object mapped by the Belt
  const content = curriculumTexts[user.beltLevel] || '';
  const lines = content.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col max-w-3xl mx-auto w-full bg-krav-bg">
      <div className="mb-6 shrink-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Currículo de Graduação</h1>
          <p className="text-sm text-krav-muted mt-1">Lista de técnicas necessárias para a sua graduação atual.</p>
        </div>
        <div>
           <BeltBadge belt={user.beltLevel} className="scale-110 origin-left sm:origin-right" />
        </div>
      </div>

      <div className="pb-10">
        {lines.length > 0 ? (
          <div className="max-w-3xl bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden">
             <div className="bg-black/5 px-5 py-3 border-b border-krav-border">
               <h2 className="font-bold text-sm tracking-widest uppercase text-krav-muted">Requisitos</h2>
             </div>
             <div className="flex flex-col divide-y divide-krav-border">
                {lines.map((technique, index) => {
                  const isChecked = accomplishedTechniques.has(technique.trim());
                  
                  return (
                    <div key={index} className="p-4 flex items-center gap-3 hover:bg-black/[0.02] transition-colors">
                       <div className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                          isChecked ? "bg-krav-success border-krav-success text-white" : "border-krav-border text-transparent bg-krav-bg"
                        )}>
                          <CheckCircle2 className="w-5 h-5" />
                       </div>
                       <h3 className={cn(
                          "font-medium text-[15px] transition-colors",
                          isChecked ? "text-krav-muted line-through" : "text-krav-text"
                       )}>
                         {technique.trim()}
                       </h3>
                    </div>
                  )
                })}
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center border border-dashed border-krav-border rounded-xl bg-krav-card shadow-sm p-6">
             <BookOpen className="w-12 h-12 text-krav-border mb-4" />
             <p className="text-krav-text font-medium text-lg">Nenhum conteúdo publicado</p>
             <p className="text-sm text-krav-muted mt-2 max-w-sm">O currículo para a sua graduação atual ainda não foi publicado pelo seu instrutor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
