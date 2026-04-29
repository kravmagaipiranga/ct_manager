import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { Belt } from '../../types';
import { ArrowLeft, Check, X, Trash2 } from 'lucide-react';
import { BeltBadge } from '../../components/shared/BeltBadge';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const VALID_DAYS = [
  { label: 'Segunda', index: 1 },
  { label: 'Terça', index: 2 },
  { label: 'Quarta', index: 3 },
  { label: 'Quinta', index: 4 },
  { label: 'Sábado', index: 6 }
];
const BELTS: Belt[] = ['WHITE', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'BROWN', 'BLACK'];

export default function ScheduleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const isEditing = Boolean(id);
  const addClass = useDataStore((state) => state.addClass);
  const updateClass = useDataStore((state) => state.updateClass);
  const deleteClass = useDataStore((state) => state.deleteClass);
  const classes = useDataStore((state) => state.classes);
  const students = useDataStore((state) => state.students);

  const instructorsList = students.filter(s => s.role === 'INSTRUCTOR' && s.academyId === user?.academyId);

  const [formData, setFormData] = useState({
    name: '',
    instructorId: user?.id || '',
    instructorName: user?.name || '',
    daysOfWeek: [] as number[],
    times: [] as string[],
    newTimeInput: '',
    capacity: 20,
    allowedBelts: [] as Belt[],
    otherModalities: [] as string[]
  });

  useEffect(() => {
    if (isEditing && id) {
      const cls = classes.find(s => s.id === id);
      if (cls) {
        setFormData({
          name: cls.name,
          instructorId: cls.instructorId,
          instructorName: cls.instructorName,
          daysOfWeek: [cls.dayOfWeek], // cls.dayOfWeek is a number
          times: [cls.time], // cls.time is a string
          newTimeInput: '',
          capacity: cls.capacity || 20,
          allowedBelts: cls.allowedBelts || [],
          otherModalities: cls.otherModalities || []
        });
      } else {
        navigate('/admin/schedule');
      }
    }
  }, [id, isEditing, classes, navigate]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.daysOfWeek.length === 0) {
      alert("Selecione ao menos um dia da semana.");
      return;
    }
    if (formData.times.length === 0) {
      alert("Adicione ao menos um horário.");
      return;
    }

    const basePayload = {
      academyId: user?.academyId || '',
      name: formData.name,
      instructorId: formData.instructorId,
      instructorName: formData.instructorName,
      capacity: formData.capacity,
      allowedBelts: formData.allowedBelts,
      otherModalities: formData.otherModalities,
      durationMinutes: 60
    };

    if (isEditing && id) {
        // Just update the first combination selected to match the id
        updateClass(id, {
            ...basePayload,
            dayOfWeek: formData.daysOfWeek[0],
            time: formData.times[0]
        });
        
        // Add remaining combinations
        formData.daysOfWeek.forEach((day, dIdx) => {
            formData.times.forEach((time, tIdx) => {
                if (dIdx === 0 && tIdx === 0) return; // Skip the one we updated
                addClass({
                    id: Math.random().toString(36).substr(2, 9),
                    ...basePayload,
                    dayOfWeek: day,
                    time: time
                } as any);
            });
        });
        toast.success('Aula atualizada com sucesso!');
    } else {
        // Add all combinations
        formData.daysOfWeek.forEach((day) => {
            formData.times.forEach((time) => {
                addClass({
                    id: Math.random().toString(36).substr(2, 9),
                    ...basePayload,
                    dayOfWeek: day,
                    time: time
                } as any);
            });
        });
        toast.success('Aula criada com sucesso!');
    }
    navigate('/admin/schedule');
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta aula?')) {
      deleteClass(id!);
      toast.success('Aula excluída.');
      navigate('/admin/schedule');
    }
  };

  const internalBelts = formData.allowedBelts || [];
  const internalMod = formData.otherModalities || [];
  
  const handleToggleBelt = (belt: Belt) => {
     if (internalBelts.includes(belt)) {
        setFormData({ ...formData, allowedBelts: internalBelts.filter(b => b !== belt) });
     } else {
        if (internalBelts.length + internalMod.length >= 5) {
           alert("Máximo de 5 tags permitidas (Faixas + Modalidades).");
           return;
        }
        setFormData({ ...formData, allowedBelts: [...internalBelts, belt] });
     }
  };

  const handleAddModality = (e: React.KeyboardEvent<HTMLInputElement>) => {
     if (e.key === 'Enter') {
        e.preventDefault();
        const val = e.currentTarget.value.trim();
        if (val) {
           if (internalBelts.length + internalMod.length >= 5) {
               alert("Máximo de 5 tags permitidas (Faixas + Modalidades).");
               return;
           }
           setFormData({
              ...formData,
              otherModalities: [...internalMod, val]
           });
           e.currentTarget.value = '';
        }
     }
  };

  const removeModality = (index: number) => {
    const current = [...(internalMod)];
    current.splice(index, 1);
    setFormData({ ...formData, otherModalities: current });
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/schedule')}
          className="p-2 hover:bg-black/20 rounded-lg text-krav-muted hover:text-krav-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">
            {isEditing ? 'Editar Aula' : 'Nova Aula'}
          </h1>
          <p className="text-sm text-krav-muted mt-1">Defina os horários, modalidades e requisitos desta aula.</p>
        </div>
      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden p-6 md:p-8">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Nome da Aula</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none" required placeholder="Ex: Krav Maga Iniciantes" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Instrutor da Turma</label>
              <select 
                value={formData.instructorId || ''} 
                onChange={e => {
                  const id = e.target.value;
                  const inst = students.find(s => s.id === id);
                  setFormData({...formData, instructorId: id, instructorName: inst ? inst.name : ''});
                }} 
                className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none font-medium text-krav-text"
              >
                <option value="">Selecione o Instrutor</option>
                {instructorsList.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>

            <div>
               <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Vagas por Aula</label>
               <input type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none" required />
            </div>
            
            <div className="md:col-span-2 pt-4 border-t border-krav-border">
               <label className="block text-xs font-bold text-krav-text mb-3 uppercase tracking-wider">Dias da Semana</label>
               <div className="flex flex-wrap gap-2">
                 {VALID_DAYS.map((day) => {
                   const isSelected = formData.daysOfWeek.includes(day.index);
                   return (
                     <button
                       type="button"
                       key={day.index}
                       onClick={() => {
                         const arr = [...formData.daysOfWeek];
                         if (isSelected) {
                           setFormData({ ...formData, daysOfWeek: arr.filter(d => d !== day.index) });
                         } else {
                           setFormData({ ...formData, daysOfWeek: [...arr, day.index] });
                         }
                       }}
                       className={cn(
                         "px-4 py-2 rounded-lg text-sm font-bold border transition-colors",
                         isSelected ? "bg-krav-accent text-white border-krav-accent" : "bg-krav-bg text-krav-text border-krav-border hover:border-krav-muted hover:bg-black/5"
                       )}
                     >
                       {day.label}
                     </button>
                   )
                 })}
               </div>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-krav-border">
              <label className="block text-xs font-bold text-krav-text mb-3 uppercase tracking-wider">Horários</label>
              <div className="flex gap-2 max-w-sm">
                 <input 
                   type="time" 
                   value={formData.newTimeInput || ''} 
                   onChange={e => setFormData({...formData, newTimeInput: e.target.value})} 
                   className="flex-1 bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none font-medium text-krav-text" 
                   style={{ colorScheme: 'dark' }}
                 />
                 <button
                   type="button"
                   onClick={() => {
                     if (formData.newTimeInput && !formData.times.includes(formData.newTimeInput)) {
                       setFormData({
                         ...formData, 
                         times: [...formData.times, formData.newTimeInput],
                         newTimeInput: ''
                       });
                     }
                   }}
                   className="bg-krav-bg border border-krav-border text-krav-text font-bold px-4 rounded-lg hover:bg-black/10 transition-colors shadow-sm"
                 >
                   Adicionar
                 </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.times.map((t, idx) => (
                  <span key={idx} className="bg-krav-bg border border-krav-border px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                    {t}
                    <button type="button" onClick={() => setFormData({...formData, times: formData.times.filter((_, i) => i !== idx)})} className="text-krav-danger hover:text-red-400 p-0.5"><X className="w-4 h-4"/></button>
                  </span>
                ))}
                {formData.times.length === 0 && (
                  <div className="text-xs text-krav-muted">Nenhum horário adicionado.</div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-krav-border">
              <div className="flex w-full items-center justify-between mb-3">
                 <h4 className="font-bold text-xs text-krav-accent uppercase tracking-wider">Requisitos da Turma</h4>
                 <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full font-bold text-krav-muted">{(internalBelts.length) + (internalMod.length)} / 5 Max</span>
              </div>
              <p className="text-xs text-krav-muted mb-4">Especifique as faixas ou modalidades para esta aula se houver requisitos.</p>

              <div className="flex flex-wrap gap-2 mb-6">
                 {BELTS.map(belt => {
                    const isSelected = internalBelts.includes(belt);
                    return (
                       <button
                         type="button"
                         key={belt}
                         onClick={() => handleToggleBelt(belt)}
                         className={cn(
                           "p-1 rounded-lg border-2 transition-all",
                           isSelected ? "border-krav-accent bg-krav-accent/10" : "border-krav-border bg-krav-bg hover:border-krav-muted"
                         )}
                       >
                         <BeltBadge belt={belt} />
                       </button>
                    )
                 })}
              </div>

              <div>
                <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Outras Modalidades</label>
                <input type="text" onKeyDown={handleAddModality} placeholder="Ex: Jiu-Jitsu + Pressione Enter" className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none mb-3" />
                {internalMod.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                    {internalMod.map((mod, index) => (
                        <div key={index} className="flex bg-black/20 text-krav-text text-xs px-2 py-1 rounded gap-1 items-center font-bold">
                            {mod}
                            <button type="button" onClick={() => removeModality(index)} className="hover:text-krav-danger">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    </div>
                )}
              </div>
            </div>
            
          </div>

          <div className="mt-8 pt-6 border-t border-krav-border flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-krav-danger hover:text-red-400 hover:bg-krav-danger/10 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Aula
              </button>
            ) : (
              <div></div>
            )}
            
            <div className="flex gap-3">
               <button
                  type="button"
                  onClick={() => navigate('/admin/schedule')}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-krav-muted hover:text-krav-text hover:bg-black/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-krav-accent hover:bg-krav-accent-light text-white px-6 py-2 rounded-lg font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Check className="w-5 h-5" /> {isEditing ? 'Salvar Mudanças' : 'Criar Aula'}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
