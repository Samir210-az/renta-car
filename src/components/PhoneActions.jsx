import { Phone, MessageCircle, MessageSquareText } from "lucide-react";
import { toIntlDigits } from "../lib/phone";

// Telefon nömrəsinin yanında zəng + SMS + WhatsApp düymələri.
// `message` verilsə, SMS/WhatsApp mətni əvvəlcədən doldurulur.
export default function PhoneActions({ phone, message, size = 14 }) {
  if (!phone) return null;
  const digits = toIntlDigits(phone);
  if (!digits) return null;

  const smsBody = message ? `?body=${encodeURIComponent(message)}` : "";
  const waText = message ? `?text=${encodeURIComponent(message)}` : "";

  return (
    <span className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <a
        href={`tel:+${digits}`}
        aria-label="Zəng et"
        className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/25 transition-colors"
      >
        <Phone size={size - 3} />
      </a>
      <a
        href={`sms:+${digits}${smsBody}`}
        aria-label="SMS yaz"
        className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/25 transition-colors"
      >
        <MessageSquareText size={size - 3} />
      </a>
      <a
        href={`https://wa.me/${digits}${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/25 transition-colors"
      >
        <MessageCircle size={size - 3} />
      </a>
    </span>
  );
}
