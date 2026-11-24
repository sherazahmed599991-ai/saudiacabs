export const WHATSAPP_NUMBER = "966598947503";
export const PHONE_DISPLAY = "+966 59 894 7503";

/** wa.me link with a pre-filled message. */
export function waUrl(message?: string): string {
  return message
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${WHATSAPP_NUMBER}`;
}
