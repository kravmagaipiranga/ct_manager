import React, { useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { BeltBadge } from '../../components/shared/BeltBadge';
import { CheckCircle2, QrCode, Calendar as CalendarIcon, Clock, ArrowRight, Briefcase, Medal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StatusPill } from '../../components/shared/StatusPill';

export default function StudentHome() {
  const user = useAuthStore((state) => state.user);
  const classes = useDataStore((state) => state.classes);
  const checkins = useDataStore((state) => state.checkins);
  const appointments = useDataStore((state) => state.appointments);
  const requestCheckin = useDataStore((state) => state.requestCheckin);

  // Derive today's classes
  const todayClasses = useMemo(() => {
    const defaultDay = new Date().getDay();
    return classes.filter(c => c.dayOfWeek === defaultDay && c.academyId === user?.academyId).sort((a, b) => a.time.localeCompare(b.time));
  }, [classes, user]);

  // Derive checkin status for today
  const getCheckinForClass = (classId: string) => {
    return checkins.find(c => c.classId === classId && c.studentId === user?.id);
  };

  const myAppointments = useMemo(() => {
    return appointments.filter(a => a.studentId === user?.id && a.status === 'SCHEDULED').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, user]);
  
  const events = useDataStore((state) => state.events);
  const availableExams = events.filter(e => e.type === 'EXAM' && e.allowedStudentIds?.includes(user?.id!));

  const hasAnyCheckinToday = todayClasses.some(c => getCheckinForClass(c.id) !== undefined);

  if (!user) return null;

  return (
    <div className="p-5 md:p-8 flex flex-col gap-6 max-w-lg mx-auto w-full">
      {/* Welcome Banner */}
      <div className="bg-krav-accent text-white rounded-2xl p-6 shadow-md relative overflow-hidden shrink-0 mt-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-krav-card/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">Resumo do Treino</h2>
            <p className="text-sm text-white/80 mt-1">Frequência mensal: <strong>81%</strong></p>
          </div>
          <BeltBadge belt={user.beltLevel} className="shadow-lg border-opacity-50" />
        </div>
        <div className="relative z-10 mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/60 font-medium">Aulas na Faixa</p>
            <p className="text-xl font-bold mt-0.5">34</p>
          </div>
          <div>
             <p className="text-[10px] uppercase tracking-wider text-white/60 font-medium">Próximo Exame</p>
             <p className="text-sm font-bold mt-1.5 flex items-center gap-1">A Definir <ArrowRight className="w-3 h-3 opacity-50" /></p>
          </div>
        </div>
      </div>
      
      {/* Avaliable Exams */}
      {availableExams.length > 0 && (
        <div className="bg-krav-card border-2 border-krav-accent/30 rounded-xl p-5 shadow-sm relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
            <Medal className="w-24 h-24 text-krav-accent" />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-krav-text flex items-center gap-2 mb-4">
              <Medal className="w-5 h-5 text-krav-accent" /> Exames Disponíveis
            </h3>
            <div className="flex flex-col gap-3">
              {availableExams.map(exam => (
                <div key={exam.id} className="bg-krav-bg border border-krav-border p-3 rounded-lg flex flex-col gap-3 shadow-sm">
                  <div>
                     <p className="font-bold text-sm text-krav-text">{exam.title}</p>
                     <p className="text-[10px] text-krav-muted mt-1 uppercase tracking-wider font-semibold">
                       {new Date(exam.date).toLocaleDateString('pt-BR')} às {new Date(exam.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                     </p>
                  </div>
                  <button className="bg-krav-accent/10 hover:bg-krav-accent text-krav-accent hover:text-white border border-krav-accent/20 transition-colors w-full py-2 rounded-lg text-xs font-bold text-center">
                     Realizar Inscrição
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Appointments */}
      {myAppointments.length > 0 && (
         <div className="shrink-0">
           <h3 className="font-semibold text-krav-text flex items-center gap-2 mb-4">
             <Briefcase className="w-5 h-5 text-krav-accent" />
             Meus Serviços / Especiais
           </h3>
           <div className="flex flex-col gap-3">
             {myAppointments.map(app => {
               const dateObj = new Date(app.date);
               return (
                 <div key={app.id} className="bg-krav-card border-l-4 border-l-krav-accent border border-krav-border rounded-xl p-4 shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-krav-muted uppercase tracking-wider">
                      {app.type === 'PRIVATE_CLASS' ? 'Aula Particular' : app.type === 'LECTURE' ? 'Palestra' : 'Workshop'}
                    </span>
                    <div className="flex justify-between items-start mt-1">
                       <h4 className="font-bold text-sm text-krav-text leading-tight">{app.title}</h4>
                       <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Confirmado</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed border-krav-border">
                       <p className="text-xs font-semibold text-krav-text flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {dateObj.toLocaleDateString('pt-BR')}</p>
                       <p className="text-xs font-semibold text-krav-muted flex items-center gap-1.5 ml-2"><Clock className="w-3.5 h-3.5" /> {dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} ({app.durationMinutes}m)</p>
                    </div>
                 </div>
               )
             })}
           </div>
         </div>
      )}

      {/* Check-in Section */}
      <div className="shrink-0 pb-10">
        <h3 className="font-semibold text-krav-text flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-krav-accent" />
          Treinos de Hoje
        </h3>

        {todayClasses.length === 0 ? (
          <div className="bg-krav-card border border-krav-border p-6 rounded-xl text-center shadow-sm">
            <p className="text-krav-muted text-sm">Não há aulas programadas para a sua academia hoje.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {todayClasses.map(session => {
              const checkin = getCheckinForClass(session.id);
              const isPending = checkin?.status === 'PENDING';
              const isApproved = checkin?.status === 'APPROVED';

              return (
                <div key={session.id} className="bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-krav-text leading-tight">{session.name}</h4>
                      <p className="text-xs text-krav-muted mt-1">Instrutor: {session.instructorName}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-krav-bg rounded-lg border border-krav-border">
                      <Clock className="w-3.5 h-3.5 text-krav-muted" />
                      <span className="text-sm font-semibold text-krav-text">{session.time}</span>
                    </div>
                  </div>

                  {!checkin ? (
                    <button 
                      onClick={() => requestCheckin(user.id, session.id)}
                      disabled={hasAnyCheckinToday}
                      className={cn(
                        "w-full py-3 rounded-lg font-bold text-sm flex justify-center items-center gap-2 transition-all",
                        hasAnyCheckinToday 
                          ? "bg-krav-bg text-krav-muted cursor-not-allowed" 
                          : "bg-krav-accent text-white hover:bg-krav-accent-light hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                      )}
                    >
                      <QrCode className="w-4 h-4" />
                      Fazer Check-in
                    </button>
                  ) : (
                    <div className={cn(
                      "w-full py-2.5 rounded-lg font-bold text-sm flex justify-center items-center gap-2 border shadow-sm",
                      isPending ? "bg-krav-warning/10 text-krav-warning border-krav-warning/20" : 
                      isApproved ? "bg-krav-success/10 text-krav-success border-krav-success/20" : ""
                    )}>
                      {isPending && (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-krav-warning border-t-transparent animate-spin"></div>
                          Aguardando Liberação
                        </>
                      )}
                      {isApproved && (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Presença Confirmada
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  );
}
