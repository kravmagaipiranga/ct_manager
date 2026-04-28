import React, { useState, useEffect } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { BeltBadge } from '../../components/shared/BeltBadge';
import { BookOpen, Check, Calendar, CheckSquare, ListTodo, ClipboardEdit } from 'lucide-react';
import { Belt } from '../../types';
import { cn } from '../../lib/utils';

const BELTS: Belt[] = ['WHITE', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'BROWN', 'BLACK'];

export default function Curriculum() {
  const curriculumTexts = useDataStore((state) => state.curriculumTexts);
  const updateCurriculumText = useDataStore((state) => state.updateCurriculumText);
  const classes = useDataStore((state) => state.classes);
  const addClassLog = useDataStore((state) => state.addClassLog);
  const classLogs = useDataStore((state) => state.classLogs);
  
  const [activeTab, setActiveTab] = useState<'TEMPLATE' | 'LOGS'>('TEMPLATE');
  const [activeBelt, setActiveBelt] = useState<Belt>('WHITE');
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // LOGS State
  const [logDate, setLogDate] = useState(() => {
    const dt = new Date();
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  });
  const [logClassId, setLogClassId] = useState('');
  const [checkedTechniques, setCheckedTechniques] = useState<string[]>([]);
  const [isLogSaved, setIsLogSaved] = useState(false);

  useEffect(() => {
    setContent(curriculumTexts[activeBelt] || '');
    setIsSaved(false);
  }, [activeBelt, curriculumTexts]);

  // Derived Classes for the selected Log Date
  const parsedDayOfWeek = new Date(logDate + 'T12:00:00').getDay();
  const availableClasses = classes.filter(c => c.dayOfWeek === parsedDayOfWeek);

  // If the currently selected class is not in the available classes for the new date, reset it
  useEffect(() => {
    if (availableClasses.length > 0 && !availableClasses.find(c => c.id === logClassId)) {
      setLogClassId(availableClasses[0].id);
    } else if (availableClasses.length === 0) {
      setLogClassId('');
    }
  }, [logDate, availableClasses, logClassId]);

  const handleSaveTemplate = () => {
    updateCurriculumText(activeBelt, content);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveLog = () => {
    if (!logClassId) return;
    addClassLog({
      dateStr: logDate,
      classId: logClassId,
      belt: activeBelt,
      techniques: checkedTechniques
    });
    setCheckedTechniques([]);
    setIsLogSaved(true);
    setTimeout(() => setIsLogSaved(false), 2000);
  };

  const toggleTechnique = (tech: string) => {
    setCheckedTechniques(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const beltLines = (curriculumTexts[activeBelt] || '').split('\n').filter(l => l.trim() !== '');

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col">
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Gestão de Currículo</h1>
          <p className="text-sm text-krav-muted mt-1">Defina as as matérias e marque o que foi ministrado.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-krav-border mb-6 shrink-0">
        <button 
          onClick={() => setActiveTab('TEMPLATE')}
          className={cn("pb-3 px-2 text-sm font-semibold transition-colors duration-200 border-b-2 flex items-center gap-2", 
            activeTab === 'TEMPLATE' ? 'border-krav-accent text-krav-accent' : 'border-transparent text-krav-muted hover:text-krav-text'
          )}
        >
          <BookOpen className="w-4 h-4" /> Gabarito Geral
        </button>
        <button 
          onClick={() => setActiveTab('LOGS')}
          className={cn("pb-3 px-2 text-sm font-semibold transition-colors duration-200 border-b-2 flex items-center gap-2", 
            activeTab === 'LOGS' ? 'border-krav-accent text-krav-accent' : 'border-transparent text-krav-muted hover:text-krav-text'
          )}
        >
          <ClipboardEdit className="w-4 h-4" /> Matérias Ministradas
        </button>
      </div>

      <div className="flex flex-col gap-6 max-w-4xl border border-krav-border rounded-xl bg-krav-card p-4 sm:p-6 shadow-sm mb-8">
        
        {/* Belt filter logic that is common */}
        <div className="flex flex-wrap gap-2 justify-center w-full border-b border-krav-border pb-4 shrink-0">
          {BELTS.map(belt => (
            <button
              key={belt}
              onClick={() => setActiveBelt(belt)}
              className={`transition-all rounded-lg p-1.5 border-2 ${activeBelt === belt ? 'border-krav-accent bg-krav-accent/5' : 'border-transparent hover:bg-black/5 opacity-60'}`}
            >
              <BeltBadge belt={belt} />
            </button>
          ))}
        </div>

        {activeTab === 'TEMPLATE' && (
          <div className="flex flex-col relative w-full">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-sm text-krav-text">Matérias Oficiais da Faixa</h3>
               <button 
                 onClick={handleSaveTemplate}
                 className="bg-krav-accent hover:bg-krav-accent-light text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shrink-0"
               >
                 <Check className="w-4 h-4" />
                 {isSaved ? 'Salvo!' : 'Salvar Alterações'}
               </button>
            </div>
            
            <textarea 
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setIsSaved(false);
              }}
              placeholder="Digite as técnicas. Use uma linha para cada técnica..."
              className="w-full min-h-[400px] p-4 bg-krav-bg border border-krav-border rounded-xl resize-y focus:outline-none focus:border-krav-accent focus:ring-1 focus:ring-krav-accent leading-relaxed text-sm font-medium text-krav-text"
            />
            {!content && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-30 mt-10">
                <BookOpen className="w-12 h-12 mb-3" />
                <p className="font-bold">Nenhuma técnica mapeada nesta faixa.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="flex flex-col w-full">
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 shrink-0 bg-krav-bg p-4 rounded-xl border border-krav-border">
                <div className="flex flex-col gap-1.5">
                   <label className="text-xs font-bold text-krav-text uppercase tracking-wider">Data da Aula</label>
                   <input 
                     type="date" 
                     value={logDate} 
                     onChange={(e) => setLogDate(e.target.value)} 
                     className="w-full bg-krav-card border border-krav-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-krav-accent transition-colors"
                   />
                </div>
                <div className="flex flex-col gap-1.5">
                   <label className="text-xs font-bold text-krav-text uppercase tracking-wider">Horário / Aula</label>
                   <select 
                     value={logClassId} 
                     onChange={(e) => setLogClassId(e.target.value)}
                     className="w-full bg-krav-card border border-krav-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-krav-accent transition-colors"
                     disabled={availableClasses.length === 0}
                   >
                     {availableClasses.length === 0 ? (
                       <option value="">Sem aulas programadas neste dia</option>
                     ) : (
                       availableClasses.map(c => (
                         <option key={c.id} value={c.id}>{c.time} - {c.name}</option>
                       ))
                     )}
                   </select>
                </div>
             </div>

             <div className="mb-4 border border-krav-border rounded-xl bg-krav-card shadow-sm flex flex-col">
                <div className="bg-black/5 px-4 py-3 border-b border-krav-border shrink-0">
                  <h3 className="font-bold text-sm tracking-widest uppercase text-krav-muted">O que foi ministrado nesta faixa?</h3>
                </div>
                
                {beltLines.length > 0 ? (
                  <div className="flex flex-col divide-y divide-krav-border">
                    {beltLines.map((technique, idx) => {
                      const isChecked = checkedTechniques.includes(technique);
                      return (
                        <div 
                          key={idx} 
                          onClick={() => toggleTechnique(technique)}
                          className={cn(
                            "px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors hover:bg-black/[0.02]",
                            isChecked ? "bg-krav-accent/5 hover:bg-krav-accent/10" : ""
                          )}
                        >
                           <div className={cn(
                             "w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                             isChecked ? "bg-krav-accent border-krav-accent text-white" : "border-krav-border text-transparent"
                           )}>
                              <Check className="w-3.5 h-3.5" />
                           </div>
                           <h4 className={cn("text-sm font-medium", isChecked ? "text-krav-accent" : "text-krav-text")}>
                             {technique}
                           </h4>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-krav-muted">
                    Sem currículo cadastrado para esta faixa. Vá na guia "Gabarito Geral".
                  </div>
                )}
             </div>

             <div className="flex justify-end shrink-0">
                <button 
                  onClick={handleSaveLog}
                  disabled={checkedTechniques.length === 0 || !logClassId}
                  className={cn("px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors", 
                    (checkedTechniques.length === 0 || !logClassId) 
                      ? "bg-krav-bg text-krav-muted border border-krav-border cursor-not-allowed" 
                      : "bg-krav-accent text-white hover:bg-krav-accent-light"
                  )}
                >
                  <CheckSquare className="w-4 h-4" />
                  {isLogSaved ? 'Matérias Registradas!' : 'Registrar Presença de Currículo'}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
