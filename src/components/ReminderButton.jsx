import { MessageCircle } from "lucide-react";

// Müştəriyə hazır mətnli WhatsApp xatırlatması — tam avtomatik deyil (server
// olmadığı üçün mümkün deyil), amma işçi bir kliklə hazır mesajı göndərə bilir.
export default function ReminderButton({ phone, message, label = "Xatırlat" }) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 9) digits = `994${digits}`;
  if (!digits) return null;

  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="h-7 px-2.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-medium flex items-center gap-1 shrink-0"
    >
      <MessageCircle size={12} />
      {label}
    </a>
  );
}
