import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { StatusPill } from '../../components/shared/StatusPill';
import { ContactActions } from '../../components/shared/ContactActions';
import { Download, Filter, Search, CheckCircle } from 'lucide-react';
import { FinancialStatus } from '../../types';
import { Pagination } from '../../components/shared/Pagination';
import { exportToCSV } from '../../lib/csv';

export default function Financial() {
  const user = useAuthStore((state) => state.user);
  const financials = useDataStore((state) => state.financials);
  const students = useDataStore((state) => state.students);
  const markFinancialPaid = useDataStore((state) => state.markFinancialPaid);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FinancialStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const formattedData = useMemo(() => {
    return financials
      .map(f => {
        const student = students.find(s => s.id === f.studentId);
        return { ...f, studentName: student?.name || 'Desconhecido', studentPhone: student?.phone, studentEmail: student?.email, academyId: student?.academyId };
      })
      .filter(f => f.academyId === user?.academyId);
  }, [financials, students, user]);

  const filteredData = formattedData.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const totalEmAberto = formattedData.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE').reduce((acc, curr) => acc + curr.amount, 0);
  const totalRecebido = formattedData.filter(f => f.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);

  // reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleExport = () => {
    exportToCSV(
      filteredData,
      [
        { header: 'Aluno', key: 'studentName' },
        { header: 'Mês de Referência', key: 'referenceMonth' },
        { header: 'Vencimento', key: 'dueDate' },
        { header: 'Valor (R$)', key: 'amount' },
        { header: 'Situação', key: 'status' }
      ],
      'Relatorio_Financeiro'
    );
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-full max-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Gestão Financeira</h1>
          <p className="text-sm text-krav-muted mt-1">Acompanhe mensalidades e recebimentos da academia.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-krav-card border border-krav-border text-krav-text hover:bg-black/5 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
         <div className="bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm">
           <p className="text-[11px] uppercase tracking-wider text-krav-muted font-semibold">Total a Receber</p>
           <p className="text-2xl font-bold mt-2">R$ {totalEmAberto.toFixed(2).replace('.', ',')}</p>
         </div>
         <div className="bg-krav-card border border-krav-accent/20 rounded-xl p-5 shadow-sm bg-krav-accent/5">
           <p className="text-[11px] uppercase tracking-wider text-krav-accent font-semibold">Recebido este Mês</p>
           <p className="text-2xl font-bold mt-2 text-krav-accent">R$ {totalRecebido.toFixed(2).replace('.', ',')}</p>
         </div>
         <div className="bg-krav-card border border-krav-danger/20 rounded-xl p-5 shadow-sm bg-krav-danger/5">
           <p className="text-[11px] uppercase tracking-wider text-krav-danger font-semibold">Inadimplência (Atrasados)</p>
           <p className="text-2xl font-bold mt-2 text-krav-danger">
             {formattedData.filter(f => f.status === 'OVERDUE').length} parcelas
           </p>
         </div>
      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-krav-border flex flex-col sm:flex-row gap-4 justify-between bg-krav-card shrink-0">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-krav-muted" />
            <input 
              type="text" 
              placeholder="Buscar por aluno..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-krav-bg border border-krav-border rounded-lg text-sm focus:outline-none focus:border-krav-accent focus:ring-1 focus:ring-krav-accent transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-krav-muted" />
            <select 
              className="bg-krav-bg border border-krav-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-krav-accent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FinancialStatus | 'ALL')}
            >
              <option value="ALL">Status: Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="OVERDUE">Atrasado</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-krav-bg/50 sticky top-0 z-10 shadow-sm border-b border-krav-border backdrop-blur">
              <tr>
                <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6">Referência</th>
                <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6">Aluno</th>
                <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6">Vencimento</th>
                <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6 text-right">Valor</th>
                <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6">Status</th>
                <th className="py-3 px-6 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-krav-border">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="py-3 px-6 font-medium text-sm text-krav-text">
                      {item.referenceMonth}
                    </td>
                    <td className="py-3 px-6 text-sm text-krav-text">
                      <div className="flex items-center gap-3">
                        {item.studentName}
                        <ContactActions phone={item.studentPhone} email={item.studentEmail} iconOnly={true} />
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm text-krav-text">
                      {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-6 text-sm text-krav-text font-medium text-right">
                      R$ {item.amount.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-6">
                      <StatusPill status={item.status as any} />
                    </td>
                    <td className="py-3 px-6 text-right">
                      {(item.status === 'PENDING' || item.status === 'OVERDUE') && (
                        <button 
                          onClick={() => markFinancialPaid(item.id)}
                          className="bg-krav-card border border-krav-border text-krav-text hover:text-krav-success hover:border-krav-success hover:bg-krav-success/5 px-3 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Dar Baixa
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-krav-muted text-sm">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
