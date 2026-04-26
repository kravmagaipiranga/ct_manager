import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { formatWhatsAppLink } from '../../lib/utils';
import { Download, Copy, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function StudentFinancial() {
  const user = useAuthStore((state) => state.user);
  const academiesSettings = useDataStore((state) => state.academiesSettings);
  const settings = academiesSettings.find(s => s.id === user?.academyId) || academiesSettings[0];
  const financials = useDataStore((state) => state.financials).filter(f => f.studentId === user?.id);
  
  const [copied, setCopied] = useState(false);

  // Sort by date descending
  const sortedFinancials = [...financials].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  
  const latestFinancial = sortedFinancials[0];
  const history = sortedFinancials.slice(1);

  const pixKey = settings.pixKey || 'kravmagaipiranga@gmail.com';
  const whatsappNumber = settings.whatsapp || '5511999999999';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPlanName = "Plano Regular"; // Mocked plan name

  return (
    <div className="p-4 sm:p-6 mb-20 md:mb-0 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-krav-text uppercase tracking-tight">Financeiro</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Current Plan / Latest Status */}
        <div className="bg-krav-card p-6 rounded-xl border border-krav-border shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-krav-muted uppercase tracking-wider mb-4 border-b border-krav-border pb-2">Situação Atual</h2>
            
            {latestFinancial ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-krav-muted font-medium">Plano</span>
                  <span className="font-bold text-krav-text">{currentPlanName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-krav-muted font-medium">Referência</span>
                  <span className="font-bold text-krav-text">{latestFinancial.referenceMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-krav-muted font-medium">Vencimento</span>
                  <span className="font-bold text-krav-text">
                    {new Date(latestFinancial.dueDate + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-center h-8">
                  <span className="text-sm text-krav-muted font-medium">Status</span>
                  {latestFinancial.status === 'PAID' ? (
                     <span className="px-2 py-1 bg-krav-success/15 text-krav-success border border-krav-success/20 rounded font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                       <CheckCircle className="w-3.5 h-3.5" /> Pago
                     </span>
                  ) : latestFinancial.status === 'OVERDUE' ? (
                     <span className="px-2 py-1 bg-krav-danger/15 text-krav-danger border border-krav-danger/20 rounded font-bold text-xs uppercase tracking-wider">
                       Em Atraso
                     </span>
                  ) : (
                     <span className="px-2 py-1 bg-krav-warning/15 text-krav-warning border border-krav-warning/20 rounded font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                       <Clock className="w-3.5 h-3.5" /> Pendente
                     </span>
                  )}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-krav-border">
                  <span className="text-sm text-krav-muted font-medium">Valor</span>
                  <span className="text-xl font-black text-krav-accent">
                    R$ {latestFinancial.amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-krav-muted">Nenhum registro financeiro encontrado.</p>
            )}
          </div>
        </div>

        {/* Payment Actions */}
        <div className="bg-krav-bg p-6 rounded-xl border border-krav-border flex flex-col space-y-6">
          <h2 className="text-sm font-bold text-krav-muted uppercase tracking-wider border-b border-krav-border pb-2">Pagamento</h2>
          
          <div className="bg-krav-card p-4 rounded-lg border border-krav-border/50 text-center space-y-3">
             <p className="text-xs font-bold text-krav-muted uppercase tracking-wider">Chave PIX (E-mail/CNPJ)</p>
             <p className="font-bold text-krav-text text-lg select-all break-all">{pixKey}</p>
             <button 
                onClick={handleCopyPix}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-black text-white hover:bg-black/80 rounded-md font-bold text-sm transition-colors mt-2"
             >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar Chave PIX'}
             </button>
          </div>

          <div className="flex flex-col gap-2">
             <p className="text-xs text-center text-krav-muted mb-2">Precisa pagar em boleto ou tem alguma dúvida?</p>
             <a 
               href={formatWhatsAppLink(whatsappNumber, `Olá! Sou o aluno ${user?.name}. Gostaria de solicitar um boleto ou tenho dúvidas sobre minha mensalidade.`)}
               target="_blank" rel="noopener noreferrer"
               className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] text-white hover:bg-[#1ebd5a] rounded-md font-bold text-sm transition-colors"
             >
               Solicitar via WhatsApp
             </a>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {history.length > 0 && (
        <div className="bg-krav-card p-6 rounded-xl border border-krav-border shadow-sm">
           <h2 className="text-sm font-bold text-krav-muted uppercase tracking-wider mb-4">Histórico Anteriores</h2>
           <div className="space-y-3">
             {history.map((record) => (
                <div key={record.id} className="flex justify-between items-center p-3 hover:bg-black/5 rounded-lg border border-transparent hover:border-krav-border transition-colors">
                   <div className="flex flex-col">
                      <span className="font-bold text-sm text-krav-text">{record.referenceMonth}</span>
                      <span className="text-xs text-krav-muted">Venc. {new Date(record.dueDate + 'T12:00:00Z').toLocaleDateString('pt-BR')}</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="font-bold text-krav-text text-sm">R$ {record.amount.toFixed(2).replace('.', ',')}</span>
                      {record.status === 'PAID' ? (
                        <CheckCircle className="w-4 h-4 text-krav-success" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-krav-warning shrink-0" />
                      )}
                   </div>
                </div>
             ))}
           </div>
        </div>
      )}

    </div>
  );
}
