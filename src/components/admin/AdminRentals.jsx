import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Trash2, FileText, X } from "lucide-react";
import { closeRental, deleteRental } from "../../lib/data";
import StatusBadge from "../StatusBadge";

const FUEL_LEVELS = ["Boş", "1/4", "1/2", "3/4", "Dolu"];

export default function AdminRentals({ companyId, rentals, carsById }) {
  const [closingId, setClosingId] = useState(null);

  async function handleDelete(rental) {
    if (!confirm("Bu icarə qeydi silinsin?")) return;
    await deleteRental(companyId, rental);
  }

  if (rentals.length === 0) {
    return (
      <p className="text-[13px] text-slate-400 text-center py-8">
        Hələ icarə qeydi yoxdur
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {rentals.map((r) => {
        const car = carsById[r.carId];
        return (
          <div
            key={r.id}
            className="rounded-xl2 bg-white ring-1 ring-slate-100 shadow-soft p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink text-[14px]">
                  {car?.name || "Silinmiş maşın"}
                </p>
                <p className="text-[12.5px] text-slate-500 mt-0.5">
                  {r.customerName} · {r.customerPhone}
                </p>
                <p className="text-[12.5px] text-slate-400 mt-0.5">
                  {r.startDate} → {r.endDate}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-ink text-[14px]">
                  {r.totalPrice} ₼
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={r.status === "aktiv" ? "icarədə" : "boş"} />
                </div>
              </div>
            </div>

            {closingId === r.id ? (
              <ReturnConditionForm
                companyId={companyId}
                rental={r}
                onDone={() => setClosingId(null)}
                onCancel={() => setClosingId(null)}
              />
            ) : (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50">
                {r.status === "aktiv" && (
                  <button
                    onClick={() => setClosingId(r.id)}
                    className="flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    <CheckCircle2 size={14} />
                    Maşını qaytar
                  </button>
                )}
                <Link
                  to={`/akt/${companyId}/${r.id}`}
                  className="flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 hover:text-ink"
                >
                  <FileText size={14} />
                  Akt
                </Link>
                <button
                  onClick={() => handleDelete(r)}
                  className="flex items-center gap-1.5 text-[12.5px] text-slate-400 hover:text-rose-500 ml-auto"
                >
                  <Trash2 size={13} />
                  Sil
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReturnConditionForm({ companyId, rental, onDone, onCancel }) {
  const [km, setKm] = useState("");
  const [fuel, setFuel] = useState("Dolu");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    setSaving(true);
    try {
      await closeRental(companyId, rental, {
        km: km ? Number(km) : null,
        fuel,
        notes: notes.trim(),
        signedAt: Date.now(),
      });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-50 space-y-2.5">
      <p className="text-[12.5px] font-medium text-slate-500">
        Qaytarma zamanı vəziyyət
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <input
          type="number"
          min="0"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          placeholder="Km sayğacı"
          className="h-10 rounded-lg bg-paper ring-1 ring-slate-200 px-3 text-[13px]"
        />
        <select
          value={fuel}
          onChange={(e) => setFuel(e.target.value)}
          className="h-10 rounded-lg bg-paper ring-1 ring-slate-200 px-3 text-[13px]"
        >
          {FUEL_LEVELS.map((f) => (
            <option key={f} value={f}>
              Yanacaq: {f}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Yeni cızıq/zədə qeydi (yoxdursa boş saxlayın)"
        rows={2}
        className="w-full rounded-lg bg-paper ring-1 ring-slate-200 px-3 py-2 text-[13px] resize-none"
      />
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
          className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600"
          aria-label="Ləğv et"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
