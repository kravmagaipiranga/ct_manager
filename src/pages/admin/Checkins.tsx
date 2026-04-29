import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CheckSquare, Check as CheckIcon, X, History, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { ContactActions } from '../../components/shared/ContactActions';
import { CheckinStatus } from '../../types';
import { exportToCSV } from '../../lib/csv';

export default function Checkins() {
  const user = useAuthStore((state) => state.user);
  const allCheckins = useDataStore((state) => state.checkins);
  const classes = useDataStore((state) => state.classes);
  const students = useDataStore((state) => state.students);
  const approveCheckin = useDataStore((state) => state.approveCheckin);
  const rejectCheckin = useDataStore((state) => state.rejectCheckin);
  const deleteCheckin = useDataStore((state) => state.deleteCheckin);

  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');

  const checkins = useMemo(() => {
    // Basic Academy Filter
    let baseList = allCheckins.filter(c => {
      const student = students.find(s => s.id === c.studentId);
      return student?.academyId === user?.academyId;
    });

    if (user?.role === 'INSTRUCTOR') {
      const myClassesIds = classes.filter(c => c.instructorId === user.id).map(c => c.id);
      return baseList.filter(c => myClassesIds.includes(c.classId));
    }
    return baseList;
  }, [allCheckins, classes, user, students]);

  const formattedCheckins = checkins.map(c => {
    const student = students.find(s => s.id === c.studentId);
    const cls = classes.find(cl => cl.id === c.classId);
    return {
      ...c,
      studentName: student?.name || 'Desconhecido',
      studentPhone: student?.phone,
      studentEmail: student?.email,
      className: cls?.name || 'Aula',
      date: new Date(c.timestamp).toLocaleString('pt-BR')
    };
  }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const pendingCheckins = formattedCheckins.filter(c => c.status === 'PENDING');
  const historyCheckins = formattedCheckins.filter(c => c.status !== 'PENDING');

  const handleApproveAll = () => {
    if (window.confirm(`Tem certeza que deseja aprovar os ${pendingCheckins.length} check-ins pendentes?`)) {
      pendingCheckins.forEach(c => approveCheckin(c.id));
    }
  };

  const handleExport = () => {
    exportToCSV(
      activeTab === 'PENDING' ? pendingCheckins : historyCheckins,
      [
        { header: 'Aluno', key: 'studentName' },
        { header: 'Telefone', key: 'studentPhone' },
        { header: 'Aula', key: 'className' },
        { header: 'Data do Check-in', key: 'date' },
        { header: 'Status', key: 'status' }
      ],
      `Relatorio_Checkins_${activeTab}`
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Fila de Check-ins</h1>
          <p className="text-sm text-krav-muted mt-1">Aprove ou rejeite a entrada dos alunos na academia.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-krav-card border border-krav-border text-krav-text hover:bg-black/5 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar CSV</span>
        </button>
      </div>

      <div className="flex gap-4 border-b border-krav-border mb-6 shrink-0 justify-between items-center w-full">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('PENDING')}
            className={`pb-3 px-2 text-sm font-semibold transition-colors duration-200 border-b-2 flex items-center gap-2 ${
              activeTab === 'PENDING' ? 'border-krav-accent text-krav-accent' : 'border-transparent text-krav-muted hover:text-krav-text'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Aguardando ({pendingCheckins.length})
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`pb-3 px-2 text-sm font-semibold transition-colors duration-200 border-b-2 flex items-center gap-2 ${
              activeTab === 'HISTORY' ? 'border-krav-accent text-krav-accent' : 'border-transparent text-krav-muted hover:text-krav-text'
            }`}
          >
            <History className="w-4 h-4" />
            Histórico
          </button>
        </div>
        {activeTab === 'PENDING' && pendingCheckins.length > 0 && (
          <button
            onClick={handleApproveAll}
            className="hidden sm:flex text-sm items-center gap-1.5 font-semibold text-krav-success bg-krav-success/10 hover:bg-krav-success/20 px-3 py-1.5 rounded-lg transition-colors border border-krav-success/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Aprovar Todos
          </button>
        )}
      </div>

      <div className="w-full">
        {activeTab === 'PENDING' && (
          <div className="space-y-4 max-w-3xl">
            {pendingCheckins.length > 0 && (
              <div className="sm:hidden mb-4">
                <button
                  onClick={handleApproveAll}
                  className="w-full flex text-sm items-center justify-center gap-1.5 font-semibold text-krav-success bg-krav-success/10 hover:bg-krav-success/20 px-3 py-2.5 rounded-lg transition-colors border border-krav-success/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprovar Todos
                </button>
              </div>
            )}
            {pendingCheckins.length === 0 ? (
              <div className="p-8 text-center text-krav-muted border border-dashed border-krav-border rounded-xl">
                Nenhum check-in pendente no momento.
              </div>
            ) : (
              pendingCheckins.map(checkin => (
                <div key={checkin.id} className="bg-krav-card border border-krav-border p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                   <div>
                     <div className="flex items-center gap-3">
                       <h3 className="font-bold text-lg text-krav-text">{checkin.studentName}</h3>
                       <ContactActions phone={checkin.studentPhone} email={checkin.studentEmail} iconOnly={true} />
                     </div>
                     <p className="text-sm text-krav-muted flex items-center gap-2 mt-1">
                       <span className="font-semibold">{checkin.className}</span> • {checkin.date}
                     </p>
                   </div>
                   <div className="flex items-center gap-2">
                     <button onClick={() => approveCheckin(checkin.id)} className="flex-1 sm:flex-none justify-center bg-krav-success hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                       <CheckIcon className="w-4 h-4" /> Aprovar
                     </button>
                     <button onClick={() => rejectCheckin(checkin.id)} className="flex-1 sm:flex-none justify-center bg-krav-card border border-krav-danger text-krav-danger hover:bg-krav-danger/10 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                       <X className="w-4 h-4" /> Rejeitar
                     </button>
                   </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="space-y-3 max-w-3xl">
            {historyCheckins.map(checkin => (
              <div key={checkin.id} className="bg-krav-card border border-krav-border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                 <div>
                   <h3 className="font-semibold text-krav-text">{checkin.studentName}</h3>
                   <p className="text-xs text-krav-muted mt-0.5">{checkin.className} • {checkin.date}</p>
                 </div>
                 <div className="flex items-center gap-3">
                   {checkin.status === 'APPROVED' ? (
                     <span className="text-xs font-bold text-krav-success bg-krav-success/10 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-krav-success/20">
                       <CheckIcon className="w-3.5 h-3.5" /> Aprovado
                     </span>
                   ) : (
                     <span className="text-xs font-bold text-krav-danger bg-krav-danger/10 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-krav-danger/20">
                       <X className="w-3.5 h-3.5" /> Rejeitado
                     </span>
                   )}
                   <button
                     onClick={() => {
                       if (window.confirm('Tem certeza que deseja remover este check-in?')) {
                         deleteCheckin(checkin.id);
                       }
                     }}
                     className="p-1.5 text-krav-muted hover:text-krav-danger bg-krav-card border border-transparent hover:border-krav-danger hover:bg-krav-danger/10 rounded-md transition-colors"
                     title="Remover check-in"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
