import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Plus, Clock, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ClassSession, Belt } from '../../types';
import { BeltBadge } from '../../components/shared/BeltBadge';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const ALL_BELTS: Belt[] = ['WHITE', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'BROWN', 'BLACK'];

export default function Schedule() {
  const user = useAuthStore((state) => state.user);
  const allClasses = useDataStore((state) => state.classes);
  
  const classes = user?.role === 'INSTRUCTOR' 
    ? allClasses.filter(c => c.instructorId === user.id)
    : allClasses;
  
  const getClassesByDay = (dayIndex: number) => {
    return classes.filter(c => c.dayOfWeek === dayIndex).sort((a, b) => a.time.localeCompare(b.time));
  };

  const navigate = useNavigate();

  const handleEdit = (session: ClassSession) => {
    navigate(`/admin/schedule/${session.id}`);
  };

  const handleAddNew = () => {
    navigate('/admin/schedule/new');
  };

  return (
    <div className="p-6 md:p-8 flex flex-col bg-krav-bg w-full h-full relative overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Grade de Horários</h1>
          <p className="text-sm text-krav-muted mt-1">Configure o quadro de aulas semanais e restrições de faixa.</p>
        </div>
        <button onClick={handleAddNew} className="bg-krav-accent hover:bg-krav-accent-light text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Nova Turma
        </button>
      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm flex flex-col overflow-x-auto h-full min-h-[500px]">
        <div className="w-full grid grid-cols-7 border-b border-krav-border bg-black/[0.02] min-w-[800px] shrink-0">
          {DAYS.map((day, i) => (
            <div key={day} className={cn("px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-krav-text border-krav-border", i !== 6 && "border-r")}>
              {day}
            </div>
          ))}
        </div>
        
        <div className="w-full grid grid-cols-7 min-w-[800px] flex-1">
           {DAYS.map((_, dayIndex) => {
             const dayClasses = getClassesByDay(dayIndex);
             
             // Group by time
             const grouped: Record<string, typeof dayClasses> = {};
             dayClasses.forEach(c => {
               if(!grouped[c.time]) grouped[c.time] = [];
               grouped[c.time].push(c);
             });

             return (
               <div key={dayIndex} className={cn("p-2 border-krav-border flex flex-col gap-2 min-h-full", dayIndex !== 6 && "border-r")}>
                 {Object.entries(grouped).map(([time, sessions]) => (
                   <div 
                     key={time} 
                     className="bg-krav-card border border-krav-border p-2 rounded-lg relative shadow-sm"
                   >
                     {/* Time Header */}
                     <div className="flex items-center gap-1 text-krav-text font-bold tracking-tight mb-2 px-1">
                       <Clock className="w-3 h-3 text-krav-muted" />
                       <span className="text-xs">{time}</span>
                     </div>
                     
                     <div className="flex flex-col gap-1.5">
                       {sessions.map(session => (
                         <div 
                           key={session.id}
                           onClick={() => handleEdit(session)}
                           className="group border border-transparent hover:border-krav-accent/30 hover:bg-black/5 p-1.5 rounded transition-all cursor-pointer relative overflow-hidden"
                         >
                           <p className="text-[11px] font-bold text-krav-text leading-tight">{session.name}</p>

                           {/* Tags container */}
                           <div className="flex flex-wrap gap-1 mt-1">
                              {(session.allowedBelts || []).map((belt, idx) => (
                                 <div key={`badge-${idx}`}>
                                   <BeltBadge belt={belt} className="scale-[0.7] origin-left -ml-1 text-[8px] px-1 py-0" />
                                 </div>
                              ))}
                              {(session.otherModalities || []).map((mod, i) => (
                                 <span key={i} className="text-[8px] font-bold px-1 py-0.5 rounded bg-[#e11d48]/10 text-[#e11d48] border border-[#e11d48]/20 whitespace-nowrap">
                                   {mod}
                                 </span>
                              ))}
                              {(!session.allowedBelts?.length && !session.otherModalities?.length) && (
                                <span className="text-[9px] text-krav-muted">Sem restrição</span>
                              )}
                           </div>
                           
                           <div className="mt-1 pt-1 border-t border-krav-border/50 flex flex-col border-dashed">
                             <p className="text-[9px] text-krav-muted flex items-center gap-1 w-full truncate">
                               <Users className="w-2.5 h-2.5 shrink-0" /> 
                               <span className="truncate">{session.instructorName}</span>
                             </p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
                 
                 {dayClasses.length === 0 && (
                   <div className="h-[100px] flex items-center justify-center p-4">
                     <span className="text-[10px] text-krav-muted text-center italic opacity-40">Livre</span>
                   </div>
                 )}
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
}
