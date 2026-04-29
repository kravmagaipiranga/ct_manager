import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowLeft, Search, UserCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BeltBadge } from '../../components/shared/BeltBadge';
import { ContactActions } from '../../components/shared/ContactActions';

export default function ExamStudentsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const allEvents = useDataStore((state) => state.events);
  const exam = allEvents.find(e => e.id === id && e.type === 'EXAM');
  const updateEvent = useDataStore((state) => state.updateEvent);
  const allStudents = useDataStore((state) => state.students);

  const [searchTerm, setSearchTerm] = useState('');

  if (!exam) {
    navigate('/admin/exams');
    return null;
  }

  const students = React.useMemo(() => {
    const actStudents = allStudents.filter(s => s.academyId === user?.academyId);
    return user?.role === 'INSTRUCTOR' 
      ? actStudents.filter(s => s.instructorId === user.id)
      : actStudents;
  }, [allStudents, user]);

  const filteredStudents = students.filter(s => 
     s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleStudent = (studentId: string) => {
     const currentAllowed = exam.allowedStudentIds || [];
     const isAllowed = currentAllowed.includes(studentId);
     
     const newAllowed = isAllowed 
       ? currentAllowed.filter(sId => sId !== studentId)
       : [...currentAllowed, studentId];
       
     updateEvent(exam.id, { allowedStudentIds: newAllowed });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/exams')}
          className="p-2 hover:bg-black/20 rounded-lg text-krav-muted hover:text-krav-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">
            Liberar Inscrição
          </h1>
          <p className="text-sm text-krav-accent bg-krav-accent/10 px-2 flex inline-block w-fit mt-2 rounded">{exam.title}</p>
        </div>
      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden h-[600px] flex flex-col">
          <div className="p-4 border-b border-krav-border shrink-0 bg-krav-bg/50">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-krav-muted" />
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 placeholder="Buscar alunos por nome..." 
                 className="w-full bg-krav-bg border border-krav-border rounded-lg pl-9 pr-4 py-3 text-sm focus:border-krav-accent outline-none transition-colors"
               />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
             {filteredStudents.map(student => {
               const isAllowed = (exam.allowedStudentIds || []).includes(student.id);
               return (
                 <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-krav-bg border border-krav-border rounded-lg hover:border-krav-accent/50 transition-colors gap-4">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-krav-card border border-krav-border rounded-md flex items-center justify-center font-bold text-krav-muted text-xs uppercase shrink-0">
                       {student.name.substring(0, 2)}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-krav-text leading-tight">{student.name}</p>
                       <BeltBadge belt={student.beltLevel} className="mt-1.5 scale-90 origin-left" />
                     </div>
                   </div>
                   <div className="flex items-center gap-3 justify-end sm:justify-start">
                     <ContactActions phone={student.phone} email={student.email} iconOnly={true} />
                     <button 
                       onClick={() => handleToggleStudent(student.id)}
                       className={cn(
                         "px-6 py-2 rounded-lg text-sm font-bold transition-colors border shadow-sm flex items-center gap-2",
                         isAllowed 
                           ? "bg-krav-accent/10 border-krav-accent text-krav-accent hover:bg-krav-accent hover:text-white"
                           : "bg-krav-card border-krav-border text-krav-muted hover:bg-krav-accent/10 hover:text-krav-accent hover:border-krav-accent"
                       )}
                     >
                       {isAllowed ? <><UserCheck className="w-4 h-4" /> Liberado</> : 'Liberar Aluno'}
                     </button>
                   </div>
                 </div>
               )
             })}
             
             {filteredStudents.length === 0 && (
                <div className="py-12 text-center text-sm text-krav-muted border border-dashed border-krav-border rounded-xl">
                   Nenhum aluno encontrado.
                </div>
             )}
          </div>
      </div>
    </div>
  );
}
