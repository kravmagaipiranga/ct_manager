import React, { useState, useMemo } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Briefcase, Calendar as CalendarIcon, User as UserIcon, CheckCircle, Clock, Plus, X, Search, Building2, Ticket, Download } from 'lucide-react';
import { Appointment, AppointmentType, AppointmentStatus } from '../../types';
import { cn } from '../../lib/utils';
import { StatusPill } from '../../components/shared/StatusPill';
import { exportToCSV } from '../../lib/csv';

export default function Appointments() {
  const authUser = useAuthStore(state => state.user);
  const allAppointments = useDataStore(state => state.appointments);
  const students = useDataStore(state => state.students);
  const addAppointment = useDataStore(state => state.addAppointment);
  const updateAppointmentStatus = useDataStore(state => state.updateAppointmentStatus);
  const user = useDataStore(state => state.students.find(s => s.id === authUser?.id) || state.students.find(s => s.role === 'ADMIN'));

  const appointments = useMemo(() => {
    if (authUser?.role === 'INSTRUCTOR') {
      return allAppointments.filter(a => a.instructorId === authUser.id);
    }
    return allAppointments;
  }, [allAppointments, authUser]);

  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'PRIVATE_CLASS' as AppointmentType,
    date: '',
    time: '',
    durationMinutes: 60,
    price: 0,
    isExternalClient: false,
    studentId: '',
    externalClientName: '',
    externalClientDocument: '',
    externalClientPhone: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const datetime = new Date(`${formData.date}T${formData.time}:00Z`).toISOString();
    
    addAppointment({
      type: formData.type,
      title: formData.title,
      date: datetime,
      durationMinutes: formData.durationMinutes,
      instructorId: user?.id || 'admin_1',
      instructorName: user?.name || 'Administrador',
      isExternalClient: formData.isExternalClient,
      studentId: formData.isExternalClient ? undefined : formData.studentId,
      externalClientName: formData.isExternalClient ? formData.externalClientName : undefined,
      externalClientDocument: formData.isExternalClient ? formData.externalClientDocument : undefined,
      externalClientPhone: formData.isExternalClient ? formData.externalClientPhone : undefined,
      price: formData.price,
      status: 'SCHEDULED',
      notes: formData.notes
    });
    
    setShowForm(false);
    setFormData({ title: '', type: 'PRIVATE_CLASS', date: '', time: '', durationMinutes: 60, price: 0, isExternalClient: false, studentId: '', externalClientName: '', externalClientDocument: '', externalClientPhone: '', notes: '' });
  };

  const now = new Date();
  const filtered = appointments.filter(a => {
    const isPast = new Date(a.date) < now;
    return activeTab === 'UPCOMING' ? (!isPast && a.status !== 'CANCELLED') : (isPast || a.status === 'CANCELLED');
  }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleExport = () => {
    exportToCSV(
      filtered,
      [
        { header: 'Título do Evento', key: 'title' },
        { header: 'Tipo', key: 'type' },
        { header: 'Data', key: 'date' },
        { header: 'Duração (min)', key: 'durationMinutes' },
        { header: 'Status', key: 'status' },
        { header: 'Instrutor', key: 'instructorName' },
        { header: 'Cliente Externo', key: 'externalClientName' },
        { header: 'Valor (R$)', key: 'price' }
      ],
      'Relatorio_Servicos'
    );
  };

  return (
    <div className="p-6 md:p-8 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Serviços & Agendamentos</h1>
          <p className="text-sm text-krav-muted mt-1">Aulas particulares, palestras corporativas e workshops sob demanda.</p>
        </div>
        <div className="flex gap-2">
          {!showForm && (
            <button 
              onClick={handleExport}
              className="bg-krav-card border border-krav-border text-krav-text hover:bg-black/5 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          )}
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="bg-krav-accent hover:bg-krav-accent-light text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Agendamento</span>
            </button>
          )}
        </div>
      </div>

      <div className="w-full pb-10">
        
        {showForm ? (
          <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
             <div className="p-5 border-b border-krav-border flex justify-between items-center bg-black/5">
                <h3 className="font-bold text-lg text-krav-text flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-krav-accent" /> Agendar Serviço Externo / Particular
                </h3>
                <button onClick={() => setShowForm(false)} className="text-krav-muted hover:text-krav-danger p-1">
                  <X className="w-5 h-5" />
                </button>
             </div>
             <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="md:col-span-2 flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={formData.type === 'PRIVATE_CLASS'} onChange={() => setFormData({...formData, type: 'PRIVATE_CLASS'})} className="accent-krav-accent w-4 h-4" />
                    <span className="text-sm font-semibold text-krav-text">Aula Particular (1-1)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={formData.type === 'LECTURE'} onChange={() => setFormData({...formData, type: 'LECTURE'})} className="accent-krav-accent w-4 h-4" />
                    <span className="text-sm font-semibold text-krav-text">Palestra Corporativa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={formData.type === 'WORKSHOP'} onChange={() => setFormData({...formData, type: 'WORKSHOP'})} className="accent-krav-accent w-4 h-4" />
                    <span className="text-sm font-semibold text-krav-text">Workshop Fechado</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-krav-text mb-1.5">Título do Evento</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Defesa Pessoal para Mulheres (Empresa X)" className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-krav-text mb-1.5">Data</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text text-sm" />
                </div>
                
                <div className="flex gap-4">
                   <div className="flex-1">
                     <label className="block text-sm font-semibold text-krav-text mb-1.5">Hora</label>
                     <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text text-sm" />
                   </div>
                   <div className="flex-1">
                     <label className="block text-sm font-semibold text-krav-text mb-1.5">Duração (min)</label>
                     <input type="number" required value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})} className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text text-sm" />
                   </div>
                </div>

                <div className="md:col-span-2 p-4 bg-black/5 rounded-lg border border-krav-border">
                  <div className="flex items-center gap-4 mb-4">
                    <h4 className="font-bold text-sm text-krav-text uppercase tracking-wider">Público Alvo e Cobrança</h4>
                    <label className="flex items-center gap-2 cursor-pointer ml-auto bg-krav-card px-3 py-1.5 rounded-full border border-krav-border shadow-sm">
                      <input type="checkbox" checked={formData.isExternalClient} onChange={(e) => setFormData({...formData, isExternalClient: e.target.checked})} className="accent-krav-accent w-4 h-4 cursor-pointer" />
                      <span className="text-xs font-bold text-krav-text">Cliente Externo / Empresa (Fora do DB)</span>
                    </label>
                  </div>

                  {!formData.isExternalClient ? (
                    <div>
                      <label className="block text-sm font-semibold text-krav-text mb-1.5 flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-krav-accent" /> Selecionar Aluno Matriculado</label>
                      <select required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-card text-krav-text text-sm">
                        <option value="">Selecione o aluno...</option>
                        {students.filter(s => s.role === 'STUDENT').map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-krav-text mb-1.5 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-krav-accent" /> Nome do Cliente / Empresa</label>
                        <input type="text" required value={formData.externalClientName} onChange={e => setFormData({...formData, externalClientName: e.target.value})} placeholder="Nome completo ou Razão Social" className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-card text-krav-text text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-krav-text mb-1.5 flex items-center gap-1.5"><Ticket className="w-4 h-4 text-krav-accent" /> CPF / CNPJ</label>
                        <input type="text" value={formData.externalClientDocument} onChange={e => setFormData({...formData, externalClientDocument: e.target.value})} placeholder="Documento para NF" className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-card text-krav-text text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-krav-text mb-1.5">Telefone de Contato</label>
                        <input type="text" value={formData.externalClientPhone} onChange={e => setFormData({...formData, externalClientPhone: e.target.value})} placeholder="(11) 90000-0000" className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-card text-krav-text text-sm" />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 border-t border-krav-border pt-4">
                     <label className="block text-sm font-semibold text-krav-text mb-1.5">Valor Total Cobrado (R$)</label>
                     <input type="number" required min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} placeholder="0.00" className="w-full md:w-1/3 px-4 py-2 border border-krav-border rounded-lg bg-krav-card font-mono text-krav-accent font-bold text-sm" />
                  </div>
                </div>

                <div className="md:col-span-2">
                   <button type="submit" className="w-full bg-krav-accent hover:bg-krav-accent-light text-white py-3 rounded-xl font-bold transition-colors">Confirmar Agendamento</button>
                </div>
             </form>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(['UPCOMING', 'PAST'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-colors",
                    activeTab === tab ? "bg-krav-accent text-white" : "bg-krav-card text-krav-muted border border-krav-border hover:bg-gray-50"
                  )}
                >
                  {tab === 'UPCOMING' ? 'Próximos' : 'Histórico'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
               {filtered.length === 0 && (
                 <div className="col-span-full py-16 text-center text-krav-muted bg-krav-card border border-dashed border-krav-border rounded-xl">
                    Nenhum agendamento encontrado para esta aba.
                 </div>
               )}
               {filtered.map(app => {
                 let clientName = app.isExternalClient ? app.externalClientName : students.find(s => s.id === app.studentId)?.name || 'Desconhecido';
                 let dateObj = new Date(app.date);
                 
                 return (
                   <div key={app.id} className="bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm flex flex-col gap-4 hover:border-krav-accent/30 transition-colors">
                     <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                           <span className={cn(
                             "text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full w-max mb-2",
                             app.type === 'PRIVATE_CLASS' ? "bg-purple-100 text-purple-700 border-purple-200 border" :
                             app.type === 'LECTURE' ? "bg-orange-100 text-orange-700 border-orange-200 border" :
                             "bg-blue-100 text-blue-700 border-blue-200 border"
                           )}>
                             {app.type === 'PRIVATE_CLASS' ? 'Aula Particular' : app.type === 'LECTURE' ? 'Palestra' : 'Workshop'}
                           </span>
                           <h4 className="font-bold text-krav-text text-lg">{app.title}</h4>
                        </div>
                        <span className={cn(
                          "px-2 py-1 flex items-center justify-center rounded uppercase tracking-wider text-[10px] font-bold h-min border",
                          app.status === 'SCHEDULED' ? 'bg-krav-success/15 text-krav-success border-krav-success/20' : 
                          app.status === 'COMPLETED' ? 'bg-krav-accent/15 text-krav-accent border-krav-accent/20' : 
                          'bg-krav-muted/15 text-krav-muted border-krav-muted/20'
                        )}>
                           {app.status === 'SCHEDULED' ? 'Agendado' : app.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
                        </span>
                     </div>

                     <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-black/5 p-4 rounded-lg text-sm border border-krav-border/50">
                        <div className="flex items-center gap-2 text-krav-text">
                           <CalendarIcon className="w-4 h-4 text-krav-accent" />
                           <span className="font-bold">{dateObj.toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-krav-text">
                           <Clock className="w-4 h-4 text-krav-accent" />
                           <span className="font-bold">{dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} <span className="font-normal text-krav-muted text-xs">({app.durationMinutes}m)</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-krav-text">
                           {app.isExternalClient ? <Building2 className="w-4 h-4 text-krav-accent" /> : <UserIcon className="w-4 h-4 text-krav-accent" />}
                           <span className="font-bold">{clientName}</span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between mt-auto pt-4 border-t border-krav-border">
                       <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">R$ {app.price.toFixed(2)}</span>
                       {app.status === 'SCHEDULED' && (
                         <div className="flex gap-2">
                           <button onClick={() => updateAppointmentStatus(app.id, 'CANCELLED')} className="text-xs px-3 py-1.5 rounded-lg border border-krav-border text-krav-muted hover:text-krav-danger hover:border-krav-danger/30 transition-colors bg-krav-card">Cancelar</button>
                           <button onClick={() => updateAppointmentStatus(app.id, 'COMPLETED')} className="text-xs px-3 py-1.5 rounded-lg bg-krav-accent text-white hover:bg-krav-accent-light transition-colors font-bold flex items-center gap-1.5">
                             <CheckCircle className="w-3.5 h-3.5" /> Concluir
                           </button>
                         </div>
                       )}
                     </div>
                   </div>
                 )
               })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
