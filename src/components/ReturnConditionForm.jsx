import { useState } from "react";
import { X } from "lucide-react";
import { closeRental } from "../lib/data";
import { getStaffName } from "../lib/session";
import DamageDiagram from "./DamageDiagram";

const FUEL_LEVELS = ["Boş", "1/4", "1/2", "3/4", "Dolu"];

export default function ReturnConditionForm({ companyId, rental, onDone, onCancel }) {
  const [km, setKm] = useState("");
  const [fuel, setFuel] = useState("Dolu");
  const [exteriorNotes, setExteriorNotes] = useState("");
  const [interiorNotes, setInteriorNotes] = useState("");
  const [damage, setDamage] = useState([]);
  const [depositReturned, setDepositReturned] = useState(true);
  const [depositReturnedAmount, setDepositReturnedAmount] = useState(
    rental.depositAmount || 0
  );
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    setSaving(true);
    try {
      await closeRental(companyId, rental, {
        km: km ? Number(km) : null,
        fuel,
        exteriorNotes: exteriorNotes.trim(),
        interiorNotes: interiorNotes.trim(),
        damageMarkers: damage,
        depositReturned: rental.depositAmount > 0 ? depositReturned : null,
        depositReturnedAmount: rental.depositAmount > 0 ? Number(depositReturnedAmount) : null,
        signedAt: Date.now(),
      }, getStaffName());
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-stone-700 space-y-2.5">
      <p className="text-[12.5px] font-medium text-stone-500">
        Qaytarma zamanı vəziyyət
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <input
          type="number"
          min="0"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          placeholder="Km sayğacı"
          className="h-10 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13px] text-stone-50"
        />
        <select
          value={fuel}
          onChange={(e) => setFuel(e.target.value)}
          className="h-10 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13px] text-stone-50"
        >
          {FUEL_LEVELS.map((f) => (
            <option key={f} value={f}>
              Yanacaq: {f}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={exteriorNotes}
        onChange={(e) => setExteriorNotes(e.target.value)}
        placeholder="Xarici vəziyyət qeydi (istəyə görə)"
        rows={2}
        className="w-full rounded-lg bg-paper ring-1 ring-stone-700 px-3 py-2 text-[13px] resize-none text-stone-50"
      />
      <DamageDiagram value={damage} onChange={setDamage} />
      <textarea
        value={interiorNotes}
        onChange={(e) => setInteriorNotes(e.target.value)}
        placeholder="Daxili vəziyyət qeydi (salon, oturacaqlar, ləkə və s.)"
        rows={2}
        className="w-full rounded-lg bg-paper ring-1 ring-stone-700 px-3 py-2 text-[13px] resize-none text-stone-50"
      />

      {rental.depositAmount > 0 && (
        <div className="rounded-lg bg-paper ring-1 ring-stone-700 p-3 space-y-2">
          <p className="text-[12px] text-stone-400">
            Depozit: {rental.depositAmount} ₼
          </p>
          <div className="flex items-center gap-2">
            <select
              value={depositReturned ? "yes" : "no"}
              onChange={(e) => setDepositReturned(e.target.value === "yes")}
              className="h-9 rounded-lg bg-surface ring-1 ring-stone-700 px-2.5 text-[12.5px] text-stone-50"
            >
              <option value="yes">Tam qaytarıldı</option>
              <option value="no">Qismən / saxlanıldı</option>
            </select>
            <input
              type="number"
              min="0"
              value={depositReturnedAmount}
              onChange={(e) => setDepositReturnedAmount(e.target.value)}
              disabled={depositReturned}
              placeholder="Qaytarılan (₼)"
              className="h-9 flex-1 min-w-0 rounded-lg bg-surface ring-1 ring-stone-700 px-2.5 text-[12.5px] text-stone-50 disabled:opacity-50"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleConfirm}
          disabled={saving}
          className="h-9 px-3.5 rounded-lg bg-emerald-600 text-white text-[12.5px] font-medium disabled:opacity-40"
        >
          {saving ? "..." : "Təsdiqlə və bağla"}
        </button>
        <button
          onClick={onCancel}
          className="h-9 w-9 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-200"
          aria-label="Ləğv et"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
