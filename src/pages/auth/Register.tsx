import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, Calendar, Contact, AlertCircle, Phone, Mail, Shirt, Ruler } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';

export default function Register() {
  const navigate = useNavigate();
  const { academyId } = useParams();
  const academiesSettings = useDataStore((state) => state.academiesSettings);
  const addStudent = useDataStore((state) => state.addStudent);

  // Determina as configurações baseado na URL ou padrão
  const settings = academiesSettings.find(s => s.id === academyId) || academiesSettings[0];
  const finalAcademyId = academyId || settings.id;

  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    cpf: '',
    phone: '',
    email: '',
    password: '',
    shirtSize: '',
    pantsSize: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: ''
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addStudent({
      academyId: finalAcademyId,
      role: 'STUDENT',
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      cpf: formData.cpf,
      birthDate: formData.birthDate,
      shirtSize: formData.shirtSize,
      pantsSize: formData.pantsSize,
      beltLevel: 'WHITE',
      enrollmentStatus: 'PENDING',
      financialStatus: 'PENDING',
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
        relationship: formData.emergencyRelation
      }
    });

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-krav-bg flex items-center justify-center p-4">
         <div className="bg-krav-card rounded-xl shadow-lg border border-krav-border p-8 max-w-md w-full text-center">
             {settings.logoUrl ? (
               <div className="max-w-[120px] mx-auto mb-4">
                 <img src={settings.logoUrl} alt="Logo" className="w-full h-auto object-contain" />
               </div>
             ) : (
               <div className="w-16 h-16 bg-krav-success/10 text-krav-success rounded-full flex items-center justify-center mx-auto mb-4">
                 <ShieldCheck className="w-8 h-8" />
               </div>
             )}
            <h2 className="text-2xl font-bold text-krav-text mb-2">Matrícula Solicitada!</h2>
            <p className="text-krav-muted mb-6">
              Sua pré-matrícula foi enviada para a secretaria da {settings.academyName || 'Academia'}. 
              Em breve entraremos em contato via WhatsApp ou Email para concluir sua inscrição.
            </p>
            <Link to="/login" className="bg-krav-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-krav-accent-light transition-colors inline-block w-full">
              Voltar ao Login
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-krav-bg flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl bg-krav-card border border-krav-border rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-krav-sidebar p-8 text-center border-b border-krav-border relative">
          {settings.logoUrl ? (
            <div className="max-w-[200px] mx-auto mb-4 p-2 bg-krav-card/5 rounded-lg border border-white/10">
              <img src={settings.logoUrl} alt="Logo" className="w-full h-auto object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto bg-krav-accent rounded-xl flex items-center justify-center shadow-md mb-4 rotate-3">
               <ShieldCheck className="text-white w-8 h-8 -rotate-3" />
            </div>
          )}
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">{settings.academyName || 'KRAV MAGA APPS'}</h1>
          <p className="text-krav-muted mt-2 font-medium">Formulário de Matrícula / Inscrição</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          
          <div className="space-y-8">
            {/* Seção: Dados Pessoais */}
            <section>
              <h3 className="text-krav-accent font-bold text-xs uppercase tracking-widest border-b border-krav-border pb-2 mb-4 flex items-center gap-2">
                 <UserIcon className="w-4 h-4" /> Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-krav-text mb-1 uppercase tracking-wider">Nome Completo</label>
                   <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg" placeholder="Seu nome completo" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1 uppercase tracking-wider">Data de Nascimento</label>
                   <input type="date" name="birthDate" required value={formData.birthDate} onChange={handleChange} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1 uppercase tracking-wider">CPF</label>
                   <input type="text" name="cpf" required value={formData.cpf} onChange={handleChange} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg" placeholder="000.000.000-00" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1 uppercase tracking-wider">Telefone / WhatsApp</label>
                   <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg" placeholder="(11) 99999-9999" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1 uppercase tracking-wider">Email</label>
                   <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg" placeholder="seu@email.com" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1 uppercase tracking-wider">Senha de Acesso</label>
                   <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg" placeholder="Crie sua senha para login futuro" />
                 </div>
              </div>
            </section>

            {/* Seção: Uniforme */}
            <section>
              <h3 className="text-krav-accent font-bold text-xs uppercase tracking-widest border-b border-krav-border pb-2 mb-4 flex items-center gap-2">
                 <Shirt className="w-4 h-4" /> Uniforme
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1 uppercase tracking-wider">Tamanho da Camiseta</label>
                   <input type="text" name="shirtSize" value={formData.shirtSize} onChange={handleChange} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg" placeholder="Ex: M, G, 12, etc." />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-krav-text mb-1 uppercase tracking-wider">Tamanho da Calça</label>
                   <input type="text" name="pantsSize" value={formData.pantsSize} onChange={handleChange} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg" placeholder="Ex: 42, M, G, etc." />
                 </div>
              </div>
            </section>

            {/* Seção: Contato de Emergência */}
            <section>
              <h3 className="text-krav-accent font-bold text-xs uppercase tracking-widest border-b border-krav-border pb-2 mb-4 flex items-center gap-2">
                 <AlertCircle className="w-4 h-4" /> Emergência
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="md:col-span-1">
                   <label className="block text-[10px] font-bold text-krav-text mb-1 uppercase tracking-wider">Nome do Contato</label>
                   <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg" placeholder="Nome" />
                 </div>
                 <div className="md:col-span-1">
                   <label className="block text-[10px] font-bold text-krav-text mb-1 uppercase tracking-wider">Telefone</label>
                   <input type="text" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg" placeholder="Telefone" />
                 </div>
                 <div className="md:col-span-1">
                   <label className="block text-[10px] font-bold text-krav-text mb-1 uppercase tracking-wider">Relação/Parentesco</label>
                   <input type="text" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} className="w-full bg-krav-bg text-sm border border-krav-border focus:border-krav-accent p-3 rounded-lg" placeholder="Mãe, Pai, Cônjuge..." />
                 </div>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-krav-border flex flex-col md:flex-row gap-4 items-center">
            <button type="submit" className="w-full py-3 bg-krav-accent text-white font-bold rounded-lg shadow-md hover:bg-krav-accent-light transition-colors text-sm uppercase tracking-wider">
              Solicitar Matrícula
            </button>
            <Link to="/login" className="w-full py-3 bg-transparent text-krav-text font-bold rounded-lg hover:bg-black/5 transition-colors text-sm text-center uppercase tracking-wider border border-krav-border">
              Já sou Aluno
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}
