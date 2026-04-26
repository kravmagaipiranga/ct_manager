import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { BeltBadge } from '../../components/shared/BeltBadge';
import { User, Phone, Mail, Edit3, Save, X, Calendar as CalendarIcon, Clock, Video, BookOpen } from 'lucide-react';
import { ClassSession, Belt } from '../../types';

export default function StudentProfile() {
  const user = useAuthStore((state) => state.user);
  
  const classes = useDataStore((state) => state.classes);
  const techniques = useDataStore((state) => state.techniques);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpf: user?.cpf || '',
    birthDate: user?.birthDate || '',
    shirtSize: user?.shirtSize || '',
    pantsSize: user?.pantsSize || '',
    emergencyName: user?.emergencyContact?.name || '',
    emergencyPhone: user?.emergencyContact?.phone || '',
    emergencyRelation: user?.emergencyContact?.relationship || ''
  });
  const [pendingApproval, setPendingApproval] = useState(false);

  if (!user) return null;

  // Filter relevant schedules
  const myClasses = classes.filter(c => 
    !c.allowedBelts || c.allowedBelts.length === 0 || c.allowedBelts.includes(user.beltLevel as Belt)
  );

  // Group classes by day
  const classesByDay: { [key: number]: ClassSession[] } = {};
  myClasses.forEach(c => {
    if (!classesByDay[c.dayOfWeek]) classesByDay[c.dayOfWeek] = [];
    classesByDay[c.dayOfWeek].push(c);
  });
  
  const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  // Filter curriculum
  const myCurriculum = techniques.filter(t => t.belt === user.beltLevel);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingApproval(true);
    setIsEditing(false);
    // In a real app, this would send an approval request to the admin dashboard
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6 bg-krav-bg min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Meu Perfil</h1>
          <p className="text-sm text-krav-muted mt-1">Visualize suas informações, horários e currículo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden flex flex-col h-max">
          <div className="h-24 bg-krav-accent/10 relative">
             <div className="absolute -bottom-10 left-6 w-20 h-20 bg-krav-card rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                <div className="w-full h-full bg-krav-bg rounded-full flex items-center justify-center text-krav-muted font-bold text-2xl uppercase">
                  {user.name.substring(0, 2)}
                </div>
             </div>
          </div>
          <div className="pt-12 p-6 flex-1">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <h2 className="text-lg font-bold text-krav-text">{user.name}</h2>
                 <BeltBadge belt={user.beltLevel || 'WHITE'} className="mt-2" />
               </div>
               {!isEditing && (
                 <button onClick={() => setIsEditing(true)} className="p-2 text-krav-muted hover:text-krav-accent hover:bg-black/5 rounded-full transition-colors">
                   <Edit3 className="w-4 h-4" />
                 </button>
               )}
             </div>

             {pendingApproval && (
               <div className="mb-4 bg-krav-warning/10 border border-krav-warning/20 p-3 rounded-lg text-xs font-bold text-krav-warning flex items-start gap-2">
                 <span>Suas alterações foram enviadas e estão aguardando aprovação do administrador.</span>
               </div>
             )}

             {isEditing ? (
               <form onSubmit={handleSave} className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">Nome Completo</label>
                      <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full text-sm p-2 bg-krav-bg border border-krav-border rounded-lg focus:border-krav-accent outline-none" required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div>
                         <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">CPF</label>
                         <input type="text" value={editForm.cpf} onChange={e => setEditForm({...editForm, cpf: e.target.value})} className="w-full text-sm p-2 bg-krav-bg border border-krav-border rounded-lg focus:border-krav-accent outline-none" required />
                       </div>
                       <div>
                         <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">Nascimento</label>
                         <input type="date" value={editForm.birthDate} onChange={e => setEditForm({...editForm, birthDate: e.target.value})} className="w-full text-sm p-2 bg-krav-bg border border-krav-border rounded-lg focus:border-krav-accent outline-none" required />
                       </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">Telefone</label>
                      <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full text-sm p-2 bg-krav-bg border border-krav-border rounded-lg focus:border-krav-accent outline-none" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">E-mail</label>
                      <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full text-sm p-2 bg-krav-bg border border-krav-border rounded-lg focus:border-krav-accent outline-none" required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div>
                         <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">Tamanho Camiseta</label>
                         <input type="text" value={editForm.shirtSize} onChange={e => setEditForm({...editForm, shirtSize: e.target.value})} className="w-full text-sm p-2 bg-krav-bg border border-krav-border rounded-lg focus:border-krav-accent outline-none" />
                       </div>
                       <div>
                         <label className="block text-[10px] font-bold text-krav-muted mb-1 uppercase tracking-wider">Tamanho Calça</label>
                         <input type="text" value={editForm.pantsSize} onChange={e => setEditForm({...editForm, pantsSize: e.target.value})} className="w-full text-sm p-2 bg-krav-bg border border-krav-border rounded-lg focus:border-krav-accent outline-none" />
                       </div>
                    </div>
                    
                    <div className="pt-2 border-t border-krav-border mt-1">
                      <h4 className="font-bold text-[10px] text-krav-accent mb-2 uppercase">Contato de Emergência</h4>
                      <input type="text" value={editForm.emergencyName} onChange={e => setEditForm({...editForm, emergencyName: e.target.value})} className="w-full text-sm p-2 bg-krav-bg border border-krav-border rounded-lg focus:border-krav-accent outline-none mb-2" placeholder="Nome" />
                      <div className="grid grid-cols-2 gap-2">
                         <input type="text" value={editForm.emergencyPhone} onChange={e => setEditForm({...editForm, emergencyPhone: e.target.value})} className="w-full text-sm p-2 bg-krav-bg border border-krav-border rounded-lg focus:border-krav-accent outline-none" placeholder="Telefone" />
                         <input type="text" value={editForm.emergencyRelation} onChange={e => setEditForm({...editForm, emergencyRelation: e.target.value})} className="w-full text-sm p-2 bg-krav-bg border border-krav-border rounded-lg focus:border-krav-accent outline-none" placeholder="Parentesco" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 text-xs font-bold bg-krav-bg text-krav-text rounded-lg border border-krav-border hover:bg-black/5 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-1 py-2 text-xs font-bold bg-krav-accent text-white rounded-lg shadow-sm hover:bg-krav-accent-light transition-colors flex justify-center items-center gap-1.5">
                      <Save className="w-3.5 h-3.5" /> Salvar
                    </button>
                  </div>
               </form>
             ) : (
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-2 border-b border-krav-border pb-3">
                   <div className="flex items-center justify-between text-sm text-krav-text">
                     <span className="text-krav-muted font-medium">CPF</span>
                     <span className="font-bold">{user.cpf || '-'}</span>
                   </div>
                   <div className="flex items-center justify-between text-sm text-krav-text">
                     <span className="text-krav-muted font-medium">Nascimento</span>
                     <span className="font-bold">{user.birthDate ? new Date(user.birthDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</span>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-3 text-sm text-krav-text">
                   <Phone className="w-4 h-4 text-krav-muted" />
                   {user.phone || 'Nenhum telefone'}
                 </div>
                 <div className="flex items-center gap-3 text-sm text-krav-text">
                   <Mail className="w-4 h-4 text-krav-muted" />
                   {user.email || 'Nenhum email'}
                 </div>

                 {(user.shirtSize || user.pantsSize) && (
                   <div className="border-t border-krav-border pt-3 mt-1 flex flex-col gap-1 text-sm">
                      <h4 className="font-bold text-[10px] text-krav-muted uppercase">Tamanhos</h4>
                      {user.shirtSize && <div><span className="text-krav-muted mr-2">Camiseta:</span> <span className="font-bold">{user.shirtSize}</span></div>}
                      {user.pantsSize && <div><span className="text-krav-muted mr-2">Calça:</span> <span className="font-bold">{user.pantsSize}</span></div>}
                   </div>
                 )}

                 {user.emergencyContact?.name && (
                   <div className="bg-krav-accent/5 p-3 rounded-lg border border-krav-accent/10 mt-2">
                     <h4 className="font-bold text-[10px] text-krav-accent uppercase tracking-wider mb-2">Emergência</h4>
                     <p className="font-bold text-sm text-krav-text">{user.emergencyContact.name}</p>
                     <p className="text-sm text-krav-text">{user.emergencyContact.phone}</p>
                     <p className="text-xs text-krav-muted mt-1">{user.emergencyContact.relationship}</p>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>

        {/* Schedule & Curriculum */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           
           {/* My Schedule */}
           <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="p-4 border-b border-krav-border bg-black/5 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-krav-accent" />
                <h2 className="font-bold text-krav-text">Meus Horários de Aula</h2>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(classesByDay).sort().map(dayStr => {
                    const dayIndex = parseInt(dayStr);
                    const dayName = DAYS[dayIndex];
                    return (
                      <div key={dayIndex} className="bg-krav-bg border border-krav-border rounded-lg p-3">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-krav-muted mb-2 border-b border-krav-border pb-1">{dayName}</h3>
                        <div className="flex flex-col gap-2">
                          {classesByDay[dayIndex].map(c => (
                            <div key={c.id} className="flex justify-between items-center bg-krav-card p-2 text-sm rounded border border-krav-border shadow-sm">
                              <div>
                                <p className="font-bold text-krav-text leading-tight">{c.name}</p>
                                <p className="text-[10px] text-krav-muted">{c.instructorName}</p>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-xs text-krav-accent font-bold bg-krav-accent/10 px-2 py-1 rounded">
                                <Clock className="w-3 h-3" />
                                {c.time}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {Object.keys(classesByDay).length === 0 && (
                     <div className="col-span-full py-10 text-center text-sm text-krav-muted border border-dashed border-krav-border rounded-lg">
                       Não há turmas disponíveis para a sua graduação no momento.
                     </div>
                  )}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
