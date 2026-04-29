import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function AnnouncementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const isEditing = Boolean(id);
  // Future-proofing editing announcements since it's just 'new' now
  // but let's implement it correctly.
  
  const announcements = useDataStore((state) => state.announcements);
  const addAnnouncement = useDataStore((state) => state.addAnnouncement);

  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', isPinned: false });

  useEffect(() => {
    if (isEditing && id) {
      const ann = announcements.find(a => a.id === id);
      if (ann) {
        setAnnouncementForm({
          title: ann.title,
          content: ann.content,
          isPinned: ann.isPinned || false
        });
      } else {
        navigate('/admin/events');
      }
    }
  }, [id, isEditing, announcements, navigate]);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    // Currently store doesn't have updateAnnouncement, so we only handle creation for now.
    // If edit is needed, we'd need to add updateAnnouncement to store. For now, assuming new.
    addAnnouncement({
       title: announcementForm.title,
       academyId: user?.academyId || '',
       content: announcementForm.content,
       isPinned: announcementForm.isPinned,
       authorId: user?.id || 'admin_1',
       authorName: user?.name || 'Admin',
       id: Math.random().toString(36).substr(2, 9),
       createdAt: new Date().toISOString()
    } as any);
    
    toast.success('Aviso criado com sucesso!');
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
            {isEditing ? 'Editar Aviso' : 'Criar Novo Aviso'}
          </h1>
        </div>
      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden p-6 md:p-8">
        <form onSubmit={handleCreateAnnouncement} className="flex flex-col gap-6">
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
          
          <div className="mt-4 pt-6 border-t border-krav-border flex gap-3 justify-end bg-krav-card">
            <button
               type="button"
               onClick={() => navigate('/admin/events')}
               className="px-4 py-2 text-sm font-medium text-krav-muted hover:text-krav-text transition-colors"
            >
              Cancelar
            </button>
            <button type="submit" className="bg-krav-accent hover:bg-krav-accent-light text-white px-6 py-2 rounded-xl font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95">
              <Check className="w-5 h-5" /> Publicar Aviso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
