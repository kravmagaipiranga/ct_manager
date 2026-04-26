import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { CheckCircle, Calendar, Medal } from 'lucide-react';

export default function StudentHistory() {
  const user = useAuthStore((state) => state.user);
  const checkins = useDataStore((state) => state.checkins).filter(c => c.studentId === user?.id && c.status === 'APPROVED');
  const classes = useDataStore((state) => state.classes);
  
  // Find events where student might be involved (e.g. exams containing their ID, or generic past events for MVP)
  const events = useDataStore((state) => state.events).filter(e => {
    // If it's an exam, show if the student was allowed
    if (e.type === 'EXAM' && e.allowedStudentIds?.includes(user?.id || '')) return true;
    return false;
  });

  const checkinHistory = checkins.map(checkin => {
    const classObj = classes.find(c => c.id === checkin.classId);
    return {
      type: 'CHECKIN',
      id: checkin.id,
      date: new Date(checkin.timestamp),
      title: classObj?.name || 'Treino',
      subtitle: `Instrutor: ${classObj?.instructorName || 'Academia'}`
    };
  });

  const eventHistory = events.map(ev => {
    return {
      type: ev.type, // 'EXAM' | 'SEMINAR'
      id: ev.id,
      date: new Date(ev.date),
      title: ev.title,
      subtitle: ev.type === 'EXAM' ? 'Exame de Faixa' : 'Evento Extra'
    };
  });

  const allHistory = [...checkinHistory, ...eventHistory].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="p-4 sm:p-6 mb-20 md:mb-0 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-krav-text uppercase tracking-tight">Histórico</h1>
      <p className="text-sm text-krav-muted">Seu histórico de presenças em treinos, eventos e exames de faixa.</p>

      <div className="bg-krav-card p-6 rounded-xl border border-krav-border shadow-sm">
         {allHistory.length > 0 ? (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-krav-border before:to-transparent">
               {allHistory.map((item, index) => (
                 <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Marker */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-krav-bg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                       {item.type === 'CHECKIN' ? (
                          <CheckCircle className="w-4 h-4 text-krav-success" />
                       ) : item.type === 'EXAM' ? (
                          <Medal className="w-4 h-4 text-orange-500" />
                       ) : (
                          <Calendar className="w-4 h-4 text-krav-accent" />
                       )}
                    </div>

                    {/* Content */}
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-krav-border bg-krav-card shadow-sm transition-all hover:border-krav-accent/30 group-hover:shadow-md">
                       <div className="flex flex-col mb-1">
                          <time className="text-xs font-bold text-krav-muted uppercase tracking-wider mb-1">
                             {item.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                          </time>
                          <h3 className="font-bold text-krav-text">{item.title}</h3>
                       </div>
                       <div className="text-xs text-krav-muted font-medium">
                         {item.subtitle}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         ) : (
           <div className="text-center py-8">
             <Calendar className="w-12 h-12 text-krav-border mx-auto mb-4" />
             <p className="text-krav-muted font-medium">Você ainda não tem registros no seu histórico.</p>
           </div>
         )}
      </div>
    </div>
  );
}
