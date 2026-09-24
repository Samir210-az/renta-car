import { PenLine } from "lucide-react";

export default function SignatureSlot({ src, onSign, label }) {
  return (
    <div>
      {src ? (
        <img src={src} alt="" className="h-10 object-contain object-left" />
      ) : (
        <>
          <button
            onClick={onSign}
            className="h-10 border-b border-stone-300 w-full flex items-center gap-1.5 text-[11.5px] text-stone-400 print:hidden"
          >
            <PenLine size={13} />
            İmza atmaq üçün toxunun
          </button>
          {/* Kağız üzərində əl ilə imza üçün xətt */}
          <div className="hidden print:block h-10 border-b border-stone-500" />
        </>
      )}
      <p className="text-[11.5px] text-stone-400 mt-1.5">{label}</p>
    </div>
  );
}
