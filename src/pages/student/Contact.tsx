import React, { useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { MapPin, Phone, Mail, Globe, MessageCircle } from 'lucide-react';
import { BeltBadge } from '../../components/shared/BeltBadge';

export default function Contact() {
  const user = useAuthStore((state) => state.user);
  const academiesSettings = useDataStore((state) => state.academiesSettings);
  const students = useDataStore((state) => state.students);

  const academyInfo = useMemo(() => {
    if (!user) return null;
    return academiesSettings.find(a => a.id === user.academyId);
  }, [user, academiesSettings]);

  const teamMembers = useMemo(() => {
    if (!user) return [];
    return students.filter(
      s => s.academyId === user.academyId && (s.role === 'ADMIN' || s.role === 'INSTRUCTOR')
    ).sort((a, b) => {
      // ADM first, then Instructor
      if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
      if (b.role === 'ADMIN' && a.role !== 'ADMIN') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [students, user]);

  if (!user || !academyInfo) {
    return <div className="p-6 md:p-8">Carregando informações...</div>;
  }

  const formatWhatsAppLink = (phone: string | undefined) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/55${cleanPhone}`;
  };

  const getEmbedMapUrl = (address: string) => {
    // Basic Google Maps embed URL
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-krav-text">Contato e Informações</h1>
        <p className="text-sm text-krav-muted mt-1">Conecte-se com a academia e com nossos instrutores.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academy Info Card */}
        <section className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-krav-border bg-black/5 dark:bg-white/5">
            <h2 className="text-lg font-bold text-krav-text uppercase tracking-wide">
              {academyInfo.academyName || 'Academia'}
            </h2>
          </div>
          
          <div className="p-6 flex flex-col gap-6 flex-1">
            {academyInfo.address && (
              <div className="flex gap-4">
                <div className="mt-1 bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-krav-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-krav-text uppercase tracking-wider mb-1">Endereço</h3>
                  <p className="text-sm text-krav-muted leading-relaxed">{academyInfo.address}</p>
                </div>
              </div>
            )}

            {academyInfo.whatsapp && (
              <div className="flex gap-4">
                <div className="mt-1 bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-krav-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-krav-text uppercase tracking-wider mb-1">Telefone / WhatsApp</h3>
                  <a href={formatWhatsAppLink(academyInfo.whatsapp)} target="_blank" rel="noreferrer" className="text-sm text-krav-text font-medium hover:text-krav-accent transition-colors flex items-center gap-2">
                    {academyInfo.whatsapp}
                    <MessageCircle className="w-4 h-4 text-green-500" />
                  </a>
                </div>
              </div>
            )}

            {academyInfo.email && (
              <div className="flex gap-4">
                <div className="mt-1 bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                  <Mail className="w-5 h-5 text-krav-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-krav-text uppercase tracking-wider mb-1">E-mail</h3>
                  <a href={`mailto:${academyInfo.email}`} className="text-sm text-krav-text font-medium hover:text-krav-accent transition-colors">
                    {academyInfo.email}
                  </a>
                </div>
              </div>
            )}

            {academyInfo.website && (
              <div className="flex gap-4">
                <div className="mt-1 bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                  <Globe className="w-5 h-5 text-krav-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-krav-text uppercase tracking-wider mb-1">Website</h3>
                  <a href={academyInfo.website.startsWith('http') ? academyInfo.website : `https://${academyInfo.website}`} target="_blank" rel="noreferrer" className="text-sm text-krav-text font-medium hover:text-krav-accent transition-colors">
                    {academyInfo.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Map Section */}
        {academyInfo.address && (
          <section className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden min-h-[300px]">
             <iframe 
               width="100%" 
               height="100%" 
               frameBorder="0" 
               scrolling="no" 
               marginHeight={0} 
               marginWidth={0} 
               src={getEmbedMapUrl(academyInfo.address)}
               title="Mapa da Academia"
             ></iframe>
          </section>
        )}
      </div>

      {/* Instructors & Admin List */}
      <section>
        <h2 className="text-lg font-bold text-krav-text uppercase tracking-wide mb-6">Equipe de Instrutores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map(member => (
            <div key={member.id} className="bg-krav-card border border-krav-border rounded-xl p-5 shadow-sm hover:border-krav-accent/50 transition-colors flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 border-2 border-krav-border flex items-center justify-center font-bold text-xl text-krav-muted mb-4">
                {member.name.charAt(0)}
              </div>
              
              <h3 className="font-bold text-krav-text text-lg">{member.name}</h3>
              <p className="text-xs font-semibold text-krav-accent uppercase tracking-widest mt-1 mb-3">
                {member.role === 'ADMIN' ? 'Professor / Diretor' : 'Instrutor'}
              </p>
              
              <BeltBadge belt={member.beltLevel} className="mb-6 justify-center" />

              <div className="w-full space-y-3 mt-auto pt-4 border-t border-krav-border">
                {member.phone && (
                  <a 
                    href={formatWhatsAppLink(member.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-between items-center w-full bg-black/5 dark:bg-white/5 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 p-2.5 rounded-lg text-sm font-medium transition-colors group"
                  >
                    <span className="text-krav-text group-hover:text-green-600 dark:group-hover:text-green-400">{member.phone}</span>
                    <MessageCircle className="w-4 h-4 text-krav-muted group-hover:text-green-500" />
                  </a>
                )}
                {member.email && (
                  <a 
                    href={`mailto:${member.email}`}
                    className="flex justify-between items-center w-full bg-black/5 dark:bg-white/5 hover:bg-krav-accent/10 hover:text-krav-accent p-2.5 rounded-lg text-sm font-medium transition-colors group"
                  >
                    <span className="text-krav-text group-hover:text-krav-accent truncate pr-2 max-w-[200px]">{member.email}</span>
                    <Mail className="w-4 h-4 text-krav-muted group-hover:text-krav-accent shrink-0" />
                  </a>
                )}
              </div>
            </div>
          ))}
          {teamMembers.length === 0 && (
            <div className="col-span-full py-8 text-center text-krav-muted text-sm italic">
              Nenhum membro da equipe encontrado.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
