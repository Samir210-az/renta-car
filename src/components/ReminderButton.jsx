import { MessageCircle, MessageSquareText } from "lucide-react";
import { toIntlDigits } from "../lib/phone";

// Müştəriyə hazır mətnli WhatsApp/SMS xatırlatması — tam avtomatik deyil
// (server olmadığı üçün mümkün deyil), amma işçi bir kliklə hazır mesajı
// göndərə bilir.
export default function ReminderButton({ phone, message }) {
  if (!phone) return null;
  const digits = toIntlDigits(phone);
  if (!digits) return null;

  const waUrl = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  const smsUrl = `sms:+${digits}?body=${encodeURIComponent(message)}`;

  return (
    <span
      className="inline-flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <a
        href={smsUrl}
        aria-label="SMS ilə xatırlat"
        className="h-7 px-2 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-medium flex items-center gap-1 shrink-0"
      >
        <MessageSquareText size={12} />
      </a>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ilə xatırlat"
        className="h-7 px-2.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-medium flex items-center gap-1 shrink-0"
      >
        <MessageCircle size={12} />
        Xatırlat
      </a>
    </span>
  );
}
