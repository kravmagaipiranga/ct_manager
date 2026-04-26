import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { BeltBadge } from '../../components/shared/BeltBadge';
import { StatusPill } from '../../components/shared/StatusPill';
import { ContactActions } from '../../components/shared/ContactActions';
import { Search, Filter, MoreVertical, Plus, UserCircle, X, Edit3, Save, Download } from 'lucide-react';
import { Belt, Status, User } from '../../types';
import { Pagination } from '../../components/shared/Pagination';
import { exportToCSV } from '../../lib/csv';

export default function Students() {
  const user = useAuthStore((state) => state.user);
  const allStudents = useDataStore((state) => state.students);
  const updateStudent = useDataStore((state) => state.updateStudent);
  
  // Multi-Academy Filtering
  const students = useMemo(() => {
    if (!user) return [];
    
    // Isolation by Academy
    let baseList = allStudents.filter(s => s.academyId === user.academyId);

    // Further restriction for INSTRUCTOR
    if (user.role === 'INSTRUCTOR') {
      return baseList.filter(s => s.instructorId === user.id || s.id === user.id);
    }
    
    return baseList;
  }, [allStudents, user]);

  const instructorsList = useMemo(() => {
    return allStudents.filter(s => s.role === 'INSTRUCTOR');
  }, [allStudents]);

  const [searchTerm, setSearchTerm] = useState('');
  const [beltFilter, setBeltFilter] = useState<Belt | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  
  const ITEMS_PER_PAGE = 8;

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBelt = beltFilter === 'ALL' || student.beltLevel === beltFilter;
      return matchesSearch && matchesBelt;
    });
  }, [students, searchTerm, beltFilter]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, beltFilter]);

  const handleEdit = (student: User) => {
    setEditingStudent(student);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent(editingStudent.id, editingStudent);
      setEditingStudent(null);
    }
  };

  const handleExport = () => {
    exportToCSV(
      filteredStudents,
      [
        { header: 'Nome', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Telefone', key: 'phone' },
        { header: 'Faixa', key: 'beltLevel' },
        { header: 'Situação Cadastral', key: 'enrollmentStatus' },
        { header: 'Situação Financeira', key: 'financialStatus' },
        { header: 'Data de Ingresso', key: 'createdAt' }
      ],
      'Relatorio_Alunos'
    );
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-full max-h-screen bg-krav-bg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Gestão de Alunos</h1>
          <p className="text-sm text-krav-muted mt-1">Gerencie matrículas, faixas e status financeiro.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="bg-krav-card border border-krav-border text-krav-text hover:bg-black/5 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          <button className="bg-krav-accent hover:bg-krav-accent-light text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Aluno</span>
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="bg-krav-card border border-krav-border rounded-xl flex-1 flex flex-col shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b border-krav-border flex flex-col sm:flex-row gap-4 justify-between bg-krav-card shrink-0">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-krav-muted" />
              <input 
                type="text" 
                placeholder="Buscar por nome ou e-mail..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-krav-bg border border-krav-border rounded-lg text-sm focus:outline-none focus:border-krav-accent focus:ring-1 focus:ring-krav-accent transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-krav-muted" />
              <select 
                className="bg-krav-bg border border-krav-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-krav-accent"
                value={beltFilter}
                onChange={(e) => setBeltFilter(e.target.value as Belt | 'ALL')}
              >
                <option value="ALL">Todas as Faixas</option>
                <option value="WHITE">Branca</option>
                <option value="YELLOW">Amarela</option>
                <option value="ORANGE">Laranja</option>
                <option value="GREEN">Verde</option>
                <option value="BLUE">Azul</option>
                <option value="BROWN">Marrom</option>
                <option value="BLACK">Preta</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-krav-bg sticky top-0 z-10 shadow-sm border-b border-krav-border">
                <tr>
                  <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6">Aluno</th>
                  <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6 hidden sm:table-cell">Contato</th>
                  <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6">Faixa</th>
                  <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6 hidden md:table-cell">Financeiro</th>
                  <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6 hidden md:table-cell">Matrícula</th>
                  <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-krav-border">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-black/[0.02] transition-colors group cursor-pointer" onClick={() => handleEdit(student)}>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-krav-border flex items-center justify-center font-bold text-xs text-krav-muted shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-krav-text group-hover:text-krav-accent transition-colors">{student.name}</p>
                            <p className="text-[11px] text-krav-muted sm:hidden mt-0.5">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 hidden sm:table-cell">
                        <ContactActions phone={student.phone} email={student.email} iconOnly={true} />
                      </td>
                      <td className="py-3 px-6">
                        <BeltBadge belt={student.beltLevel} />
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell">
                        <StatusPill status={student.financialStatus} />
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell">
                        <StatusPill status={student.enrollmentStatus} />
                      </td>
                      <td className="py-3 px-6 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(student); }}
                          className="px-3 py-1.5 text-xs font-bold text-krav-muted hover:text-white bg-krav-bg hover:bg-krav-accent border border-krav-border hover:border-krav-accent rounded-lg transition-all inline-flex items-center gap-1.5 opacity-100 xl:opacity-0 group-hover:opacity-100 shadow-sm"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-krav-muted text-sm">
                      Nenhum aluno encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>

        {/* Edit Sidebar Overlay / In-line */}
        {editingStudent && (
          <div className="flex-1 max-w-sm w-full shrink-0 flex flex-col bg-krav-card border border-krav-border rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] xl:shadow-sm z-20 xl:z-auto fixed right-0 top-0 h-screen overflow-y-auto xl:h-auto xl:sticky xl:top-24 duration-300">
             <div className="p-5 border-b border-krav-border bg-krav-bg/50 flex justify-between items-center shrink-0">
               <h3 className="font-bold flex items-center gap-2 text-krav-text">
                 <UserCircle className="w-5 h-5 text-krav-accent" />
                 Editar Aluno
               </h3>
               <button onClick={() => setEditingStudent(null)} className="text-krav-muted hover:text-krav-danger p-1">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <form onSubmit={handleSaveEdit} className="p-5 flex flex-col gap-5 bg-krav-card">
                <div className="flex flex-col gap-3">
                   <ContactActions phone={editingStudent.phone} email={editingStudent.email} iconOnly={false} align="center" className="pb-3 border-b border-krav-border" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Nome do Aluno</label>
                  <input type="text" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" value={editingStudent.email} onChange={e => setEditingStudent({...editingStudent, email: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Telefone</label>
                  <input type="text" value={editingStudent.phone || ''} onChange={e => setEditingStudent({...editingStudent, phone: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none" />
                </div>

                {/* Additional Registration Info */}
                <div className="pt-2 border-t border-krav-border flex flex-col gap-5">
                  <h4 className="font-bold text-xs text-krav-accent uppercase tracking-wider">Detalhes Pessoais</h4>
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">CPF</label>
                       <input type="text" value={editingStudent.cpf || ''} onChange={e => setEditingStudent({...editingStudent, cpf: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border p-2 rounded-lg" placeholder="000.000.000-00" />
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">Data de Nascimento</label>
                       <input type="date" value={editingStudent.birthDate || ''} onChange={e => setEditingStudent({...editingStudent, birthDate: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border p-2 rounded-lg" />
                     </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-krav-border flex flex-col gap-3">
                  <h4 className="font-bold text-xs text-krav-accent uppercase tracking-wider">Uniforme</h4>
                  <div className="grid grid-cols-2 gap-2">
                     <div>
                       <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">Tam. Camiseta</label>
                       <input type="text" value={editingStudent.shirtSize || ''} onChange={e => setEditingStudent({...editingStudent, shirtSize: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border p-2 rounded-lg" placeholder="M, G..." />
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">Tam. Calça</label>
                        <input type="text" value={editingStudent.pantsSize || ''} onChange={e => setEditingStudent({...editingStudent, pantsSize: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border p-2 rounded-lg" placeholder="42, G..." />
                     </div>
                  </div>
                </div>

                {/* Health & Emergency */}
                <div className="pt-4 border-t border-krav-border flex flex-col gap-3">
                  <h4 className="font-bold text-xs text-krav-accent uppercase tracking-wider">Emergência</h4>
                  <div className="grid grid-cols-3 gap-3">
                     <div className="col-span-1">
                       <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">Nome</label>
                       <input type="text" value={editingStudent.emergencyContact?.name || ''} onChange={e => setEditingStudent({...editingStudent, emergencyContact: {...editingStudent.emergencyContact, name: e.target.value} as any})} className="w-full bg-krav-bg text-sm border border-krav-border p-2 rounded-lg" placeholder="Nome" />
                     </div>
                     <div className="col-span-1">
                       <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">Telefone</label>
                       <input type="text" value={editingStudent.emergencyContact?.phone || ''} onChange={e => setEditingStudent({...editingStudent, emergencyContact: {...editingStudent.emergencyContact, phone: e.target.value} as any})} className="w-full bg-krav-bg text-sm border border-krav-border p-2 rounded-lg" placeholder="Telefone" />
                     </div>
                     <div className="col-span-1">
                       <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">Parentesco</label>
                       <input type="text" value={editingStudent.emergencyContact?.relationship || ''} onChange={e => setEditingStudent({...editingStudent, emergencyContact: {...editingStudent.emergencyContact, relationship: e.target.value} as any})} className="w-full bg-krav-bg text-sm border border-krav-border p-2 rounded-lg" placeholder="Mãe, Pai..." />
                     </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-krav-border">
                  <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Graduação Ativa</label>
                  <div className="flex items-center gap-4 bg-krav-bg p-2.5 rounded-lg border border-krav-border">
                    <select value={editingStudent.beltLevel} onChange={e => setEditingStudent({...editingStudent, beltLevel: e.target.value as Belt})} className="w-full bg-transparent text-sm appearance-none outline-none font-medium">
                      <option value="WHITE">Branca</option>
                      <option value="YELLOW">Amarela</option>
                      <option value="ORANGE">Laranja</option>
                      <option value="GREEN">Verde</option>
                      <option value="BLUE">Azul</option>
                      <option value="BROWN">Marrom</option>
                      <option value="BLACK">Preta</option>
                    </select>
                    <BeltBadge belt={editingStudent.beltLevel} className="shrink-0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Matrícula</label>
                    <select value={editingStudent.enrollmentStatus} onChange={e => setEditingStudent({...editingStudent, enrollmentStatus: e.target.value as Status})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none font-medium">
                      <option value="ACTIVE">Ativo</option>
                      <option value="PENDING">Pendente</option>
                      <option value="SUSPENDED">Suspenso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Financeiro</label>
                    <select value={editingStudent.financialStatus} onChange={e => setEditingStudent({...editingStudent, financialStatus: e.target.value as Status})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none font-medium">
                      <option value="ACTIVE">Em Dia</option>
                      <option value="PENDING">Pendente</option>
                      <option value="OVERDUE">Atrasado</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-krav-border">
                  <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Delegar Instrutor</label>
                  <select 
                    value={editingStudent.instructorId || ''} 
                    onChange={e => setEditingStudent({...editingStudent, instructorId: e.target.value || undefined})} 
                    className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none font-medium"
                    disabled={user?.role === 'INSTRUCTOR'}
                  >
                    <option value="">Sem instrutor vinculado (Geral)</option>
                    {instructorsList.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-auto pt-6 pb-20 xl:pb-0">
                  <button type="submit" className="w-full bg-krav-accent text-white font-bold py-3.5 text-sm rounded-xl hover:bg-krav-accent-light transition-colors flex items-center justify-center gap-2 shadow-md">
                    <Save className="w-4 h-4" /> Salvar Alterações
                  </button>
                </div>
             </form>
          </div>
        )}
      </div>
    </div>
  );
}
