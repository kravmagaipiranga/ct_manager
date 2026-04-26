import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { BeltBadge } from '../../components/shared/BeltBadge';
import { StatusPill } from '../../components/shared/StatusPill';
import { ContactActions } from '../../components/shared/ContactActions';
import { Search, Filter, Plus, UserCircle, X, Edit3, Save, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Belt, Status, User } from '../../types';
import { Pagination } from '../../components/shared/Pagination';
import { exportToCSV } from '../../lib/csv';

export default function Instructors() {
  const user = useAuthStore((state) => state.user);
  const allUsers = useDataStore((state) => state.students);
  const updateStudent = useDataStore((state) => state.updateStudent);
  const addStudent = useDataStore((state) => state.addStudent); // we add a user with role INSTRUCTOR
  const deleteStudent = useDataStore((state) => state.deleteStudent);
  
  const instructors = useMemo(() => {
    if (!user) return [];
    // Isolation by Academy, filter by role INSTRUCTOR
    return allUsers.filter(s => s.academyId === user.academyId && s.role === 'INSTRUCTOR');
  }, [allUsers, user]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingInstructor, setEditingInstructor] = useState<User | null>(null);
  
  const ITEMS_PER_PAGE = 8;

  const filteredInstructors = useMemo(() => {
    return instructors.filter(instructor => {
      const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            instructor.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [instructors, searchTerm]);

  const paginatedInstructors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInstructors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInstructors, currentPage]);

  const totalPages = Math.ceil(filteredInstructors.length / ITEMS_PER_PAGE) || 1;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEdit = (instructor: User) => {
    setEditingInstructor(instructor);
  };

  const handleAddNew = () => {
    setEditingInstructor({
      id: '',
      academyId: user?.academyId || '',
      role: 'INSTRUCTOR',
      name: '',
      email: '',
      password: '',
      phone: '',
      beltLevel: 'BLACK',
      enrollmentStatus: 'ACTIVE',
      financialStatus: 'ACTIVE',
      createdAt: new Date().toISOString()
    } as User);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInstructor) {
      if (editingInstructor.id) {
        updateStudent(editingInstructor.id, editingInstructor);
        toast.success('Instrutor atualizado com sucesso!');
      } else {
        addStudent(editingInstructor);
        toast.success('Novo instrutor cadastrado com sucesso!');
      }
      setEditingInstructor(null);
    }
  };

  const handleExport = () => {
    exportToCSV(
      filteredInstructors,
      [
        { header: 'Nome', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Telefone', key: 'phone' },
        { header: 'Faixa', key: 'beltLevel' },
        { header: 'Situação', key: 'enrollmentStatus' }
      ],
      'Relatorio_Instrutores'
    );
    toast.success('Exportação iniciada!');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este instrutor? Esta ação não pode ser desfeita.')) {
      deleteStudent(id);
      toast.success('Instrutor removido com sucesso!');
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-full max-h-screen bg-krav-bg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Gestão de Instrutores</h1>
          <p className="text-sm text-krav-muted mt-1">Adicione, edite ou exporte sua equipe de instrutores.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => alert('Função de importar em desenvolvimento')}
            className="bg-krav-card border border-krav-border text-krav-text hover:bg-black/5 dark:hover:bg-white/5 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 rotate-180" />
            <span className="hidden sm:inline">Importar</span>
          </button>
          <button 
            onClick={handleExport}
            className="bg-krav-card border border-krav-border text-krav-text hover:bg-black/5 dark:hover:bg-white/5 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          <button 
            onClick={handleAddNew}
            className="bg-krav-accent hover:bg-krav-accent-light text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Instrutor</span>
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="bg-krav-card border border-krav-border rounded-xl flex-1 flex flex-col shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b border-krav-border flex flex-col sm:flex-row gap-4 justify-between bg-black/5 dark:bg-white/5 shrink-0">
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
          </div>

          {/* Table Container */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-krav-bg sticky top-0 z-10 shadow-sm border-b border-krav-border">
                <tr>
                  <th className="font-bold text-[10px] text-krav-muted uppercase tracking-wider py-3 px-6">Instrutor</th>
                  <th className="font-bold text-[10px] text-krav-muted uppercase tracking-wider py-3 px-6 hidden sm:table-cell">Contato</th>
                  <th className="font-bold text-[10px] text-krav-muted uppercase tracking-wider py-3 px-6">Faixa</th>
                  <th className="font-bold text-[10px] text-krav-muted uppercase tracking-wider py-3 px-6 hidden md:table-cell">Situação</th>
                  <th className="font-bold text-[10px] text-krav-muted uppercase tracking-wider py-3 px-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-krav-border">
                {paginatedInstructors.length > 0 ? (
                  paginatedInstructors.map((instructor) => (
                    <tr key={instructor.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => handleEdit(instructor)}>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 border border-krav-border flex items-center justify-center font-bold text-xs text-krav-muted shrink-0">
                            {instructor.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-krav-text group-hover:text-krav-accent transition-colors">{instructor.name}</p>
                            <p className="text-[11px] text-krav-muted sm:hidden mt-0.5">{instructor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 hidden sm:table-cell">
                        <ContactActions phone={instructor.phone} email={instructor.email} iconOnly={true} />
                      </td>
                      <td className="py-3 px-6">
                        <BeltBadge belt={instructor.beltLevel} />
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell">
                        <StatusPill status={instructor.enrollmentStatus} />
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(instructor); }}
                            className="px-3 py-1.5 text-xs font-bold text-krav-muted hover:text-white bg-krav-bg hover:bg-krav-accent border border-krav-border hover:border-krav-accent rounded-lg transition-all inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Editar
                          </button>
                          <button 
                            onClick={(e) => handleDelete(instructor.id, e)}
                            className="p-1.5 text-krav-muted hover:text-white bg-krav-bg hover:bg-red-500 border border-krav-border hover:border-red-500 rounded-lg transition-all inline-flex items-center shadow-sm"
                            title="Excluir Instrutor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-krav-muted text-sm italic">
                      Nenhum instrutor encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
             <div className="p-4 border-t border-krav-border">
               <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
             </div>
          )}
        </div>

        {/* Edit Form / In-line */}
        {editingInstructor && (
          <div className="flex-1 max-w-sm w-full shrink-0 flex flex-col bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden h-full">
             <div className="p-5 border-b border-krav-border bg-black/5 dark:bg-white/5 flex justify-between items-center shrink-0">
               <h3 className="font-bold flex items-center gap-2 text-krav-text uppercase tracking-widest text-sm">
                 <UserCircle className="w-5 h-5 text-krav-accent" />
                 {editingInstructor.id ? 'Editar Instrutor' : 'Novo Instrutor'}
               </h3>
               <button onClick={() => setEditingInstructor(null)} className="text-krav-muted hover:text-red-500 p-1 transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <form onSubmit={handleSaveEdit} className="p-5 flex-1 overflow-y-auto flex flex-col gap-5 bg-krav-card flex-1">
                <div className="flex flex-col gap-3">
                   {editingInstructor.id && (
                     <ContactActions phone={editingInstructor.phone} email={editingInstructor.email} iconOnly={false} align="center" className="pb-3 border-b border-krav-border" />
                   )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-krav-muted mb-1.5 uppercase tracking-wider">Nome Completo</label>
                  <input type="text" value={editingInstructor.name} onChange={e => setEditingInstructor({...editingInstructor, name: e.target.value})} className="w-full bg-krav-bg text-sm font-medium text-krav-text border border-krav-border focus:border-krav-accent focus:ring-1 focus:ring-krav-accent p-2.5 rounded-lg transition-all outline-none" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-krav-muted mb-1.5 uppercase tracking-wider">Email (Login)</label>
                  <input type="email" value={editingInstructor.email} onChange={e => setEditingInstructor({...editingInstructor, email: e.target.value})} className="w-full bg-krav-bg text-sm font-medium text-krav-text border border-krav-border focus:border-krav-accent focus:ring-1 focus:ring-krav-accent p-2.5 rounded-lg transition-all outline-none" required />
                </div>
                {!editingInstructor.id && (
                  <div>
                    <label className="block text-[10px] font-bold text-krav-muted mb-1.5 uppercase tracking-wider">Senha Provisória</label>
                    <input type="password" value={editingInstructor.password} onChange={e => setEditingInstructor({...editingInstructor, password: e.target.value})} className="w-full bg-krav-bg text-sm font-medium text-krav-text border border-krav-border focus:border-krav-accent focus:ring-1 focus:ring-krav-accent p-2.5 rounded-lg transition-all outline-none" required />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-krav-muted mb-1.5 uppercase tracking-wider">Telefone (WhatsApp)</label>
                  <input type="text" value={editingInstructor.phone || ''} onChange={e => setEditingInstructor({...editingInstructor, phone: e.target.value})} className="w-full bg-krav-bg text-sm font-medium text-krav-text border border-krav-border focus:border-krav-accent focus:ring-1 focus:ring-krav-accent p-2.5 rounded-lg transition-all outline-none" />
                </div>

                <div className="pt-4 border-t border-krav-border">
                  <label className="block text-[10px] font-bold text-krav-muted mb-1.5 uppercase tracking-wider">Graduação</label>
                  <div className="flex items-center gap-4 bg-krav-bg p-2 flex-1 rounded-lg border border-krav-border focus-within:border-krav-accent focus-within:ring-1 focus-within:ring-krav-accent transition-all">
                    <select value={editingInstructor.beltLevel} onChange={e => setEditingInstructor({...editingInstructor, beltLevel: e.target.value as Belt})} className="w-full bg-transparent text-sm appearance-none outline-none font-bold text-krav-text pl-2">
                       <option value="WHITE">Branca</option>
                       <option value="YELLOW">Amarela</option>
                       <option value="ORANGE">Laranja</option>
                       <option value="GREEN">Verde</option>
                       <option value="BLUE">Azul</option>
                       <option value="BROWN">Marrom</option>
                       <option value="BLACK">Preta</option>
                    </select>
                    <BeltBadge belt={editingInstructor.beltLevel} className="shrink-0" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-krav-muted mb-1.5 uppercase tracking-wider">Situação</label>
                    <select value={editingInstructor.enrollmentStatus} onChange={e => setEditingInstructor({...editingInstructor, enrollmentStatus: e.target.value as Status})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent focus:ring-1 focus:ring-krav-accent p-2.5 rounded-lg transition-all outline-none font-bold text-krav-text">
                      <option value="ACTIVE">Ativo</option>
                      <option value="SUSPENDED">Inativo / Desligado</option>
                    </select>
                  </div>
                </div>

                <div className="mt-auto pt-6 pb-20 xl:pb-0">
                  <button type="submit" className="w-full bg-krav-accent text-white font-black uppercase tracking-widest py-3.5 text-xs rounded-xl hover:bg-krav-accent-light transition-all flex items-center justify-center gap-2 shadow-sm focus:ring-2 focus:ring-krav-accent focus:ring-offset-2 focus:ring-offset-krav-bg">
                    <Save className="w-4 h-4" /> Salvar Instrutor
                  </button>
                </div>
             </form>
          </div>
        )}
      </div>
    </div>
  );
}
