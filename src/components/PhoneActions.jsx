import { Phone, MessageCircle } from "lucide-react";

// Telefon nömrəsinin yanında zəng + WhatsApp düymələri.
// `az` = Azərbaycan nömrəsi kimi normalize et (994 prefiksi yoxdursa əlavə et).
export default function PhoneActions({ phone, size = 14 }) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 9) digits = `994${digits}`; // 050XXXXXXX -> 99450XXXXXXX
  if (!digits) return null;

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
        href={`https://wa.me/${digits}`}
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
