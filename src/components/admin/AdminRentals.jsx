import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Trash2, FileText, X, PlayCircle, Ban } from "lucide-react";
import { closeRental, deleteRental, startReservation, cancelRental } from "../../lib/data";
import { getStaffName } from "../../lib/session";
import StatusBadge from "../StatusBadge";
import DamageDiagram from "../DamageDiagram";
import PhoneActions from "../PhoneActions";

const FUEL_LEVELS = ["Boş", "1/4", "1/2", "3/4", "Dolu"];

const STATUS_TO_BADGE = {
  aktiv: "icarədə",
  rezerv: "rezerv",
  bitib: "boş",
  "ləğv edilib": "servisdə",
};

export default function AdminRentals({ companyId, rentals, carsById }) {
  const [closingId, setClosingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function handleStart(rental) {
    setBusyId(rental.id);
    try {
      await startReservation(companyId, rental, getStaffName());
    } catch (err) {
      alert(err.message || "Başlada bilmədik");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(rental) {
    const reason = prompt("Ləğv etmə səbəbi (istəyə görə):");
    if (reason === null) return; // "İmtina" basıldı
    setBusyId(rental.id);
    try {
      await cancelRental(companyId, rental, reason, getStaffName());
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(rental) {
    if (!confirm("Bu icarə qeydi tamamilə silinsin? (Ləğv etmək əvəzinə tarixçədə saxlamaq üçün 'Ləğv et' istifadə edin)"))
      return;
    await deleteRental(companyId, rental);
  }

  if (rentals.length === 0) {
    return (
      <p className="text-[13px] text-stone-400 text-center py-8">
        Hələ icarə qeydi yoxdur
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {rentals.map((r) => {
        const car = carsById[r.carId];
        const busy = busyId === r.id;
        return (
          <div
            key={r.id}
            className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-stone-50 text-[14px]">
                  {car?.name || "Silinmiş maşın"}
                </p>
                <p className="text-[12.5px] text-stone-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>{r.customerName} · {r.customerPhone}</span>
                  <PhoneActions phone={r.customerPhone} />
                </p>
                <p className="text-[12.5px] text-stone-400 mt-0.5">
                  {r.startDate} → {r.endDate}
                  {r.depositAmount > 0 ? ` · Depozit: ${r.depositAmount} ₼` : ""}
                </p>
                {r.status === "ləğv edilib" && r.cancelReason && (
                  <p className="text-[12px] text-rose-400 mt-1">
                    Səbəb: {r.cancelReason}
                    {r.cancelledBy ? ` · ${r.cancelledBy}` : ""}
                  </p>
                )}
                {r.createdBy && (
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Qeydə alıb: {r.createdBy}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-stone-50 text-[14px]">
                  {r.totalPrice} ₼
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={STATUS_TO_BADGE[r.status] || "boş"} />
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
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-700 flex-wrap">
                {r.status === "rezerv" && (
                  <button
                    onClick={() => handleStart(r)}
                    disabled={busy}
                    className="flex items-center gap-1.5 text-[12.5px] font-medium text-gold hover:text-amber-300 disabled:opacity-40"
                  >
                    <PlayCircle size={14} />
                    Təhvil ver (başlat)
                  </button>
                )}
                {r.status === "aktiv" && (
                  <button
                    onClick={() => setClosingId(r.id)}
                    className="flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    <CheckCircle2 size={14} />
                    Maşını qaytar
                  </button>
                )}
                {(r.status === "aktiv" || r.status === "rezerv") && (
                  <button
                    onClick={() => handleCancel(r)}
                    disabled={busy}
                    className="flex items-center gap-1.5 text-[12.5px] text-stone-400 hover:text-rose-400 disabled:opacity-40"
                  >
                    <Ban size={13} />
                    Ləğv et
                  </button>
                )}
                <Link
                  to={`/akt/${companyId}/${r.id}`}
                  className="flex items-center gap-1.5 text-[12.5px] font-medium text-stone-500 hover:text-stone-50"
                >
                  <FileText size={14} />
                  Akt
                </Link>
                <button
                  onClick={() => handleDelete(r)}
                  className="flex items-center gap-1.5 text-[12.5px] text-stone-500 hover:text-rose-500 ml-auto"
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
