import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Calendar as CalendarIcon, Users, Check, X, Medal, Search, UserCheck, Download } from 'lucide-react';
import { AcademyEvent } from '../../types';
import { cn } from '../../lib/utils';
import { BeltBadge } from '../../components/shared/BeltBadge';
import { ContactActions } from '../../components/shared/ContactActions';
import { exportToCSV } from '../../lib/csv';
import { Pagination } from '../../components/shared/Pagination';

export default function Exams() {
  const user = useAuthStore((state) => state.user);
  const allEvents = useDataStore((state) => state.events);
  
  const events = React.useMemo(() => allEvents.filter(e => e.academyId === user?.academyId), [allEvents, user]);
  const allStudents = useDataStore((state) => state.students);
  const updateEvent = useDataStore((state) => state.updateEvent);
  
  const students = React.useMemo(() => {
    if (user?.role === 'INSTRUCTOR') {
      return allStudents.filter(s => s.instructorId === user.id);
    }
    return allStudents;
  }, [allStudents, user]);

  // Filter only exams
  const exams = React.useMemo(() => events.filter(e => e.type === 'EXAM'), [events]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const paginatedExams = React.useMemo(() => {
    return exams.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [exams, currentPage]);

  const totalPages = Math.ceil(exams.length / ITEMS_PER_PAGE) || 1;

  const navigate = useNavigate();

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
    <div className="p-6 md:p-8 flex flex-col bg-krav-bg relative">
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

      <div className="flex flex-col gap-6 mb-8 flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto min-h-0 bg-krav-card rounded-xl border border-krav-border shadow-sm flex flex-col">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
            {paginatedExams.map(exam => (
              <div key={exam.id} className="bg-krav-bg border border-krav-border rounded-xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden group h-fit">
                <div className="absolute top-0 left-0 w-1 bg-krav-accent h-full opacity-50"></div>
                <div className="flex justify-between items-start pl-2">
                   <div className="flex flex-col">
                     <h3 className="font-bold text-lg leading-tight text-krav-text group-hover:text-krav-accent transition-colors">{exam.title}</h3>
                     <div className="flex items-center gap-1.5 mt-2">
                       <Medal className="w-4 h-4 text-krav-accent" />
                       <span className="text-xs font-semibold text-krav-text uppercase tracking-wider">Exame de Graduação</span>
                     </div>
                   </div>
                </div>
                
                <div className="pl-2 flex-col flex gap-2">
                   <p className="text-xs text-krav-muted line-clamp-2">{exam.description}</p>
                   <p className="text-[10px] text-krav-muted font-bold mt-1 bg-krav-card self-start px-2 py-1 rounded border border-krav-border">
                     {(exam.allowedStudentIds || []).length} alunos liberados
                   </p>
                </div>

                <div className="mt-auto pt-4 border-t border-krav-border grid grid-cols-2 gap-3 pl-2">
                   <div className="bg-krav-card border border-krav-border px-3 py-2 rounded-lg flex flex-col gap-1">
                     <span className="text-[10px] uppercase font-bold text-krav-muted tracking-wide flex items-center gap-1">
                       <CalendarIcon className="w-3 h-3" /> Data
                     </span>
                     <span className="text-xs font-bold text-krav-text">
                       {new Date(exam.date).toLocaleDateString('pt-BR')} às {new Date(exam.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'})}
                     </span>
                   </div>
                   
                   <div className="bg-krav-card border border-krav-border px-3 py-2 rounded-lg flex flex-col gap-1">
                     <span className="text-[10px] uppercase font-bold text-krav-muted tracking-wide flex items-center gap-1">
                       <Users className="w-3 h-3" /> Inscritos
                     </span>
                     <span className="text-xs font-bold text-krav-text">
                       {exam.registeredCount} de {exam.capacity || 50}
                     </span>
                   </div>
                </div>

                <div className="pl-2 mt-4">
                   <button onClick={() => navigate(`/admin/exams/${exam.id}`)} className="w-full py-2 bg-krav-accent/10 hover:bg-krav-accent hover:text-white text-krav-accent transition-colors rounded-lg text-sm font-bold border border-krav-accent/20">
                      Liberar Alunos
                   </button>
                </div>
              </div>
            ))}

            {paginatedExams.length === 0 && (
               <div className="col-span-full py-12 text-center text-sm text-krav-muted border border-dashed border-krav-border rounded-xl bg-krav-bg">
                 Nenhum exame de graduação agendado no momento. <br/><span className="text-xs opacity-70">Crie um através do menu "Eventos Gerais".</span>
               </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-krav-border shrink-0">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
