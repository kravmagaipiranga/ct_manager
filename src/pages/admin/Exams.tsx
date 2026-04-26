import React, { useState } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Calendar as CalendarIcon, Users, Check, X, Medal, Search, UserCheck, Download } from 'lucide-react';
import { AcademyEvent } from '../../types';
import { cn } from '../../lib/utils';
import { BeltBadge } from '../../components/shared/BeltBadge';
import { ContactActions } from '../../components/shared/ContactActions';
import { exportToCSV } from '../../lib/csv';

export default function Exams() {
  const user = useAuthStore((state) => state.user);
  const events = useDataStore((state) => state.events);
  const allStudents = useDataStore((state) => state.students);
  const updateEvent = useDataStore((state) => state.updateEvent);
  
  const students = React.useMemo(() => {
    if (user?.role === 'INSTRUCTOR') {
      return allStudents.filter(s => s.instructorId === user.id);
    }
    return allStudents;
  }, [allStudents, user]);

  // Filter only exams
  const exams = events.filter(e => e.type === 'EXAM');

  const [managingExam, setManagingExam] = useState<AcademyEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleStudent = (studentId: string) => {
     if (!managingExam) return;
     const currentAllowed = managingExam.allowedStudentIds || [];
     const isAllowed = currentAllowed.includes(studentId);
     
     const newAllowed = isAllowed 
       ? currentAllowed.filter(id => id !== studentId)
       : [...currentAllowed, studentId];
       
     updateEvent(managingExam.id, { allowedStudentIds: newAllowed });
     setManagingExam({...managingExam, allowedStudentIds: newAllowed});
  };

  const filteredStudents = students.filter(s => 
     s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExport = () => {
    exportToCSV(
      exams,
      [
        { header: 'Título', key: 'title' },
        { header: 'Data', key: 'date' },
        { header: 'Vagas Totais', key: 'capacity' },
        { header: 'Inscritos', key: 'registeredCount' },
        { header: 'Preço (R$)', key: 'price' }
      ],
      'Relatorio_Exames_Faixa'
    );
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-full bg-krav-bg relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Gestão de Exames de Faixa</h1>
          <p className="text-sm text-krav-muted mt-1">Acompanhe as inscrições, datas e alunos habilitados.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-krav-card border border-krav-border text-krav-text hover:bg-black/5 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar CSV</span>
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            {exams.map(exam => (
              <div key={exam.id} className="bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-krav-accent h-full opacity-50"></div>
                <div className="flex justify-between items-start pl-2">
                   <div className="flex flex-col">
                     <h3 className="font-bold text-lg leading-tight text-krav-text">{exam.title}</h3>
                     <div className="flex items-center gap-1.5 mt-2">
                       <Medal className="w-4 h-4 text-krav-accent" />
                       <span className="text-xs font-semibold text-krav-text uppercase tracking-wider">Exame de Graduação</span>
                     </div>
                   </div>
                </div>
                
                <div className="pl-2 flex-col flex gap-2">
                   <p className="text-xs text-krav-muted line-clamp-2">{exam.description}</p>
                   <p className="text-[10px] text-krav-muted font-bold mt-1 bg-krav-bg self-start px-2 py-1 rounded">
                     {(exam.allowedStudentIds || []).length} alunos liberados
                   </p>
                </div>

                <div className="mt-auto pt-4 border-t border-krav-border grid grid-cols-2 gap-3 pl-2">
                   <div className="bg-krav-bg px-3 py-2 rounded-lg flex flex-col gap-1">
                     <span className="text-[10px] uppercase font-bold text-krav-muted tracking-wide flex items-center gap-1">
                       <CalendarIcon className="w-3 h-3" /> Data
                     </span>
                     <span className="text-xs font-bold text-krav-text">
                       {new Date(exam.date).toLocaleDateString('pt-BR')} às {new Date(exam.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'})}
                     </span>
                   </div>
                   
                   <div className="bg-krav-bg px-3 py-2 rounded-lg flex flex-col gap-1">
                     <span className="text-[10px] uppercase font-bold text-krav-muted tracking-wide flex items-center gap-1">
                       <Users className="w-3 h-3" /> Inscritos
                     </span>
                     <span className="text-xs font-bold text-krav-text">
                       {exam.registeredCount} de {exam.capacity || 50}
                     </span>
                   </div>
                </div>

                <div className="pl-2 mt-4">
                   <button onClick={() => setManagingExam(exam)} className="w-full py-2 bg-krav-accent/10 hover:bg-krav-accent hover:text-white text-krav-accent transition-colors rounded-lg text-sm font-bold border border-krav-accent/20">
                      Liberar Alunos
                   </button>
                </div>
              </div>
            ))}

            {exams.length === 0 && (
               <div className="col-span-full py-12 text-center text-sm text-krav-muted border border-dashed border-krav-border rounded-xl bg-krav-card">
                 Nenhum exame de graduação agendado no momento. <br/><span className="text-xs opacity-70">Crie um através do menu "Eventos Gerais".</span>
               </div>
            )}
          </div>
        </div>

       {/* Form Panel for Managing Exam Eligibility */}
       {managingExam && (
         <div className="flex-1 max-w-sm w-full shrink-0 flex flex-col bg-krav-card border border-krav-border rounded-xl shadow-sm h-full overflow-hidden">
            <div className="p-5 border-b border-krav-border bg-black/5 flex justify-between items-center shrink-0">
               <div>
                  <h3 className="font-bold flex items-center gap-2 text-krav-text text-lg">
                    <UserCheck className="w-5 h-5 text-krav-accent" />
                    Liberar Inscrição
                  </h3>
                  <p className="text-xs text-krav-muted mt-0.5 max-w-[300px] truncate">{managingExam.title}</p>
               </div>
               <button onClick={() => setManagingExam(null)} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-krav-text" />
               </button>
            </div>

            <div className="p-4 border-b border-krav-border shrink-0">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-krav-muted" />
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Buscar alunos por nome..." 
                   className="w-full bg-krav-bg border border-krav-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:border-krav-accent outline-none transition-colors"
                 />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
               {filteredStudents.map(student => {
                 const isAllowed = (managingExam.allowedStudentIds || []).includes(student.id);
                 return (
                   <div key={student.id} className="flex items-center justify-between p-3 bg-krav-card border border-krav-border rounded-lg hover:border-krav-accent/50 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-krav-bg rounded-md flex items-center justify-center font-bold text-krav-muted text-xs uppercase shrink-0">
                         {student.name.substring(0, 2)}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-krav-text leading-tight">{student.name}</p>
                         <BeltBadge belt={student.beltLevel} className="mt-1 scale-90 origin-left" />
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       <ContactActions phone={student.phone} email={student.email} iconOnly={true} />
                       <button 
                         onClick={() => handleToggleStudent(student.id)}
                         className={cn(
                           "px-4 py-1.5 rounded-md text-xs font-bold transition-colors border",
                           isAllowed 
                             ? "bg-krav-accent/10 border-krav-accent/20 text-krav-accent hover:bg-krav-accent hover:text-white"
                             : "bg-krav-bg border-krav-border text-krav-muted hover:bg-krav-accent/10 hover:text-krav-accent hover:border-krav-accent/20"
                         )}
                       >
                         {isAllowed ? 'Liberado' : 'Liberar'}
                       </button>
                     </div>
                   </div>
                 )
               })}
               
               {filteredStudents.length === 0 && (
                  <div className="py-10 text-center text-sm text-krav-muted">
                     Nenhum aluno encontrado.
                  </div>
               )}
            </div>

         </div>
       )}
      </div>
    </div>
  );
}
