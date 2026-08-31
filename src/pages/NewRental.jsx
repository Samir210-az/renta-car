import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ImagePlus, X, AlertTriangle } from "lucide-react";
import { getCompanyId } from "../lib/session";
import { listenCars, addRental, resolveRequest } from "../lib/data";
import { compressImage } from "../lib/image";
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
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseValidUntil, setLicenseValidUntil] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [pickupKm, setPickupKm] = useState("");
  const [pickupFuel, setPickupFuel] = useState("Dolu");
  const [pickupExteriorNotes, setPickupExteriorNotes] = useState("");
  const [pickupInteriorNotes, setPickupInteriorNotes] = useState("");
  const [pickupDamage, setPickupDamage] = useState([]);
  const [platePhoto, setPlatePhoto] = useState(null);
  const [platePhotoBusy, setPlatePhotoBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState("");
  const [prefillRequestId, setPrefillRequestId] = useState(null);

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
      setPrefillRequestId(prefill.requestId || null);
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

  const licenseExpired =
    licenseValidUntil && licenseValidUntil < startDate;

  const isValid =
    carId &&
    customerName.trim() &&
    customerPhone.trim() &&
    startDate &&
    endDate &&
    endDate >= startDate &&
    !licenseExpired;

  async function handlePlatePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPlatePhotoBusy(true);
    try {
      const dataUrl = await compressImage(file, { maxWidth: 640, quality: 0.6 });
      setPlatePhoto(dataUrl);
    } finally {
      setPlatePhotoBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || saving) return;
    setSaving(true);
    setFormError("");
    try {
      await addRental(companyId, {
        carId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        licenseNumber: licenseNumber.trim(),
        licenseValidUntil: licenseValidUntil || null,
        startDate,
        endDate,
        dailyPrice: Number(selectedCar.dailyPrice || 0),
        totalPrice,
        pickupCondition: {
          km: pickupKm ? Number(pickupKm) : null,
          fuel: pickupFuel,
          exteriorNotes: pickupExteriorNotes.trim(),
          interiorNotes: pickupInteriorNotes.trim(),
          damageMarkers: pickupDamage,
          platePhoto: platePhoto || null,
          signedAt: Date.now(),
        },
      });
      if (prefillRequestId) {
        await resolveRequest(companyId, prefillRequestId, "approved");
      }
      setDone(true);
      setTimeout(() => navigate("/"), 900);
    } catch (err) {
      setFormError(err.message || "İcarə yaradıla bilmədi, yenidən cəhd edin");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center mt-24">
        <CheckCircle2 size={40} className="text-emerald-500 mb-3" />
        <p className="font-medium text-stone-50">İcarə qeydə alındı</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-lg font-semibold text-stone-50 mb-1">Yeni icarə</h1>

      <Field label="Maşın">
        <select
          value={carId}
          onChange={(e) => setCarId(e.target.value)}
          required
          className="w-full h-12 rounded-xl bg-surface ring-1 ring-stone-700 px-3.5 text-[14px] text-stone-50"
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
          className="w-full h-12 rounded-xl bg-surface ring-1 ring-stone-700 px-3.5 text-[14px] text-stone-50 placeholder:text-stone-400"
        />
      </Field>

      <Field label="Telefon">
        <input
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          required
          placeholder="+994 XX XXX XX XX"
          className="w-full h-12 rounded-xl bg-surface ring-1 ring-stone-700 px-3.5 text-[14px] text-stone-50 placeholder:text-stone-400"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Sürücülük vəsiqəsi №">
          <input
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="AZE0000000"
            className="w-full h-12 rounded-xl bg-surface ring-1 ring-stone-700 px-3.5 text-[14px] text-stone-50 placeholder:text-stone-400"
          />
        </Field>
        <Field label="Vəsiqə hüququ bitmə tarixi">
          <input
            type="date"
            value={licenseValidUntil}
            onChange={(e) => setLicenseValidUntil(e.target.value)}
            className="w-full h-12 rounded-xl bg-surface ring-1 ring-stone-700 px-3 text-[14px] text-stone-50"
          />
        </Field>
      </div>

      {licenseExpired && (
        <p className="flex items-center gap-1.5 text-[12.5px] text-rose-400 -mt-2">
          <AlertTriangle size={13} />
          Vəsiqənin hüququ icarə başlanğıcından əvvəl bitir — davam etmək
          mümkün deyil
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Başlanğıc">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full h-12 rounded-xl bg-surface ring-1 ring-stone-700 px-3 text-[14px] text-stone-50"
          />
        </Field>
        <Field label="Bitmə">
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full h-12 rounded-xl bg-surface ring-1 ring-stone-700 px-3 text-[14px] text-stone-50"
          />
        </Field>
      </div>

      {selectedCar && (
        <div className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4 flex items-center justify-between">
          <span className="text-[13px] text-stone-500">
            {daysBetween(startDate, endDate)} gün × {selectedCar.dailyPrice} ₼
          </span>
          <span className="font-semibold text-stone-50 text-[16px]">
            {totalPrice} ₼
          </span>
        </div>
      )}

      <div className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4 space-y-3">
        <p className="text-[13px] font-medium text-stone-500">
          Təhvil zamanı vəziyyət (aktın hissəsi)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min="0"
            value={pickupKm}
            onChange={(e) => setPickupKm(e.target.value)}
            placeholder="Km sayğacı"
            className="h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
          />
          <select
            value={pickupFuel}
            onChange={(e) => setPickupFuel(e.target.value)}
            className="h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
          >
            {FUEL_LEVELS.map((f) => (
              <option key={f} value={f}>
                Yanacaq: {f}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={pickupExteriorNotes}
          onChange={(e) => setPickupExteriorNotes(e.target.value)}
          placeholder="Xarici vəziyyət qeydi (istəyə görə)"
          rows={2}
          className="w-full rounded-lg bg-paper ring-1 ring-stone-700 px-3 py-2.5 text-[13.5px] resize-none text-stone-50"
        />
        <DamageDiagram value={pickupDamage} onChange={setPickupDamage} />

        <textarea
          value={pickupInteriorNotes}
          onChange={(e) => setPickupInteriorNotes(e.target.value)}
          placeholder="Daxili vəziyyət qeydi (salon, oturacaqlar, ləkə və s.)"
          rows={2}
          className="w-full rounded-lg bg-paper ring-1 ring-stone-700 px-3 py-2.5 text-[13.5px] resize-none text-stone-50"
        />

        <div>
          <p className="text-[12.5px] font-medium text-stone-500 mb-1.5">
            Nömrə şəkli
          </p>
          {platePhoto ? (
            <div className="relative w-28">
              <img
                src={platePhoto}
                alt=""
                className="w-28 h-20 rounded-lg object-cover ring-1 ring-stone-700"
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
            <label className="w-28 h-20 rounded-lg bg-paper ring-1 ring-dashed ring-stone-600 flex flex-col items-center justify-center gap-0.5 text-stone-400 cursor-pointer">
              <ImagePlus size={16} />
              <span className="text-[10px]">
                {platePhotoBusy ? "..." : "şəkil çək"}
              </span>
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
      </div>

      <button
        type="submit"
        disabled={!isValid || saving}
        className="w-full h-12 rounded-xl bg-gold text-ink font-semibold text-[14px] disabled:opacity-40 active:scale-[0.98] transition-transform"
      >
        {saving ? "Yadda saxlanılır..." : "İcarəni təsdiqlə"}
      </button>

      {formError && (
        <p className="flex items-center gap-1.5 text-[12.5px] text-rose-400">
          <AlertTriangle size={13} />
          {formError}
        </p>
      )}
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-stone-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
