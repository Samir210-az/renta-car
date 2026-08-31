import { useEffect, useMemo, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { CarFront, Plus, X, Share2, Inbox } from "lucide-react";
import { getCompanyId } from "../lib/session";
import {
  listenCars,
  listenRentals,
  listenRequests,
  addCar,
  listenCompanyProfile,
} from "../lib/data";
import CarCard from "../components/CarCard";

const FILTERS = ["hamısı", "boş", "icarədə", "servisdə"];

export default function Cars() {
  const { setCompanyName, setCompanyLogo, setHeaderAction } = useOutletContext();
  const companyId = getCompanyId();
  const [cars, setCars] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("hamısı");
  const [showAddForm, setShowAddForm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubCars = listenCars(companyId, setCars);
    const unsubRentals = listenRentals(companyId, setRentals);
    const unsubRequests = listenRequests(companyId, setRequests);
    const unsubProfile = listenCompanyProfile(companyId, (p) => {
      setCompanyName(p?.name);
      setCompanyLogo(p?.logo || null);
    });
    return () => {
      unsubCars();
      unsubRentals();
      unsubRequests();
      unsubProfile();
    };
  }, [companyId, setCompanyName, setCompanyLogo]);

  useEffect(() => {
    setHeaderAction(
      <button
        onClick={() => setShowAddForm((v) => !v)}
        className="h-8 px-3 rounded-full bg-gold text-ink text-[12.5px] font-semibold flex items-center gap-1.5 active:scale-95 transition-transform"
      >
        {showAddForm ? <X size={15} /> : <Plus size={15} />}
        Maşın əlavə et
      </button>
    );
    return () => setHeaderAction(null);
  }, [showAddForm, setHeaderAction]);

  function copyCatalogLink() {
    const url = `${window.location.origin}/kataloq/${companyId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const activeRentalByCar = useMemo(() => {
    const map = {};
    for (const r of rentals) {
      if (r.status === "aktiv") map[r.carId] = r;
    }
    return map;
  }, [rentals]);

  const visibleCars = useMemo(() => {
    if (!cars) return [];
    if (filter === "hamısı") return cars;
    return cars.filter((c) => c.status === filter);
  }, [cars, filter]);

  if (cars === null) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[150px] rounded-xl2 bg-stone-800/60 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-stone-50">Maşınlar</h1>
        <button
          onClick={copyCatalogLink}
          className="h-9 px-3 rounded-full bg-surface ring-1 ring-stone-700 text-stone-300 text-[12.5px] font-medium flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Share2 size={14} />
          {copied ? "Kopyalandı!" : "Kataloq linki"}
        </button>
      </div>

      {requests.length > 0 && (
        <Link
          to="/tenant-admin"
          className="flex items-center gap-2.5 rounded-xl2 bg-amber-500/15 ring-1 ring-amber-500/25 px-4 py-3 mb-4"
        >
          <Inbox size={16} className="text-amber-400 shrink-0" />
          <span className="text-[13px] text-amber-300 font-medium">
            {requests.length} yeni sorğu gözləyir
          </span>
        </Link>
      )}

      {showAddForm && (
        <AddCarForm
          companyId={companyId}
          onDone={() => setShowAddForm(false)}
        />
      )}

      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
              filter === f
                ? "bg-gold text-ink"
                : "bg-surface text-stone-500 ring-1 ring-stone-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {cars.length === 0 ? (
        <EmptyState />
      ) : visibleCars.length === 0 ? (
        <p className="text-center text-[13px] text-stone-400 mt-16">
          Bu statusda maşın yoxdur
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visibleCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              activeRental={activeRentalByCar[car.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center mt-16">
      <div className="h-14 w-14 rounded-2xl bg-stone-800/60 flex items-center justify-center mb-4">
        <CarFront size={24} className="text-stone-400" />
      </div>
      <p className="text-[14px] font-medium text-stone-50">Hələ maşın əlavə olunmayıb</p>
      <p className="text-[13px] text-stone-400 mt-1 max-w-[240px]">
        Yuxarıda "Maşın əlavə et" düyməsi ilə ilk maşınızı əlavə edin
      </p>
    </div>
  );
}

function AddCarForm({ companyId, onDone }) {
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [year, setYear] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerDailyRate, setOwnerDailyRate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !name.trim() ||
      !plate.trim() ||
      !dailyPrice ||
      !ownerName.trim() ||
      !ownerPhone.trim() ||
      !ownerDailyRate
    )
      return;
    setSaving(true);
    try {
      await addCar(companyId, {
        name: name.trim(),
        plate: plate.trim().toUpperCase(),
        year: year ? Number(year) : null,
        dailyPrice: Number(dailyPrice),
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        ownerDailyRate: ownerDailyRate ? Number(ownerDailyRate) : null,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl2 bg-surface ring-1 ring-stone-700 shadow-soft p-4 space-y-3 mb-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Marka / Model"
          autoFocus
          className="h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px]"
        />
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="Dövlət nömrəsi"
          className="h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px]"
        />
      </div>
      <div className="flex gap-3">
        <input
          value={year}
          onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
          type="text"
          inputMode="numeric"
          placeholder="İl"
          className="h-11 w-20 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px]"
        />
        <input
          value={dailyPrice}
          onChange={(e) => setDailyPrice(e.target.value)}
          type="number"
          min="0"
          placeholder="Müştəriyə günlük (₼)"
          className="h-11 flex-1 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px]"
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
            className="h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px]"
          />
          <input
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            placeholder="Sahibin telefonu"
            required
            className="h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px]"
          />
        </div>
        <input
          value={ownerDailyRate}
          onChange={(e) => setOwnerDailyRate(e.target.value)}
          type="number"
          min="0"
          required
          placeholder="Sahibə günlük ödəniləcək məbləğ (₼)"
          className="h-11 w-full rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px]"
        />
      </div>

      <button
        type="submit"
        disabled={
          saving ||
          !name.trim() ||
          !plate.trim() ||
          !dailyPrice ||
          !ownerName.trim() ||
          !ownerPhone.trim() ||
          !ownerDailyRate
        }
        className="w-full h-11 rounded-lg bg-gold text-ink text-[13.5px] font-semibold disabled:opacity-40"
      >
        {saving ? "..." : "Əlavə et"}
      </button>
    </form>
  );
}
