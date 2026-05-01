import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { Belt, Status, User } from '../../types';
import { ArrowLeft, Save, Trash2, UserCircle } from 'lucide-react';
import { BeltBadge } from '../../components/shared/BeltBadge';

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const isEditing = Boolean(id);
  const addStudent = useDataStore((state) => state.addStudent);
  const updateStudent = useDataStore((state) => state.updateStudent);
  const deleteStudent = useDataStore((state) => state.deleteStudent);
  const allStudents = useDataStore((state) => state.students);

  const instructorsList = allStudents.filter(s => s.role === 'INSTRUCTOR');

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    shirtSize: '',
    pantsSize: '',
    beltLevel: 'WHITE',
    enrollmentStatus: 'ACTIVE',
    financialStatus: 'ACTIVE',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    role: 'STUDENT',
    academyId: user?.academyId || ''
  });

  useEffect(() => {
    if (isEditing && id) {
      const student = allStudents.find(s => s.id === id);
      if (student) {
        setFormData(student);
      } else {
        navigate('/admin/students');
      }
    }
  }, [id, isEditing, allStudents, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && id) {
      updateStudent(id, formData);
    } else {
       addStudent({
          ...formData,
          role: 'STUDENT',
          academyId: formData.academyId || user?.academyId || '',
          id: Math.random().toString(36).substr(2, 9),
       } as User);
    }
    navigate('/admin/students');
  };

  const handleDelete = () => {
    deleteStudent(id!);
    navigate('/admin/students');
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/students')}
          className="p-2 hover:bg-black/20 rounded-lg text-krav-muted hover:text-krav-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">
            {isEditing ? 'Editar Aluno' : 'Novo Registro de Aluno'}
          </h1>
          <p className="text-sm text-krav-muted mt-1">Preencha os dados do cadastro.</p>
        </div>
      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl overflow-hidden shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="space-y-8">
            
            {/* Informações Básicas */}
            <div>
               <h4 className="font-bold text-sm text-krav-accent uppercase tracking-wider mb-4">Informações Básicas</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Nome do Aluno</label>
                   <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none" required />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Email</label>
                   <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none" required />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Telefone</label>
                   <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">CPF</label>
                   <input type="text" value={formData.cpf || ''} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border p-3 rounded-lg outline-none focus:border-krav-accent" placeholder="000.000.000-00" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Data de Nascimento</label>
                   <input type="date" value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border p-3 outline-none focus:border-krav-accent rounded-lg" style={{ colorScheme: 'dark' }} />
                 </div>
               </div>
            </div>

            {/* Uniforme */}
            <div className="pt-6 border-t border-krav-border">
               <h4 className="font-bold text-sm text-krav-accent uppercase tracking-wider mb-4">Uniforme</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Tam. Camiseta</label>
                   <input type="text" value={formData.shirtSize || ''} onChange={e => setFormData({...formData, shirtSize: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border p-3 outline-none focus:border-krav-accent rounded-lg" placeholder="M, G..." />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Tam. Calça</label>
                    <input type="text" value={formData.pantsSize || ''} onChange={e => setFormData({...formData, pantsSize: e.target.value})} className="w-full bg-krav-bg text-sm border border-krav-border p-3 outline-none focus:border-krav-accent rounded-lg" placeholder="42, G..." />
                 </div>
               </div>
            </div>

            {/* Contato de Emergência */}
            <div className="pt-6 border-t border-krav-border">
               <h4 className="font-bold text-sm text-krav-accent uppercase tracking-wider mb-4">Emergência</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Nome</label>
                   <input type="text" value={formData.emergencyContact?.name || ''} onChange={e => setFormData({...formData, emergencyContact: {...formData.emergencyContact, name: e.target.value} as any})} className="w-full bg-krav-bg text-sm border border-krav-border p-3 outline-none focus:border-krav-accent rounded-lg" placeholder="Nome" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Telefone</label>
                   <input type="text" value={formData.emergencyContact?.phone || ''} onChange={e => setFormData({...formData, emergencyContact: {...formData.emergencyContact, phone: e.target.value} as any})} className="w-full bg-krav-bg text-sm border border-krav-border p-3 outline-none focus:border-krav-accent rounded-lg" placeholder="Telefone" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Parentesco</label>
                   <input type="text" value={formData.emergencyContact?.relationship || ''} onChange={e => setFormData({...formData, emergencyContact: {...formData.emergencyContact, relationship: e.target.value} as any})} className="w-full bg-krav-bg text-sm border border-krav-border p-3 outline-none focus:border-krav-accent rounded-lg" placeholder="Mãe, Pai..." />
                 </div>
               </div>
            </div>

            {/* Graduação e Status */}
            <div className="pt-6 border-t border-krav-border">
               <h4 className="font-bold text-sm text-krav-accent uppercase tracking-wider mb-4">Academia & Status</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Graduação Ativa</label>
                    <div className="flex items-center gap-4 bg-krav-bg p-2.5 rounded-lg border border-krav-border">
                      <select value={formData.beltLevel || 'WHITE'} onChange={e => setFormData({...formData, beltLevel: e.target.value as Belt})} className="w-full bg-transparent text-sm appearance-none outline-none font-medium text-krav-text">
                        <option value="WHITE">Branca</option>
                        <option value="YELLOW">Amarela</option>
                        <option value="ORANGE">Laranja</option>
                        <option value="GREEN">Verde</option>
                        <option value="BLUE">Azul</option>
                        <option value="BROWN">Marrom</option>
                        <option value="BLACK">Preta</option>
                      </select>
                      <BeltBadge belt={formData.beltLevel as Belt} className="shrink-0" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Matrícula</label>
                    <select value={formData.enrollmentStatus || 'ACTIVE'} onChange={e => setFormData({...formData, enrollmentStatus: e.target.value as Status})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3.5 rounded-lg transition-colors outline-none font-medium text-krav-text">
                      <option value="ACTIVE">Ativo</option>
                      <option value="PENDING">Pendente</option>
                      <option value="SUSPENDED">Suspenso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Financeiro</label>
                    <select value={formData.financialStatus || 'ACTIVE'} onChange={e => setFormData({...formData, financialStatus: e.target.value as Status})} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3.5 rounded-lg transition-colors outline-none font-medium text-krav-text">
                      <option value="ACTIVE">Em Dia</option>
                      <option value="PENDING">Pendente</option>
                      <option value="OVERDUE">Atrasado</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Delegar Instrutor</label>
                    <select 
                      value={formData.instructorId || ''} 
                      onChange={e => setFormData({...formData, instructorId: e.target.value || undefined})} 
                      className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3.5 rounded-lg transition-colors outline-none font-medium text-krav-text disabled:opacity-50"
                      disabled={user?.role === 'INSTRUCTOR'}
                    >
                      <option value="">Sem instrutor vinculado (Geral)</option>
                      {instructorsList.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                      ))}
                    </select>
                  </div>
               </div>
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
                Excluir Aluno
              </button>
            ) : (
              <div></div>
            )}
            
            <div className="flex gap-3">
               <button
                  type="button"
                  onClick={() => navigate('/admin/students')}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-krav-muted hover:text-krav-text hover:bg-black/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-krav-accent text-white flex items-center gap-2 hover:bg-krav-accent-light transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Salvar Alterações' : 'Salvar Aluno'}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
