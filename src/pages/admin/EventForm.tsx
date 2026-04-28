import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const isEditing = Boolean(id);
  const events = useDataStore((state) => state.events);
  const addEvent = useDataStore((state) => state.addEvent);
  const updateEvent = useDataStore((state) => state.updateEvent);

  const [eventForm, setEventForm] = useState({ type: 'SEMINAR', title: '', date: '', description: '', capacity: 20, price: 0 });

  useEffect(() => {
    if (isEditing && id) {
      const ev = events.find(e => e.id === id);
      if (ev) {
        setEventForm({ 
          title: ev.title, 
          description: ev.description, 
          date: ev.date.slice(0, 16), // datetime-local format
          type: ev.type as 'SEMINAR' | 'EXAM', 
          price: ev.price || 0, 
          capacity: ev.capacity || 20 
        });
      } else {
        navigate('/admin/events');
      }
    }
  }, [id, isEditing, events, navigate]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && id) {
      updateEvent(id, {
        ...eventForm,
        type: eventForm.type as 'SEMINAR' | 'EXAM',
        price: eventForm.price > 0 ? eventForm.price : undefined,
        maxCapacity: eventForm.capacity
      });
      toast.success('Evento atualizado com sucesso!');
    } else {
      addEvent({
        id: Math.random().toString(36).substr(2, 9),
        ...eventForm,
        type: eventForm.type as 'SEMINAR' | 'EXAM',
        price: eventForm.price > 0 ? eventForm.price : undefined,
        maxCapacity: eventForm.capacity,
        registeredCount: 0
      });
      toast.success('Evento criado com sucesso!');
    }
    navigate('/admin/events');
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/events')}
          className="p-2 hover:bg-black/20 rounded-lg text-krav-muted hover:text-krav-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">
            {isEditing ? 'Editar Evento' : 'Criar Novo Evento'}
          </h1>
        </div>
      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden p-6 md:p-8">
        <form onSubmit={handleCreateEvent} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
               <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Título do Evento/Exame</label>
               <input type="text" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} required className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors outline-none" placeholder="Ex: Seminário de Defesa Contra Faca" />
            </div>
            <div>
               <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Data e Hora</label>
               <input type="datetime-local" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} required className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors outline-none font-medium text-krav-text" style={{ colorScheme: 'dark' }} />
            </div>
            <div>
                <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Tipo de Evento</label>
                <select value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value as any})} className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors outline-none font-medium text-krav-text">
                  <option value="SEMINAR">Seminário/Workshop</option>
                  <option value="EXAM">Exame de Graduação</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Valor da Inscrição (R$)</label>
                <input type="number" step="0.01" min="0" value={eventForm.price} onChange={e => setEventForm({...eventForm, price: parseFloat(e.target.value)})} required className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors outline-none font-medium text-krav-text" />
            </div>
            <div>
                <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Capacidade Máxima (Vagas)</label>
                <input type="number" min="1" value={eventForm.capacity} onChange={e => setEventForm({...eventForm, capacity: parseInt(e.target.value)})} required className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors outline-none font-medium text-krav-text" />
            </div>
            <div className="md:col-span-2">
               <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Descrição Detalhada</label>
               <textarea rows={6} value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} required className="w-full px-4 py-3 bg-krav-bg border border-krav-border focus:border-krav-accent rounded-xl text-sm transition-colors resize-none outline-none text-krav-text" placeholder="Descreva os requisitos, local, professor convidado, etc..." />
            </div>
          </div>
          
          <div className="mt-4 pt-6 border-t border-krav-border flex gap-3 justify-end bg-krav-card">
            <button
               type="button"
               onClick={() => navigate('/admin/events')}
               className="px-4 py-2 text-sm font-medium text-krav-muted hover:text-krav-text transition-colors"
            >
              Cancelar
            </button>
            <button type="submit" className="bg-krav-accent hover:bg-krav-accent-light text-white px-6 py-2 rounded-xl font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95">
              <Check className="w-5 h-5" /> {isEditing ? 'Salvar Modificações' : 'Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
