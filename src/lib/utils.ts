import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWhatsAppLink(phone?: string, message?: string) {
  if (!phone) return '#';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '#';
  // If it doesn't start with 55 and seems like a valid BR number (10 or 11 digits)
  const finalPhone = (digits.length === 10 || digits.length === 11) ? `55${digits}` : digits;
  
  if (message) {
    return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${finalPhone}`;
}
