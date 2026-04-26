import React, { useState } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Megaphone, Pin, Plus, Calendar as CalendarIcon, Users, ArrowLeft, Check, Edit3, Trash2, Download } from 'lucide-react';
import { Pagination } from '../../components/shared/Pagination';
import { AcademyEvent, Announcement } from '../../types';
import { exportToCSV } from '../../lib/csv';

export default function Announcements() {
  const announcements = useDataStore((state) => state.announcements);
  const events = useDataStore((state) => state.events);
  const user = useAuthStore((state) => state.user);
  
  const addAnnouncement = useDataStore((state) => state.addAnnouncement);
  const addEvent = useDataStore((state) => state.addEvent);
  const updateEvent = useDataStore((state) => state.updateEvent);
  const deleteEvent = useDataStore((state) => state.deleteEvent);
  
  const [activeTab, setActiveTab] = useState<'Avisos' | 'Eventos'>('Avisos');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Pagination states
  const [announcementsPage, setAnnouncementsPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Derived Pagination
  const sortedAnnouncements = [...announcements].sort((a,b) => Number(b.isPinned) - Number(a.isPinned));
  const paginatedAnnouncements = sortedAnnouncements.slice((announcementsPage - 1) * ITEMS_PER_PAGE, announcementsPage * ITEMS_PER_PAGE);
  const announcementsTotalPages = Math.ceil(announcements.length / ITEMS_PER_PAGE);

  const paginatedEvents = events.slice((eventsPage - 1) * ITEMS_PER_PAGE, eventsPage * ITEMS_PER_PAGE);
  const eventsTotalPages = Math.ceil(events.length / ITEMS_PER_PAGE);

  // Forms states
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', isPinned: false });
  const [eventForm, setEventForm] = useState({ type: 'SEMINAR', title: '', date: '', description: '', capacity: 20, price: 0 });

  const openForm = (editId?: string) => {
    setEditingItemId(editId || null);
    if (activeTab === 'Avisos') {
      if (editId) {
         // Future: update notification support
      } else {
        setAnnouncementForm({ title: '', content: '', isPinned: false });
      }
    } else {
      if (editId) {
        const ev = events.find(e => e.id === editId);
        if (ev) setEventForm({ 
          title: ev.title, 
          description: ev.description, 
          date: ev.date.slice(0, 16), // datetime-local format
          type: ev.type as 'SEMINAR' | 'EXAM', 
          price: ev.price || 0, 
          capacity: ev.capacity || 20 
        });
      } else {
        setEventForm({ type: 'SEMINAR', title: '', date: '', description: '', capacity: 20, price: 0 });
      }
    }
    setView('form');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnouncement({
       title: announcementForm.title,
       content: announcementForm.content,
       isPinned: announcementForm.isPinned,
       authorId: user?.id || 'admin_1',
       authorName: user?.name || 'Admin',
       id: Math.random().toString(36).substr(2, 9),
       createdAt: new Date().toISOString()
    } as any);
    setView('list');
    setAnnouncementForm({ title: '', content: '', isPinned: false });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItemId) {
      updateEvent(editingItemId, {
        ...eventForm,
        type: eventForm.type as 'SEMINAR' | 'EXAM',
        price: eventForm.price > 0 ? eventForm.price : undefined,
        maxCapacity: eventForm.capacity
      });
    } else {
      addEvent({
        id: Math.random().toString(36).substr(2, 9),
        ...eventForm,
        type: eventForm.type as 'SEMINAR' | 'EXAM',
        price: eventForm.price > 0 ? eventForm.price : undefined,
        maxCapacity: eventForm.capacity,
        registeredCount: 0
      });
    }
    setView('list');
    setEventForm({ type: 'SEMINAR', title: '', date: '', description: '', capacity: 20, price: 0 });
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir?")) {
      deleteEvent(id);
    }
  };

  const handleExport = () => {
    if (activeTab === 'Avisos') {
      exportToCSV(
        announcements,
        [
          { header: 'Título', key: 'title' },
          { header: 'Autor', key: 'authorName' },
          { header: 'Fixo', key: (item) => item.isPinned ? 'Sim' : 'Não' },
          { header: 'Conteúdo', key: 'content' },
          { header: 'Data', key: 'createdAt' }
        ],
        'Relatorio_Avisos'
      );
    } else {
      exportToCSV(
        events,
        [
          { header: 'Título', key: 'title' },
          { header: 'Tipo', key: 'type' },
          { header: 'Data', key: 'date' },
          { header: 'Vagas Totais', key: 'capacity' },
          { header: 'Inscritos', key: 'registeredCount' },
          { header: 'Preço (R$)', key: 'price' }
        ],
        'Relatorio_Eventos_Internos'
      );
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-full bg-krav-bg relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Central de Comunicação</h1>
          <p className="text-sm text-krav-muted mt-1">Avisos na timeline e calendário de eventos/exames.</p>
        </div>
        
        {view === 'list' && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handleExport}
              className="bg-krav-card border border-krav-border text-krav-text hover:bg-black/5 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button 
              onClick={() => openForm()}
              className="bg-krav-accent hover:bg-krav-accent-light text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors justify-center shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{activeTab === 'Avisos' ? 'Novo Aviso' : 'Novo Evento'}</span>
            </button>
          </div>
        )}
      </div>

      {view === 'list' && (
        <div className="flex flex-col flex-1 min-h-0 bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden">
          {/* Header Tabs */}
          <div className="flex gap-2 border-b border-krav-border p-2 shrink-0 bg-black/[0.02]">
            <button 
              onClick={() => { setActiveTab('Avisos'); setAnnouncementsPage(1); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                activeTab === 'Avisos' ? 'bg-krav-card text-krav-accent shadow-sm border border-krav-border' : 'text-krav-muted hover:text-krav-text hover:bg-black/5'
              }`}
            >
              <Megaphone className="w-4 h-4" /> Mural de Avisos
            </button>
            <button 
              onClick={() => { setActiveTab('Eventos'); setEventsPage(1); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                activeTab === 'Eventos' ? 'bg-krav-card text-krav-accent shadow-sm border border-krav-border' : 'text-krav-muted hover:text-krav-text hover:bg-black/5'
              }`}
            >
              <CalendarIcon className="w-4 h-4" /> Eventos & Seminários
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'Avisos' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4 pb-4">
                  {paginatedAnnouncements.map((item) => (
                    <div key={item.id} className={`p-5 rounded-xl border flex gap-4 ${item.isPinned ? 'bg-krav-accent/5 border-krav-accent/30' : 'bg-krav-card hover:bg-black/[0.01] border-krav-border'}`}>
                      <div className="shrink-0 mt-1">
                        {item.isPinned ? (
                          <div className="w-8 h-8 rounded-full bg-krav-accent/20 flex items-center justify-center text-krav-accent">
                            <Pin className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-krav-bg border border-krav-border flex items-center justify-center text-krav-muted">
                            <Megaphone className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-base text-krav-text">{item.title}</h3>
                          <span className="text-[11px] text-krav-muted whitespace-nowrap hidden sm:block">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-krav-muted leading-relaxed mb-3 whitespace-pre-wrap">{item.content}</p>
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-bold text-krav-text">
                             {(item.authorName || 'A')[0]}
                           </div>
                           <span className="text-[11px] font-medium text-krav-muted">{item.authorName || 'Admin'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {paginatedAnnouncements.length === 0 && (
                    <div className="text-center py-12 text-krav-muted text-sm border border-dashed border-krav-border rounded-xl">
                      Nenhum aviso publicado.
                    </div>
                  )}
                </div>
                <Pagination currentPage={announcementsPage} totalPages={announcementsTotalPages} onPageChange={setAnnouncementsPage} />
              </div>
            )}

            {activeTab === 'Eventos' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6 self-start w-full">
                  {paginatedEvents.map((ev) => (
                    <div key={ev.id} onClick={() => openForm(ev.id)} className="bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden group cursor-pointer hover:border-krav-accent transition-colors">
                      <div className="absolute top-0 left-0 w-1 bg-krav-accent h-full opacity-50"></div>
                      <div className="flex justify-between items-start pl-2">
                         <div className="flex flex-col">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-krav-accent bg-krav-accent/10 px-2 py-0.5 rounded-full self-start mb-2">
                             {ev.type === 'EXAM' ? 'Exame de Faixa' : 'Seminário'}
                           </span>
                           <h3 className="font-bold text-lg leading-tight text-krav-text group-hover:text-krav-accent transition-colors pr-6">{ev.title}</h3>
                         </div>
                      </div>
                      
                      <div className="pl-2">
                         <p className="text-xs text-krav-muted line-clamp-2">{ev.description}</p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-krav-border flex justify-between items-center pl-2">
                         <div className="flex items-center gap-2">
                           <div className="bg-krav-bg px-2 py-1 rounded text-xs font-bold text-krav-text flex items-center gap-1.5">
                             <CalendarIcon className="w-3.5 h-3.5 text-krav-muted" />
                             {new Date(ev.date).toLocaleDateString('pt-BR')}
                           </div>
                           <div className="bg-krav-bg px-2 py-1 rounded text-xs font-bold text-krav-text flex items-center gap-1.5">
                             <Users className="w-3.5 h-3.5 text-krav-muted" />
                             {ev.registeredCount}/{ev.capacity || 50}
                           </div>
                         </div>
                         {ev.price && ev.price > 0 && (
                           <span className="font-bold text-krav-accent text-sm">R$ {ev.price.toFixed(2).replace('.', ',')}</span>
                         )}
                      </div>

                      <button onClick={(e) => handleDeleteEvent(ev.id, e)} className="absolute top-4 right-4 p-1.5 text-krav-muted hover:text-krav-danger rounded hover:bg-krav-danger/10 opacity-0 group-hover:opacity-100 transition-all bg-krav-card border border-transparent hover:border-krav-danger/20">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  ))}

                  {paginatedEvents.length === 0 && (
                    <div className="col-span-full text-center py-12 text-krav-muted text-sm border border-dashed border-krav-border rounded-xl">
                      Nenhum evento agendado.
                    </div>
                  )}
                </div>
                <Pagination currentPage={eventsPage} totalPages={eventsTotalPages} onPageChange={setEventsPage} />
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'form' && (
         <div className="absolute inset-x-0 bottom-0 top-0 bg-krav-bg z-20 flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="border-b border-krav-border bg-krav-card p-4 sm:p-6 flex items-center shrink-0 shadow-sm">
              <button 
                onClick={() => setView('list')}
                className="mr-4 p-2 hover:bg-black/5 rounded-full text-krav-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-lg flex items-center gap-2">
                {activeTab === 'Avisos' 
                  ? (editingItemId ? 'Editar Aviso' : 'Criar Novo Aviso')
                  : (editingItemId ? <span><Edit3 className="w-5 h-5 inline mr-2 text-krav-accent" />Editar Evento</span> : 'Criar Novo Evento')
                }
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-krav-card">
              {activeTab === 'Avisos' ? (
                <form onSubmit={handleCreateAnnouncement} className="max-w-2xl mx-auto flex flex-col gap-6">
                  <div>
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Título do Aviso</label>
                    <input type="text" value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} required className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors outline-none" placeholder="Ex: Mudança de Horário no Feriado" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Conteúdo</label>
                    <textarea rows={6} value={announcementForm.content} onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})} required className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors resize-none outline-none" placeholder="Digite o aviso completo..." />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer bg-krav-bg p-4 rounded-xl border border-krav-border hover:border-krav-accent/50 transition-colors">
                    <input type="checkbox" checked={announcementForm.isPinned} onChange={e => setAnnouncementForm({...announcementForm, isPinned: e.target.checked})} className="rounded text-krav-accent focus:ring-krav-accent w-5 h-5 border-krav-border bg-krav-card" />
                    <span className="text-sm font-medium text-krav-text">Fixar aviso no topo do mural</span>
                  </label>
                  <button type="submit" className="w-full bg-krav-accent hover:bg-krav-accent-light text-white py-3.5 rounded-xl font-bold shadow-md flex justify-center items-center gap-2 mt-4 transition-transform active:scale-95">
                    <Check className="w-5 h-5" /> Publicar Aviso
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCreateEvent} className="max-w-2xl mx-auto flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Título do Evento/Exame</label>
                       <input type="text" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} required className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors outline-none" placeholder="Ex: Seminário de Defesa Contra Faca" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Data e Hora</label>
                       <input type="datetime-local" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} required className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors outline-none font-medium" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Tipo de Evento</label>
                        <select value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value as any})} className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors outline-none font-medium appearance-none">
                          <option value="SEMINAR">Seminário/Workshop</option>
                          <option value="EXAM">Exame de Graduação</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Valor da Inscrição (R$)</label>
                        <input type="number" step="0.01" min="0" value={eventForm.price} onChange={e => setEventForm({...eventForm, price: parseFloat(e.target.value)})} required className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors outline-none font-medium" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Capacidade Máxima (Vagas)</label>
                        <input type="number" min="1" value={eventForm.capacity} onChange={e => setEventForm({...eventForm, capacity: parseInt(e.target.value)})} required className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors outline-none font-medium" />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Descrição Detalhada</label>
                       <textarea rows={6} value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} required className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors resize-none outline-none" placeholder="Descreva os requisitos, local, professor convidado, etc..." />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-krav-accent hover:bg-krav-accent-light text-white py-3.5 rounded-xl font-bold shadow-md flex justify-center items-center gap-2 mt-4 transition-transform active:scale-95">
                    <Check className="w-5 h-5" /> {editingItemId ? 'Salvar Modificações' : 'Criar Evento'}
                  </button>
                </form>
              )}
            </div>
         </div>
      )}
    </div>
  );
}
