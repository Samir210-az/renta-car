import { useState } from "react";
import { addCar } from "../lib/data";

export default function CarForm({ companyId, onDone, className = "" }) {
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [year, setYear] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerDailyRate, setOwnerDailyRate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isValid =
    name.trim() &&
    plate.trim() &&
    Number(dailyPrice) > 0 &&
    ownerName.trim() &&
    ownerPhone.trim() &&
    Number(ownerDailyRate) > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || saving) return;
    setSaving(true);
    setError("");
    try {
      await addCar(companyId, {
        name: name.trim(),
        plate: plate.trim().toUpperCase(),
        year: year ? Number(year) : null,
        dailyPrice: Number(dailyPrice),
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        ownerDailyRate: Number(ownerDailyRate),
      });
      setName("");
      setPlate("");
      setYear("");
      setDailyPrice("");
      setOwnerName("");
      setOwnerPhone("");
      setOwnerDailyRate("");
      onDone?.();
    } catch (err) {
      setError(err.message || "Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4 space-y-3 ${className}`}
    >
      <div className="grid grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Marka / Model"
          autoFocus
          className="h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
        />
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="Dövlət nömrəsi"
          className="h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
        />
      </div>
      <div className="flex gap-3">
        <input
          value={year}
          onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
          type="text"
          inputMode="numeric"
          placeholder="İl"
          className="h-11 w-20 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
        />
        <input
          value={dailyPrice}
          onChange={(e) => setDailyPrice(e.target.value)}
          type="number"
          min="0"
          placeholder="Müştəriyə günlük (₼)"
          className="h-11 flex-1 min-w-0 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
        />
      </div>

      <div className="border-t border-stone-700 pt-3">
        <p className="text-[12px] text-stone-500 mb-2">Maşın sahibi</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Sahibin adı"
            required
            className="h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
          />
          <input
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            placeholder="Sahibin telefonu"
            required
            className="h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
          />
        </div>
        <input
          value={ownerDailyRate}
          onChange={(e) => setOwnerDailyRate(e.target.value)}
          type="number"
          min="0"
          required
          placeholder="Sahibə günlük ödəniləcək məbləğ (₼)"
          className="h-11 w-full rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
        />
      </div>

      {error && <p className="text-[12.5px] text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={!isValid || saving}
        className="w-full h-11 rounded-lg bg-gold text-ink text-[13.5px] font-semibold disabled:opacity-40"
      >
        {saving ? "..." : "Əlavə et"}
      </button>
    </form>
  );
}
