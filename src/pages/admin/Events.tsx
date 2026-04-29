import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Megaphone, Pin, Plus, Calendar as CalendarIcon, Users, ArrowLeft, Check, Edit3, Trash2, Download } from 'lucide-react';
import { Pagination } from '../../components/shared/Pagination';
import { AcademyEvent, Announcement } from '../../types';
import { exportToCSV } from '../../lib/csv';

export default function Announcements() {
  const allAnnouncements = useDataStore((state) => state.announcements);
  const allEvents = useDataStore((state) => state.events);
  const user = useAuthStore((state) => state.user);
  
  const announcements = React.useMemo(() => allAnnouncements.filter(a => a.academyId === user?.academyId), [allAnnouncements, user]);
  const events = React.useMemo(() => allEvents.filter(e => e.academyId === user?.academyId), [allEvents, user]);
  
  const addAnnouncement = useDataStore((state) => state.addAnnouncement);
  const addEvent = useDataStore((state) => state.addEvent);
  const updateEvent = useDataStore((state) => state.updateEvent);
  const deleteEvent = useDataStore((state) => state.deleteEvent);
  
  const [activeTab, setActiveTab] = useState<'Avisos' | 'Eventos'>('Avisos');
  const navigate = useNavigate();

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

  const openForm = (editId?: string) => {
    if (activeTab === 'Avisos') {
      if (editId) navigate(`/admin/announcements/new`); // We don't have updateAnnouncement right now, so we only handle creation
      else navigate(`/admin/announcements/new`);
    } else {
      if (editId) navigate(`/admin/events/${editId}`);
      else navigate(`/admin/events/new`);
    }
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
    <div className="p-6 md:p-8 flex flex-col bg-krav-bg relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Central de Comunicação</h1>
          <p className="text-sm text-krav-muted mt-1">Avisos na timeline e calendário de eventos/exames.</p>
        </div>
        
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
      </div>

      <div className="flex flex-col bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden mb-8">
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
    </div>
  );
}
