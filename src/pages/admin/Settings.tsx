import React, { useState, useRef } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Save, CheckCircle, Image as ImageIcon, Download, UploadCloud, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Settings() {
  const user = useAuthStore((state) => state.user);
  const academiesSettings = useDataStore((state) => state.academiesSettings);
  const updateAcademySettings = useDataStore((state) => state.updateAcademySettings);
  const importBackup = useDataStore((state) => state.importBackup);
  
  const settings = academiesSettings.find(s => s.id === user?.academyId) || academiesSettings[0];
  
  const [formData, setFormData] = useState({
    systemName: settings.systemName || '',
    academyName: settings.academyName || '',
    cnpj: settings.cnpj || '',
    pixKey: settings.pixKey || '',
    address: settings.address || '',
    whatsapp: settings.whatsapp || '',
    email: settings.email || '',
    website: settings.website || '',
    logoUrl: settings.logoUrl || '',
    whatsappMessages: settings.whatsappMessages || {
      birthday: '',
      inactive: ''
    }
  });

  const [successMsg, setSuccessMsg] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.academyId) {
      updateAcademySettings(user.academyId, formData);
    }
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handleExportBackup = () => {
    const state = useDataStore.getState();
    // Exclude functions and non-data state
    const { 
      academiesSettings, students, classes, checkins, products, orders, financials, 
      techniques, announcements, events, appointments, curriculumTexts, classLogs 
    } = state as any;
    
    const backupData = {
      academiesSettings, students, classes, checkins, products, orders, financials, 
      techniques, announcements, events, appointments, curriculumTexts, classLogs
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    
    const date = new Date().toISOString().split('T')[0];
    downloadAnchorNode.setAttribute("download", `krav-backup-${date}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    setBackupMsg('Backup exportado com sucesso!');
    setTimeout(() => setBackupMsg(''), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importBackup(json);
        setBackupMsg('Dados importados com sucesso!');
      } catch (error) {
        console.error("Failed to parse backup:", error);
        setBackupMsg('Erro ao ler arquivo. Formato inválido.');
      }
      setTimeout(() => setBackupMsg(''), 3000);
      if (fileInputRef.current) fileInputRef.current.value = ''; // reset
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-full max-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-krav-text">Configurações</h1>
        <p className="text-sm text-krav-muted mt-1">Gerencie os detalhes do sistema e da sua unidade.</p>
      </div>

      <div className="w-full pb-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl">
          
          {/* Identidade e Marca */}
          <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-krav-border bg-black/5">
              <h2 className="font-bold text-krav-text">Identidade da Academia</h2>
              <p className="text-xs text-krav-muted mt-1">Informações principais que refletem nas telas e faturas.</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-krav-text mb-1.5 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-krav-muted" /> Logotipo da Academia
                </label>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  {formData.logoUrl && (
                    <div className="w-24 h-24 border border-krav-border rounded-lg overflow-hidden bg-krav-card flex items-center justify-center p-2">
                      <img 
                        src={formData.logoUrl} 
                        alt="Preview Logotipo" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 w-full">
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="url" 
                        value={formData.logoUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="https://exemplo.com/logo.png ou carregue um arquivo"
                        className="flex-1 px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text focus:outline-none focus:border-krav-accent transition-colors text-sm"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        id="logo-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (readerEvent) => {
                              const base64 = readerEvent.target?.result as string;
                              setFormData(prev => ({ ...prev, logoUrl: base64 }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label 
                        htmlFor="logo-upload"
                        className="bg-krav-sidebar border border-krav-border text-white hover:bg-krav-card/10 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <UploadCloud className="w-4 h-4" /> Upload Foto
                      </label>
                    </div>
                    <p className="text-[10px] text-krav-muted">Recomendado: Logo em PNG ou JPG com fundo transparente ou branco.</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-krav-text mb-1.5">Nome do Sistema (Curto)</label>
                <input 
                  type="text" 
                  value={formData.systemName}
                  onChange={(e) => setFormData(prev => ({ ...prev, systemName: e.target.value }))}
                  placeholder="Ex: Minha Academia"
                  className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text focus:outline-none focus:border-krav-accent transition-colors text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-krav-text mb-1.5">Nome Completo da Unidade</label>
                <input 
                  type="text" 
                  value={formData.academyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, academyName: e.target.value }))}
                  placeholder="Ex: Centro de Treinamento Tático Zona Sul"
                  className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text focus:outline-none focus:border-krav-accent transition-colors text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dados Cadastrais e Redes */}
          <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-krav-border bg-black/5">
              <h2 className="font-bold text-krav-text">Dados Cadastrais & Contato</h2>
              <p className="text-xs text-krav-muted mt-1">Usados como forma de contato com os alunos e visíveis na conta.</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-krav-text mb-1.5">CNPJ</label>
                <input 
                  type="text" 
                  value={formData.cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text focus:outline-none focus:border-krav-accent transition-colors text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-krav-text mb-1.5">Endereço (Com Mapa/Referência)</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ex: Av. Exemplo, 1234, Centro - (URL de Mapa ou Escrito)"
                  className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text focus:outline-none focus:border-krav-accent transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-krav-text mb-1.5">WhatsApp / Telefone</label>
                <input 
                  type="text" 
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="(00) 90000-0000"
                  className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text focus:outline-none focus:border-krav-accent transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-krav-text mb-1.5">E-mail Comercial</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contato@minhaacademia.com"
                  className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text focus:outline-none focus:border-krav-accent transition-colors text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-krav-text mb-1.5">Website</label>
                <input 
                  type="url" 
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://minhaacademia.com.br"
                  className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text focus:outline-none focus:border-krav-accent transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          {/* Financeiro */}
          <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-krav-border bg-black/5">
              <h2 className="font-bold text-krav-text">Financeiro Principal</h2>
              <p className="text-xs text-krav-muted mt-1">Necessário para cobranças e mensalidades dos alunos.</p>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-semibold text-krav-text mb-1.5">Chave PIX de Recebimento</label>
                <input 
                  type="text" 
                  value={formData.pixKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
                  placeholder="E-mail, CPF/CNPJ, Telefone ou Aleatória"
                  className="w-full md:w-1/2 px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text focus:outline-none focus:border-krav-accent transition-colors text-sm"
                />
                <p className="text-[11px] text-krav-muted mt-1.5">Esta chave será apresentada nas telas de pagamento ao seu aluno.</p>
              </div>
            </div>
          </div>

          {/* Mensagens Automáticas (WhatsApp) */}
          <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-krav-border bg-black/5">
              <h2 className="font-bold text-krav-text">Mensagens Padrões de WhatsApp</h2>
              <p className="text-xs text-krav-muted mt-1">Configure os textos de envio rápido. Variáveis disponíveis: {'{nome}'}, {'{academia}'}</p>
            </div>
            <div className="p-6 grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-semibold text-krav-text mb-1.5">Aniversário do Aluno</label>
                <textarea 
                  value={formData.whatsappMessages?.birthday || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    whatsappMessages: { ...prev.whatsappMessages, birthday: e.target.value } 
                  }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text focus:outline-none focus:border-krav-accent transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-krav-text mb-1.5">Aluno Ausente (Retenção)</label>
                <textarea 
                  value={formData.whatsappMessages?.inactive || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    whatsappMessages: { ...prev.whatsappMessages, inactive: e.target.value } 
                  }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-krav-border rounded-lg bg-krav-bg text-krav-text focus:outline-none focus:border-krav-accent transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          {/* Backup e Restauração */}
          <div className="bg-krav-card border border-krav-border rounded-xl shadow-sm overflow-hidden mt-6 mb-2">
            <div className="p-5 border-b border-krav-border bg-black/5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-krav-text flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-krav-warning" /> Backup e Recuperação
                </h2>
                <p className="text-xs text-krav-muted mt-1">Gere um arquivo de segurança com todas as informações, ou restaure um backup prévio.</p>
              </div>
              {backupMsg && (
                 <span className={cn(
                   "text-xs font-bold px-3 py-1 rounded bg-black/5 animate-in fade-in slide-in-from-right-2 duration-300",
                   backupMsg.includes('Erro') ? "text-krav-danger" : "text-krav-success"
                 )}>
                   {backupMsg}
                 </span>
              )}
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex flex-col gap-3">
                 <p className="text-sm text-krav-muted font-medium">Você pode exportar todas as informações do sistema (Alunos, Treinos, Financeiro, Produtos, Check-ins, etc) para um arquivo .json de segurança.</p>
                 <button 
                   type="button" 
                   onClick={handleExportBackup}
                   className="w-full sm:w-auto bg-black text-white hover:bg-black/80 px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                 >
                   <Download className="w-4 h-4" /> Exportar Backup (JSON)
                 </button>
               </div>
               
               <div className="flex flex-col gap-3">
                 <p className="text-sm text-krav-muted font-medium">Para restaurar dados completos do sistema, carregue o arquivo .json gerado. <strong className="text-krav-danger">Isto substituirá TODOS os dados atuais!</strong></p>
                 <div>
                   <input 
                     type="file" 
                     accept=".json"
                     id="backup-upload"
                     className="hidden"
                     ref={fileInputRef}
                     onChange={handleFileChange}
                   />
                   <label 
                     htmlFor="backup-upload" 
                     className="w-full sm:w-auto bg-krav-card border border-krav-border hover:bg-black/5 text-krav-text cursor-pointer px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                   >
                     <UploadCloud className="w-4 h-4 text-krav-accent" /> Carregar Completo
                   </label>
                 </div>
               </div>
               
               <div className="md:col-span-2 pt-6 mt-2 border-t border-krav-border">
                  <h3 className="text-sm font-bold text-krav-text flex items-center gap-2 mb-2">
                     <AlertTriangle className="w-4 h-4 text-orange-500" /> Ferramenta de Migração (Vercel)
                  </h3>
                  <p className="text-[11px] text-krav-muted mb-4">
                     Esta ferramenta permite que você importe a lista de alunos (nome e email) diretamente da sua outra plataforma. A senha padrão <strong>kravmaga123</strong> será definida, e o aluno irá atualizá-la no primeiro acesso. O Firestore irá sincronizar tudo automaticamente assim que forem salvos.
                  </p>
                  <div>
                    <input 
                      type="file" 
                      accept=".json,.csv"
                      id="vercel-upload"
                      className="hidden"
                      onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (!file) return;
                         const reader = new FileReader();
                         reader.onload = (event) => {
                            try {
                               // Simulação de parser Vercel -> JSON. Exige JSON em formato array [{nome, email, telefone}]
                               const data = JSON.parse(event.target?.result as string);
                               if(!Array.isArray(data)) throw new Error("A lista precisa ser um array JSON.");
                               
                               const importStudents = useDataStore.getState().students.slice();
                               let added = 0;
                               
                               data.forEach(aluno => {
                                  if(aluno.email) {
                                     // Prevent duplicates
                                     if(!importStudents.find(s => s.email.toLowerCase() === aluno.email.toLowerCase())) {
                                        const newStudent = {
                                           id: Math.random().toString(36).substr(2, 9),
                                           academyId: settings.id,
                                           role: 'STUDENT',
                                           name: aluno.name || aluno.nome || "Novo Aluno",
                                           email: aluno.email.trim(),
                                           phone: aluno.phone || aluno.telefone || "",
                                           password: "kravmaga123",  // Senha padrão
                                           mustChangePassword: true, // Flag para redefinição
                                           beltLevel: "WHITE",
                                           enrollmentStatus: "ACTIVE",
                                           financialStatus: "ACTIVE",
                                           createdAt: new Date().toISOString()
                                        };
                                        useDataStore.getState().addStudent(newStudent as any);
                                        added++;
                                     }
                                  }
                               });
                               setBackupMsg(added + " Alunos importados com sucesso! Sincronizando BD...");
                            } catch (error) {
                               setBackupMsg("Erro ao ler dados. Garanta que salvou os alunos em Formato JSON Correto.");
                            }
                         };
                         reader.readAsText(file);
                      }}
                    />
                    <label 
                      htmlFor="vercel-upload" 
                      className="w-full sm:w-auto bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 cursor-pointer px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" /> Importar Json de Alunos (Planilha Vercel)
                    </label>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <button 
              type="submit"
              className="bg-krav-accent hover:bg-krav-accent-light text-white px-8 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
            {successMsg && (
              <span className="text-sm font-bold text-krav-success flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                <CheckCircle className="w-5 h-5" /> Atualizado com sucesso!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
