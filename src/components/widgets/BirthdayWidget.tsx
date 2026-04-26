import React, { useMemo } from 'react';
import { Gift, MessageCircle } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function BirthdayWidget() {
  const user = useAuthStore((state) => state.user);
  const students = useDataStore((state) => state.students);
  const academiesSettings = useDataStore((state) => state.academiesSettings);
  const settings = academiesSettings.find(s => s.id === user?.academyId) || academiesSettings[0];

  const birthdaysThisMonth = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    
    // Filtra alunos ativos que fazem aniversário este mês e pertencem à mesma academia
    const incoming = students.filter(s => {
      if (s.academyId !== user?.academyId) return false;
      if (s.role !== 'STUDENT' || s.enrollmentStatus !== 'ACTIVE' || !s.birthDate) return false;
      const bDate = new Date(s.birthDate);
      return bDate.getMonth() === currentMonth;
    });

    // Ordena pelo dia
    return incoming.sort((a, b) => {
      const dayA = new Date(a.birthDate!).getDate();
      const dayB = new Date(b.birthDate!).getDate();
      if (dayA !== dayB) return dayA - dayB;
      return 0;
    });
  }, [students]);

  const getWhatsAppLink = (student: any) => {
    let phone = student.phone?.replace(/\D/g, '') || '';
    if (phone && !phone.startsWith('55')) {
      phone = '55' + phone;
    }
    
    const template = settings.whatsappMessages?.birthday || 'Parabéns!';
    let message = template
      .replace(/{nome}/g, student.name.split(' ')[0])
      .replace(/{academia}/g, settings.academyName || settings.systemName || 'nossa equipe');

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  if (birthdaysThisMonth.length === 0) {
    return (
      <div className="bg-krav-card border text-krav-text border-krav-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-4 h-4 text-krav-accent" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Aniversariantes do Mês</h3>
        </div>
        <p className="text-sm text-krav-muted">Nenhum aluno ativo faz aniversário este mês.</p>
      </div>
    );
  }

  const today = new Date().getDate();

  return (
    <div className="bg-krav-card border text-krav-text border-krav-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-4 h-4 text-krav-accent" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Aniversariantes do Mês</h3>
      </div>
      <div className="space-y-3">
        {birthdaysThisMonth.map(student => {
          const bDate = new Date(student.birthDate!);
          const isToday = bDate.getDate() === today;

          return (
            <div 
              key={student.id} 
              className={`flex justify-between items-center bg-krav-card border border-krav-border p-3 rounded-lg shadow-sm ${isToday ? 'border-krav-accent bg-krav-accent/5' : ''}`}
            >
              <div>
                <p className="font-bold text-sm text-krav-text flex items-center gap-2">
                  {student.name}
                  {isToday && <span className="text-[10px] bg-krav-accent text-white px-1.5 py-0.5 rounded font-bold uppercase">Hoje</span>}
                </p>
                <p className="text-[11px] text-krav-muted font-medium mt-0.5">
                  Dia {bDate.getDate().toString().padStart(2, '0')}
                </p>
              </div>
              <a 
                href={getWhatsAppLink(student)}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] text-white p-2 rounded-lg hover:bg-[#20BE5C] transition-colors"
                title="Mandar mensagem no WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
