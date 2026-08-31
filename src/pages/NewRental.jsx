import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { getCompanyId } from "../lib/session";
import { listenCars, addRental } from "../lib/data";
import DamageDiagram from "../components/DamageDiagram";

const FUEL_LEVELS = ["Boş", "1/4", "1/2", "3/4", "Dolu"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.round(ms / 86400000));
}

export default function NewRental() {
  const navigate = useNavigate();
  const companyId = getCompanyId();
  const [cars, setCars] = useState(null);
  const [carId, setCarId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [pickupKm, setPickupKm] = useState("");
  const [pickupFuel, setPickupFuel] = useState("Dolu");
  const [pickupNotes, setPickupNotes] = useState("");
  const [pickupDamage, setPickupDamage] = useState([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const unsub = listenCars(companyId, setCars);
    return () => unsub();
  }, [companyId]);

  useEffect(() => {
    const raw = sessionStorage.getItem("rc_prefill_request");
    if (!raw) return;
    sessionStorage.removeItem("rc_prefill_request");
    try {
      const prefill = JSON.parse(raw);
      setCarId(prefill.carId || "");
      setCustomerName(prefill.customerName || "");
      setCustomerPhone(prefill.customerPhone || "");
    } catch {
      // sorğu formatı yanlışdırsa sadəcə boş forma göstərilir
    }
  }, []);

  const availableCars = useMemo(
    () => (cars || []).filter((c) => c.status === "boş"),
    [cars]
  );

  const selectedCar = useMemo(
    () => availableCars.find((c) => c.id === carId),
    [availableCars, carId]
  );

  const totalPrice = useMemo(() => {
    if (!selectedCar) return 0;
    return daysBetween(startDate, endDate) * Number(selectedCar.dailyPrice || 0);
  }, [selectedCar, startDate, endDate]);

  const isValid =
    carId && customerName.trim() && customerPhone.trim() && startDate && endDate && endDate >= startDate;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await addRental(companyId, {
        carId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        startDate,
        endDate,
        dailyPrice: Number(selectedCar.dailyPrice || 0),
        totalPrice,
        pickupCondition: {
          km: pickupKm ? Number(pickupKm) : null,
          fuel: pickupFuel,
          notes: pickupNotes.trim(),
          damageMarkers: pickupDamage,
          signedAt: Date.now(),
        },
      });
      setDone(true);
      setTimeout(() => navigate("/"), 900);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center mt-24">
        <CheckCircle2 size={40} className="text-emerald-500 mb-3" />
        <p className="font-medium text-ink">İcarə qeydə alındı</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-lg font-semibold text-ink mb-1">Yeni icarə</h1>

      <Field label="Maşın">
        <select
          value={carId}
          onChange={(e) => setCarId(e.target.value)}
          required
          className="w-full h-12 rounded-xl bg-white ring-1 ring-slate-200 px-3.5 text-[14px] text-ink"
        >
          <option value="" disabled>
            {cars === null
              ? "Yüklənir..."
              : availableCars.length === 0
              ? "Boş maşın yoxdur"
              : "Seçin"}
          </option>
          {availableCars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.plate}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Müştəri adı">
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
          placeholder="Ad Soyad"
          className="w-full h-12 rounded-xl bg-white ring-1 ring-slate-200 px-3.5 text-[14px] text-ink placeholder:text-slate-400"
        />
      </Field>

      <Field label="Telefon">
        <input
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          required
          placeholder="+994 XX XXX XX XX"
          className="w-full h-12 rounded-xl bg-white ring-1 ring-slate-200 px-3.5 text-[14px] text-ink placeholder:text-slate-400"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Başlanğıc">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full h-12 rounded-xl bg-white ring-1 ring-slate-200 px-3 text-[14px] text-ink"
          />
        </Field>
        <Field label="Bitmə">
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full h-12 rounded-xl bg-white ring-1 ring-slate-200 px-3 text-[14px] text-ink"
          />
        </Field>
      </div>

      {selectedCar && (
        <div className="rounded-xl2 bg-white ring-1 ring-slate-100 shadow-soft p-4 flex items-center justify-between">
          <span className="text-[13px] text-slate-500">
            {daysBetween(startDate, endDate)} gün × {selectedCar.dailyPrice} ₼
          </span>
          <span className="font-semibold text-ink text-[16px]">
            {totalPrice} ₼
          </span>
        </div>
      )}

      <div className="rounded-xl2 bg-white ring-1 ring-slate-100 shadow-soft p-4 space-y-3">
        <p className="text-[13px] font-medium text-slate-500">
          Təhvil zamanı vəziyyət (aktın hissəsi)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min="0"
            value={pickupKm}
            onChange={(e) => setPickupKm(e.target.value)}
            placeholder="Km sayğacı"
            className="h-11 rounded-lg bg-paper ring-1 ring-slate-200 px-3 text-[13.5px]"
          />
          <select
            value={pickupFuel}
            onChange={(e) => setPickupFuel(e.target.value)}
            className="h-11 rounded-lg bg-paper ring-1 ring-slate-200 px-3 text-[13.5px]"
          >
            {FUEL_LEVELS.map((f) => (
              <option key={f} value={f}>
                Yanacaq: {f}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={pickupNotes}
          onChange={(e) => setPickupNotes(e.target.value)}
          placeholder="Əlavə qeyd (istəyə görə)"
          rows={2}
          className="w-full rounded-lg bg-paper ring-1 ring-slate-200 px-3 py-2.5 text-[13.5px] resize-none"
        />
        <DamageDiagram value={pickupDamage} onChange={setPickupDamage} />
      </div>

      <button
        type="submit"
        disabled={!isValid || saving}
        className="w-full h-12 rounded-xl bg-ink text-white font-medium text-[14px] disabled:opacity-40 active:scale-[0.98] transition-transform"
      >
        {saving ? "Yadda saxlanılır..." : "İcarəni təsdiqlə"}
      </button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-slate-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
