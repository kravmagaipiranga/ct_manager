import React, { useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { Clock, Users, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BeltBadge } from '../../components/shared/BeltBadge';

const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function StudentSchedule() {
  const classes = useDataStore((state) => state.classes);

  const getClassesByDay = (dayIndex: number) => {
    return classes.filter(c => c.dayOfWeek === dayIndex).sort((a, b) => a.time.localeCompare(b.time));
  };

  const todayIndex = new Date().getDay();

  // Always show Monday to Saturday (1 to 6)
  const sortedDays = [1, 2, 3, 4, 5, 6];

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col max-w-xl mx-auto w-full">
      <div className="mb-6 shrink-0 z-10">
        <h1 className="text-2xl font-bold tracking-tight text-krav-text">Grade de Horários</h1>
        <p className="text-sm text-krav-muted mt-1">Grade geral e completa de turmas oferecidas pela academia.</p>
      </div>

      <div className="flex flex-col gap-8 pb-10">
        {sortedDays.map((dayIndex) => {
          const dayClasses = getClassesByDay(dayIndex);
          const isToday = todayIndex === dayIndex;

          return (
            <div key={dayIndex} className={cn("flex flex-col gap-4", isToday ? "relative" : "")}>
              <h2 className="font-bold text-lg text-krav-text flex items-center gap-2 border-b border-krav-border pb-2">
                <Calendar className={cn("w-5 h-5 rounded", isToday ? "text-krav-accent bg-krav-accent/10" : "text-krav-muted bg-krav-bg")} />
                {isToday ? "Hoje - " : ""}{DAYS[dayIndex]}
              </h2>

              <div className="flex flex-col gap-3">
                {dayClasses.length === 0 ? (
                  <div className="text-center py-4 bg-krav-card border border-dashed border-krav-border rounded-xl opacity-70">
                    <p className="text-sm font-medium text-krav-muted">Nenhum treino agendado</p>
                  </div>
                ) : (
                  dayClasses.map((session) => (
                    <div 
                      key={session.id} 
                      className="bg-krav-card border border-krav-border p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                    <div className="absolute top-0 left-0 w-1 bg-krav-accent h-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex flex-col gap-2 pl-2">
                      <div className="flex items-center gap-2 text-krav-text font-bold text-sm">
                        <Clock className="w-4 h-4 text-krav-accent" />
                        {session.time} 
                        <span className="text-xs font-normal text-krav-muted block md:inline">({session.durationMinutes}m)</span>
                      </div>
                      <p className="text-[15px] font-bold text-krav-text leading-tight">{session.name}</p>
                      <p className="text-xs text-krav-muted flex items-center gap-1.5 mt-1">
                        <Users className="w-3.5 h-3.5" /> 
                        {session.instructorName}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right">
                       <div className="flex flex-wrap justify-end gap-1.5 max-w-[120px]">
                          {(session.allowedBelts || []).map((belt, idx) => (
                             <React.Fragment key={`belt-${idx}`}>
                               <BeltBadge belt={belt} className="scale-75 origin-right -mr-2" />
                             </React.Fragment>
                          ))}
                          {(!session.allowedBelts?.length && !session.otherModalities?.length) && (
                            <span className="text-[10px] bg-krav-accent/10 text-krav-accent uppercase font-bold tracking-wider px-2 py-1 rounded">Aberto</span>
                          )}
                          {(session.otherModalities || []).map((mod, idx) => (
                             <span key={idx} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#e11d48]/10 text-[#e11d48] border border-[#e11d48]/20 whitespace-nowrap">
                               {mod}
                             </span>
                          ))}
                       </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
