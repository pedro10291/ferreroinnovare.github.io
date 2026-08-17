// Centralized configurations for the clinic
export const CLINIC_WHATSAPP_NUMBER = "5511942749623"; // Telefone principal da Ferrer Innovare Clinic
export const CLINIC_WHATSAPP_NUMBER_MOCK = "5511999999999"; // Fallback/Mock configurado anteriormente
export const CLINIC_WHATSAPP = CLINIC_WHATSAPP_NUMBER; // Usamos o número de atendimento real homologado

// Procedimentos descontinuados não devem ser acessíveis no catálogo ou em deep links.
export const UNAVAILABLE_PROCEDURE_SLUGS = ['lipo-de-papada'] as const;
