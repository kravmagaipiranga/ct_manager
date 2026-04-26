import React, { useState } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Plus, Clock, Users, X, Save, Edit3, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ClassSession, Belt } from '../../types';
import { BeltBadge } from '../../components/shared/BeltBadge';
import { toast } from 'sonner';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const ALL_BELTS: Belt[] = ['WHITE', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'BROWN', 'BLACK'];

export default function Schedule() {
  const user = useAuthStore((state) => state.user);
  const allClasses = useDataStore((state) => state.classes);
  const updateClass = useDataStore((state) => state.updateClass);
  // Assume addClass and deleteClass exist in useDataStore, or implement them if requested
  // I will just use setEditingSession to start with empty id to mean new
  const addClassToStore = useDataStore((state) => state.addClass) || ((c: any) => {
      // fallback if not defined
      console.warn("addClass ToStore not strictly defined");
      useDataStore.setState(prev => ({ classes: [...prev.classes, c] }));
  });
  const deleteClassInStore = useDataStore((state) => state.deleteClass) || ((id: string) => {
      useDataStore.setState(prev => ({ classes: prev.classes.filter(c => c.id !== id) }));
  });

  const classes = user?.role === 'INSTRUCTOR' 
    ? allClasses.filter(c => c.instructorId === user.id)
    : allClasses;
  
  const [editingSession, setEditingSession] = useState<{
    id: string;
    name: string;
    instructorId: string;
    instructorName: string;
    daysOfWeek: number[];
    times: string[];
    durationMinutes: number;
    allowedBelts: Belt[];
    otherModalities: string[];
    // temporary input for a new time
    newTimeInput?: string;
  } | null>(null);

  const getClassesByDay = (dayIndex: number) => {
    return classes.filter(c => c.dayOfWeek === dayIndex).sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleEdit = (session: ClassSession) => {
    setEditingSession({
      ...session,
      daysOfWeek: [session.dayOfWeek],
      times: [session.time],
      allowedBelts: session.allowedBelts || [],
      otherModalities: session.otherModalities || [],
      newTimeInput: ''
    });
  };

  const handleAddNew = () => {
    setEditingSession({
      id: '',
      name: '',
      instructorId: user?.id || '',
      instructorName: user?.name || '',
      daysOfWeek: [1], // monday default
      times: ['18:00'],
      durationMinutes: 60,
      allowedBelts: [],
      otherModalities: [],
      newTimeInput: ''
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSession) {
      if (editingSession.times.length === 0) {
        toast.error('Adicione pelo menos um horário.');
        return;
      }
      if (editingSession.daysOfWeek.length === 0) {
        toast.error('Selecione pelo menos um dia na semana.');
        return;
      }

      const savePromises: any[] = [];
      const baseSession = {
        name: editingSession.name,
        instructorId: editingSession.instructorId,
        instructorName: editingSession.instructorName,
        durationMinutes: editingSession.durationMinutes,
        allowedBelts: editingSession.allowedBelts,
        otherModalities: editingSession.otherModalities
      };

      if (editingSession.id) {
         // Update existing (takes first selected day and first time, ignores multiples for edit safety, or update the main one and create the rest)
         updateClass(editingSession.id, {
            ...baseSession,
            dayOfWeek: editingSession.daysOfWeek[0],
            time: editingSession.times[0]
         });
         
         // If they added more days or times, create them as new sessions
         editingSession.daysOfWeek.forEach((day, dIdx) => {
           editingSession.times.forEach((time, tIdx) => {
             // Skip the first one since we just updated it
             if (dIdx === 0 && tIdx === 0) return;
             addClassToStore({
               ...baseSession,
               dayOfWeek: day,
               time: time,
               id: Math.random().toString(36).substr(2, 9)
             });
           });
         });
         toast.success('Horário(s) atualizado(s) com sucesso!');
      } else {
         // Create permutations
         editingSession.daysOfWeek.forEach((day) => {
           editingSession.times.forEach((time) => {
             addClassToStore({
               ...baseSession,
               dayOfWeek: day,
               time: time,
               id: Math.random().toString(36).substr(2, 9)
             });
           });
         });
         toast.success('Nova(s) turma(s) adicionada(s)!');
      }
      setEditingSession(null);
    }
  };

  const handleDelete = () => {
    if (editingSession?.id) {
        if(confirm('Tem certeza que deseja remover este horário?')) {
            deleteClassInStore(editingSession.id);
            setEditingSession(null);
            toast.success('Horário removido com sucesso!');
        }
    }
  };

  const handleToggleBelt = (belt: Belt) => {
    if (!editingSession) return;
    const current = editingSession.allowedBelts || [];
    const internalMod = editingSession.otherModalities || [];
    
    if (!current.includes(belt) && current.length + internalMod.length >= 5) {
      alert("Permitido no máximo 5 modalidades/faixas por horário.");
      return;
    }

    setEditingSession({
      ...editingSession,
      allowedBelts: current.includes(belt) 
        ? current.filter(b => b !== belt) 
        : [...current, belt]
    });
  };

  const handleAddModality = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      const currentMod = editingSession?.otherModalities || [];
      const currentBelts = editingSession?.allowedBelts || [];
      if (currentBelts.length + currentMod.length >= 5) {
        alert("Permitido no máximo 5 modalidades/faixas por horário.");
        return;
      }
      setEditingSession(prev => prev ? ({
        ...prev,
        otherModalities: [...currentMod, val]
      }) : prev);
      e.currentTarget.value = '';
    }
  };

  const removeModality = (index: number) => {
    if (!editingSession) return;
    const current = [...(editingSession.otherModalities || [])];
    current.splice(index, 1);
    setEditingSession({ ...editingSession, otherModalities: current });
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

      <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm flex flex-col overflow-x-auto">
        <div className="w-full grid grid-cols-7 border-b border-krav-border bg-black/[0.02] min-w-[800px]">
          {DAYS.map((day, i) => (
            <div key={day} className={cn("px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-krav-text border-krav-border", i !== 6 && "border-r")}>
              {day}
            </div>
          ))}
        </div>
        
        <div className="w-full grid grid-cols-7 min-w-[800px]">
           {DAYS.map((_, dayIndex) => {
             const dayClasses = getClassesByDay(dayIndex);
             return (
               <div key={dayIndex} className={cn("p-2 border-krav-border flex flex-col gap-2 min-h-full", dayIndex !== 6 && "border-r")}>
                 {dayClasses.map((session) => (
                   <div 
                     key={session.id} 
                     onClick={() => handleEdit(session)}
                     className="group bg-krav-card border border-krav-border p-3 rounded-lg hover:border-krav-accent transition-all cursor-pointer relative overflow-hidden shadow-sm"
                   >
                     <div className="absolute top-0 left-0 w-1 bg-krav-accent h-full opacity-50"></div>
                     {/* Time and details */}
                     <div className="flex justify-between items-start pl-2 mb-2">
                       <div className="flex items-center gap-1 text-krav-text font-bold tracking-tight">
                         <Clock className="w-3.5 h-3.5 text-krav-muted" />
                         {session.time}
                       </div>
                     </div>
                     
                     <p className="text-xs font-medium text-krav-text pl-2 mb-2">{session.name}</p>

                     {/* Tags container */}
                     <div className="pl-2 flex flex-wrap gap-1">
                        {(session.allowedBelts || []).map((belt, idx) => (
                           <div key={`badge-${idx}`}>
                             <BeltBadge belt={belt} className="scale-[0.8] origin-left -ml-1 text-[9px] px-1.5 py-0" />
                           </div>
                        ))}
                        {(session.otherModalities || []).map((mod, i) => (
                           <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#e11d48]/10 text-[#e11d48] border border-[#e11d48]/20 whitespace-nowrap">
                             {mod}
                           </span>
                        ))}
                        {(!session.allowedBelts?.length && !session.otherModalities?.length) && (
                          <span className="text-[10px] text-krav-muted">Sem restrição</span>
                        )}
                     </div>
                     
                     <div className="pl-2 mt-2 pt-2 border-t border-krav-border flex items-center justify-between">
                       <p className="text-[10px] text-krav-muted flex items-center gap-1 w-full truncate">
                         <Users className="w-3 h-3 shrink-0" /> 
                         <span className="truncate">{session.instructorName}</span>
                       </p>
                     </div>
                     
                     {/* Edit Hover */}
                     <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-krav-card p-1 rounded-md shadow-sm border border-krav-border text-krav-accent">
                        <Edit3 className="w-3.5 h-3.5" />
                     </div>
                   </div>
                 ))}
                 
                 {dayClasses.length === 0 && (
                   <div className="h-[100px] flex items-center justify-center p-4">
                     <span className="text-[10px] text-krav-muted text-center italic opacity-40">Livre</span>
                   </div>
                 )}
               </div>
             )
           })}
        </div>
      </div>

      {/* Slideover Panel (Fixed right overlay) */}
      {editingSession && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditingSession(null)}></div>
          <div className="fixed inset-y-0 right-0 max-w-sm w-full flex flex-col bg-krav-card border-l border-krav-border shadow-2xl z-50 animate-in slide-in-from-right duration-300">
             <div className="p-5 border-b border-krav-border bg-black/5 flex justify-between items-center shrink-0">
               <div>
                  <h3 className="font-bold flex items-center gap-2 text-krav-text">
                    <Clock className="w-5 h-5 text-krav-accent" />
                    {editingSession.id ? 'Editar Horário' : 'Novo Horário'}
                  </h3>
                  <p className="text-xs text-krav-muted mt-0.5">Defina as opções desta grade</p>
               </div>
               <button onClick={() => setEditingSession(null)} className="text-krav-muted hover:text-krav-danger p-1">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <form onSubmit={handleSave} className="p-5 flex-1 overflow-y-auto flex flex-col gap-6 bg-krav-bg">
                <div>
                  <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Nome da Aula</label>
                  <input type="text" value={editingSession.name} onChange={e => setEditingSession({...editingSession, name: e.target.value})} className="w-full bg-krav-card text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none" required />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Dias da Semana</label>
                     <div className="flex flex-wrap gap-2">
                       {DAYS.map((day, i) => {
                         const isSelected = editingSession.daysOfWeek.includes(i);
                         return (
                           <button
                             type="button"
                             key={i}
                             onClick={() => {
                               const arr = [...editingSession.daysOfWeek];
                               if (isSelected) {
                                 setEditingSession({ ...editingSession, daysOfWeek: arr.filter(d => d !== i) });
                               } else {
                                 setEditingSession({ ...editingSession, daysOfWeek: [...arr, i] });
                               }
                             }}
                             className={cn(
                               "px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors",
                               isSelected ? "bg-krav-accent text-white border-krav-accent" : "bg-krav-card text-krav-text border-krav-border hover:border-krav-muted"
                             )}
                           >
                             {day.substring(0,3)}
                           </button>
                         )
                       })}
                     </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Horários</label>
                    <div className="flex gap-2 mb-2">
                       <input 
                         type="time" 
                         value={editingSession.newTimeInput || ''} 
                         onChange={e => setEditingSession({...editingSession, newTimeInput: e.target.value})} 
                         className="flex-1 bg-krav-card text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none font-medium" 
                       />
                       <button
                         type="button"
                         onClick={() => {
                           if (editingSession.newTimeInput && !editingSession.times.includes(editingSession.newTimeInput)) {
                             setEditingSession({
                               ...editingSession, 
                               times: [...editingSession.times, editingSession.newTimeInput],
                               newTimeInput: ''
                             });
                           }
                         }}
                         className="bg-krav-card border border-krav-border text-krav-text font-bold px-4 rounded-lg hover:bg-black/5"
                       >
                         Add
                       </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editingSession.times.map((t, idx) => (
                        <span key={idx} className="bg-krav-bg border border-krav-border px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                          {t}
                          <button type="button" onClick={() => setEditingSession({...editingSession, times: editingSession.times.filter((_, i) => i !== idx)})} className="text-krav-danger hover:text-red-700 p-0.5"><X className="w-3 h-3"/></button>
                        </span>
                      ))}
                      {editingSession.times.length === 0 && (
                        <span className="text-[10px] text-krav-muted italic">Nenhum horário adicionado.</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Duração (min)</label>
                    <input type="number" value={editingSession.durationMinutes} onChange={e => setEditingSession({...editingSession, durationMinutes: parseInt(e.target.value)})} className="w-full bg-krav-card text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none font-medium" required />
                  </div>
                </div>

                <div className="pt-2 border-t border-krav-border">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold text-krav-text uppercase tracking-wider">Faixas Permitidas</label>
                    <span className="text-[10px] bg-black/5 px-2 py-0.5 rounded-full font-bold text-krav-muted">{(editingSession.allowedBelts?.length || 0) + (editingSession.otherModalities?.length || 0)} / 5 Max</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ALL_BELTS.map(belt => {
                      const isSelected = editingSession.allowedBelts?.includes(belt);
                      return (
                        <div 
                          key={belt} 
                          onClick={() => handleToggleBelt(belt)}
                          className={cn(
                            "cursor-pointer transition-all border rounded-lg overflow-hidden flex items-center p-1",
                            isSelected ? "border-krav-accent bg-krav-accent/5 ring-1 ring-krav-accent" : "border-krav-border bg-krav-card hover:border-krav-muted opacity-60"
                          )}
                        >
                          <BeltBadge belt={belt} className={cn("scale-90 origin-left -ml-1 transition-transform", isSelected ? "opacity-100" : "opacity-70")} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Outras Modalidades</label>
                   <p className="text-[10px] text-krav-muted mb-2">Digite o nome da aula e aperte ENTER (ex: Muay Thai, Funcional)</p>
                   <input type="text" onKeyDown={handleAddModality} placeholder="Ex: Jiu-Jitsu + Enter" className="w-full bg-krav-card text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none mb-3" />
                   
                   {editingSession.otherModalities && editingSession.otherModalities.length > 0 && (
                     <div className="flex border border-krav-border gap-2 flex-wrap bg-krav-card p-3 rounded-lg min-h-[40px]">
                       {editingSession.otherModalities.map((mod, index) => (
                         <div key={index} className="flex items-center gap-1.5 bg-[#e11d48]/10 text-[#e11d48] border border-[#e11d48]/20 px-2 py-1 rounded text-xs font-bold">
                           {mod}
                           <button type="button" onClick={() => removeModality(index)} className="hover:text-red-700">
                             <X className="w-3 h-3" />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                </div>

                <div className="mt-auto pt-6 flex gap-3">
                  <button type="submit" className="flex-1 bg-krav-accent text-white font-bold py-3 text-sm rounded-xl hover:bg-krav-accent-light transition-colors flex items-center justify-center gap-2 shadow-md">
                    <Save className="w-4 h-4" /> Salvar
                  </button>
                  {editingSession.id && (
                     <button type="button" onClick={handleDelete} className="p-3 border border-krav-danger text-krav-danger rounded-xl hover:bg-krav-danger hover:text-white transition-colors shadow-sm">
                       <Trash2 className="w-4 h-4" />
                     </button>
                  )}
                </div>
             </form>
          </div>
        </>
      )}
    </div>
  );
}
