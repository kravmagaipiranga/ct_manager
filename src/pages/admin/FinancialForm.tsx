import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { FinancialStatus } from '../../types';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function FinancialForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const isEditing = Boolean(id);

  const academyId = user?.academyId || '';
  const students = useDataStore((state) => state.students).filter(s => s.role === 'STUDENT' && s.academyId === academyId);
  
  const addFinancial = useDataStore((state) => state.addFinancial);
  const updateFinancial = useDataStore((state) => state.updateFinancial);
  const deleteFinancial = useDataStore((state) => state.deleteFinancial);
  const financials = useDataStore((state) => state.financials);

  const [studentId, setStudentId] = useState('');
  const [referenceMonth, setReferenceMonth] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<FinancialStatus>('PENDING');

  useEffect(() => {
    if (isEditing && id) {
      const record = financials.find(f => f.id === id && f.academyId === academyId);
      if (record) {
        setStudentId(record.studentId);
        setReferenceMonth(record.referenceMonth);
        setAmount(record.amount);
        setDueDate(record.dueDate);
        setStatus(record.status);
      } else {
        // Not found, redirect back
        navigate('/admin/financial');
      }
    }
  }, [id, isEditing, financials, academyId, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !referenceMonth || !amount || !dueDate) return;

    if (isEditing && id) {
      updateFinancial(id, {
        studentId,
        referenceMonth,
        amount: Number(amount),
        dueDate,
        status,
      });
    } else {
      addFinancial({
        academyId,
        studentId,
        referenceMonth,
        amount: Number(amount),
        dueDate,
        status,
      });
    }
    
    navigate('/admin/financial');
  };

  const handleDelete = () => {
    deleteFinancial(id!);
    navigate('/admin/financial');
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/financial')}
          className="p-2 hover:bg-black/20 rounded-lg text-krav-muted hover:text-krav-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">
            {isEditing ? 'Editar Registro Financeiro' : 'Novo Registro Financeiro'}
          </h1>
          <p className="text-sm text-krav-muted mt-1">Preencha os detalhes do pagamento ou mensalidade.</p>
        </div>
      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl overflow-hidden shadow-sm">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-krav-muted mb-1">Aluno</label>
              <select
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-krav-bg border border-krav-border rounded-lg px-4 py-3 text-krav-text focus:outline-none focus:border-krav-accent transition-colors"
              >
                <option value="">Selecione um aluno...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} - {s.beltLevel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-krav-muted mb-1">Mês de Referência</label>
              <input
                type="text"
                required
                placeholder="Ex: Maio/2026"
                value={referenceMonth}
                onChange={(e) => setReferenceMonth(e.target.value)}
                className="w-full bg-krav-bg border border-krav-border rounded-lg px-4 py-3 text-krav-text focus:outline-none focus:border-krav-accent placeholder:text-zinc-600 transition-colors"
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-krav-muted mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-krav-bg border border-krav-border rounded-lg px-4 py-3 text-krav-text focus:outline-none focus:border-krav-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-krav-muted mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-krav-bg border border-krav-border rounded-lg px-4 py-3 text-krav-text focus:outline-none focus:border-krav-accent transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-krav-muted mb-1">Status do Pagamento</label>
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as FinancialStatus)}
                className="w-full bg-krav-bg border border-krav-border rounded-lg px-4 py-3 text-krav-text focus:outline-none focus:border-krav-accent transition-colors"
              >
                <option value="PENDING">Pendente</option>
                <option value="PAID">Pago</option>
                <option value="OVERDUE">Atrasado</option>
              </select>
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
                Excluir Registro
              </button>
            ) : (
              <div></div>
            )}
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/financial')}
                className="px-4 py-2 rounded-lg font-medium text-sm text-krav-muted hover:text-krav-text hover:bg-black/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg font-medium text-sm bg-krav-accent text-white hover:bg-krav-accent/90 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {isEditing ? 'Salvar Alterações' : 'Salvar Registro'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
