import { useState } from "react";
import { User } from "lucide-react";

export default function StaffNameModal({ onSubmit, onSkip }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-sm bg-surface rounded-2xl ring-1 ring-white/10 p-5">
        <div className="h-11 w-11 rounded-2xl bg-gold/15 flex items-center justify-center mb-3">
          <User size={20} className="text-gold" />
        </div>
        <h2 className="text-[15px] font-semibold text-stone-50 mb-1">
          Xoş gəldiniz
        </h2>
        <p className="text-[13px] text-stone-400 mb-4">
          Adınızı yazsanız, icarə və ödəniş qeydlərində kim etdiyi görünəcək.
          İstəyə görədir, istəsəniz keçə bilərsiniz.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınız"
            className="w-full h-12 rounded-xl bg-paper ring-1 ring-stone-700 px-3.5 text-[14px] text-stone-50 placeholder:text-stone-500"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSkip}
              className="h-11 flex-1 rounded-xl text-[13.5px] font-medium text-stone-400 ring-1 ring-stone-700"
            >
              Keç
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="h-11 flex-1 rounded-xl bg-gold text-ink text-[13.5px] font-semibold disabled:opacity-40"
            >
              Davam et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
