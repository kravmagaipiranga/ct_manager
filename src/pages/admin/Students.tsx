import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  const ITEMS_PER_PAGE = 8;

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const isCorrectAcademyAndRole = student.academyId === user?.academyId && student.role === 'STUDENT';
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBelt = beltFilter === 'ALL' || student.beltLevel === beltFilter;
      return isCorrectAcademyAndRole && matchesSearch && matchesBelt;
    });
  }, [students, searchTerm, beltFilter, user?.academyId]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, beltFilter]);

  const navigate = useNavigate();

  const handleEdit = (student: User) => {
    navigate(`/admin/students/${student.id}`);
  };

  const handleNew = () => {
    navigate('/admin/students/new');
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
    <div className="p-6 md:p-8 flex flex-col bg-krav-bg">
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
          <button 
            onClick={handleNew}
            className="bg-krav-accent hover:bg-krav-accent-light text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
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
      </div>
    </div>
  );
}
