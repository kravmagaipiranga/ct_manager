import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { formatWhatsAppLink } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface ContactActionsProps {
  email?: string;
  phone?: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  iconOnly?: boolean;
}

export function ContactActions({ email, phone, align = 'left', className, iconOnly = true }: ContactActionsProps) {
  const alignClass = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';

  return (
    <div className={cn("flex items-center gap-2", alignClass, className)}>
      {phone && (
        <a 
          href={formatWhatsAppLink(phone)} 
          target="_blank" 
          rel="noopener noreferrer"
          title={`WhatsApp: ${phone}`}
          className={cn(
            "flex items-center justify-center transition-all",
            iconOnly 
              ? "w-8 h-8 rounded-full bg-green-50 text-green-600 border border-green-200 hover:bg-green-600 hover:text-white"
              : "px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-600 hover:text-white text-xs font-bold gap-1.5"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle className="w-4 h-4" />
          {!iconOnly && "WhatsApp"}
        </a>
      )}
      {email && (
        <a 
          href={`mailto:${email}`} 
          title={`E-mail: ${email}`}
          className={cn(
            "flex items-center justify-center transition-all",
            iconOnly 
              ? "w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white"
              : "px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white text-xs font-bold gap-1.5"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Mail className="w-4 h-4" />
          {!iconOnly && "E-mail"}
        </a>
      )}
    </div>
  );
}
