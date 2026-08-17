export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
  return phone;
}

export function generateWhatsAppLink(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove tudo que não for número
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 0) return '';

  // Se não tiver o DDI do Brasil e começar com DDD (geralmente 10 ou 11 dígitos)
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }
  
  return `https://wa.me/${cleaned}`;
}

export function generateProcedureBookingWhatsAppLink(procedureName?: string | null): string {
  const normalizedProcedureName = procedureName?.trim();
  const message = normalizedProcedureName
    ? `Olá, Dra. Patricia! Tenho interesse em realizar uma avaliação para ${normalizedProcedureName} e gostaria de verificar a disponibilidade para agendamento.`
    : 'Olá! Gostaria de agendar uma avaliação na Ferrer Innovare Clinic.';

  return `${generateWhatsAppLink(CLINIC_WHATSAPP)}?text=${encodeURIComponent(message)}`;
}
import { CLINIC_WHATSAPP } from '../config/constants';
