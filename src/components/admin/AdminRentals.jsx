import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Trash2, FileText, X, PlayCircle, Ban, ImagePlus, Search, Download } from "lucide-react";
import { deleteRental, startReservation, cancelRental } from "../../lib/data";
import { getStaffName } from "../../lib/session";
import { compressImage } from "../../lib/image";
import { downloadCsv } from "../../lib/csv";
import StatusBadge from "../StatusBadge";
import DamageDiagram from "../DamageDiagram";
import PhoneActions from "../PhoneActions";
import ReturnConditionForm from "../ReturnConditionForm";

const FUEL_LEVELS = ["Boş", "1/4", "1/2", "3/4", "Dolu"];
const PAGE_SIZE = 20;

const STATUS_TO_BADGE = {
  aktiv: "icarədə",
  rezerv: "rezerv",
  bitib: "boş",
  "ləğv edilib": "servisdə",
};

export default function AdminRentals({ companyId, rentals, carsById }) {
  const [closingId, setClosingId] = useState(null);
  const [startingId, setStartingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rentals;
    return rentals.filter((r) => {
      const car = carsById[r.carId];
      return (
        r.customerName?.toLowerCase().includes(q) ||
        r.customerPhone?.toLowerCase().includes(q) ||
        car?.plate?.toLowerCase().includes(q) ||
        car?.name?.toLowerCase().includes(q)
      );
    });
  }, [rentals, query, carsById]);

  function handleExport() {
    const headers = [
      "Maşın",
      "Nömrə",
      "Müştəri",
      "Telefon",
      "Başlanğıc",
      "Bitmə",
      "Günlük qiymət",
      "Ümumi məbləğ",
      "Depozit",
      "Status",
      "Qeydə alıb",
    ];
    const rows = filtered.map((r) => {
      const car = carsById[r.carId];
      return [
        car?.name || "",
        car?.plate || "",
        r.customerName || "",
        r.customerPhone || "",
        r.startDate || "",
        r.endDate || "",
        r.dailyPrice || 0,
        r.totalPrice || 0,
        r.depositAmount || 0,
        r.status || "",
        r.createdBy || "",
      ];
    });
    downloadCsv(`icareler-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Müştəri, telefon və ya nömrə üzrə axtar"
            className="w-full h-10 rounded-lg bg-surface ring-1 ring-stone-700 pl-9 pr-3 text-[13px] text-stone-50 placeholder:text-stone-500"
          />
        </div>
        <button
          onClick={handleExport}
          aria-label="CSV ixrac et"
          className="h-10 w-10 rounded-lg bg-surface ring-1 ring-stone-700 flex items-center justify-center text-stone-400 hover:text-gold shrink-0"
        >
          <Download size={16} />
        </button>
      </div>

      {filtered.length === 0 && (
        <p className="text-[13px] text-stone-400 text-center py-8">Nəticə tapılmadı</p>
      )}

      {filtered.slice(0, visibleCount).map((r) => {
        const car = carsById[r.carId];
        const busy = busyId === r.id;
        return (
          <div
            key={r.id}
            className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {car ? (
                  <Link
                    to={`/masin/${car.id}`}
                    className="font-medium text-stone-50 text-[14px] hover:text-gold transition-colors"
                  >
                    {car.name}
                  </Link>
                ) : (
                  <p className="font-medium text-stone-50 text-[14px]">Silinmiş maşın</p>
                )}
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
            ) : startingId === r.id ? (
              <PickupConditionForm
                companyId={companyId}
                rental={r}
                onDone={() => setStartingId(null)}
                onCancel={() => setStartingId(null)}
              />
            ) : (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-700 flex-wrap">
                {r.status === "rezerv" && (
                  <button
                    onClick={() => setStartingId(r.id)}
                    className="flex items-center gap-1.5 text-[12.5px] font-medium text-gold hover:text-amber-300"
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
                <Link
                  to={`/muqavile/${companyId}/${r.id}`}
                  className="flex items-center gap-1.5 text-[12.5px] font-medium text-stone-500 hover:text-stone-50"
                >
                  <FileText size={14} />
                  Müqavilə
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

      {visibleCount < filtered.length && (
        <button
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="w-full h-10 rounded-lg ring-1 ring-stone-700 text-[13px] text-stone-400"
        >
          Daha çox göstər ({filtered.length - visibleCount})
        </button>
      )}
    </div>
  );
}

function PickupConditionForm({ companyId, rental, onDone, onCancel }) {
  const [km, setKm] = useState("");
  const [fuel, setFuel] = useState("Dolu");
  const [exteriorNotes, setExteriorNotes] = useState("");
  const [interiorNotes, setInteriorNotes] = useState("");
  const [damage, setDamage] = useState([]);
  const [platePhoto, setPlatePhoto] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handlePlatePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    try {
      const dataUrl = await compressImage(file, { maxWidth: 640, quality: 0.6 });
      setPlatePhoto(dataUrl);
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleConfirm() {
    setSaving(true);
    setError("");
    try {
      await startReservation(
        companyId,
        rental,
        {
          km: km ? Number(km) : null,
          fuel,
          exteriorNotes: exteriorNotes.trim(),
          interiorNotes: interiorNotes.trim(),
          damageMarkers: damage,
          platePhoto: platePhoto || null,
          signedAt: Date.now(),
        },
        getStaffName()
      );
      onDone();
    } catch (err) {
      setError(err.message || "Təhvil verilə bilmədi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-stone-700 space-y-2.5">
      <p className="text-[12.5px] font-medium text-stone-500">
        Təhvil zamanı vəziyyət — maşın indi müştəriyə verilir
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

      <div>
        <p className="text-[12px] text-stone-500 mb-1.5">Nömrə şəkli</p>
        {platePhoto ? (
          <div className="relative w-24">
            <img
              src={platePhoto}
              alt=""
              className="w-24 h-16 rounded-lg object-cover ring-1 ring-stone-700"
            />
            <button
              type="button"
              onClick={() => setPlatePhoto(null)}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center"
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <label className="w-24 h-16 rounded-lg bg-paper ring-1 ring-dashed ring-stone-600 flex flex-col items-center justify-center gap-0.5 text-stone-400 cursor-pointer">
            <ImagePlus size={14} />
            <span className="text-[9.5px]">{photoBusy ? "..." : "şəkil çək"}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePlatePhoto}
            />
          </label>
        )}
      </div>

      {error && <p className="text-[12px] text-rose-400">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          onClick={handleConfirm}
          disabled={saving}
          className="h-9 px-3.5 rounded-lg bg-gold text-ink text-[12.5px] font-semibold disabled:opacity-40"
        >
          {saving ? "..." : "Təhvili təsdiqlə"}
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
