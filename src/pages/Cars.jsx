import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CarFront, Plus, X } from "lucide-react";
import { getCompanyId } from "../lib/session";
import {
  listenCars,
  listenRentals,
  updateCar,
  addCar,
  listenCompanyProfile,
} from "../lib/data";
import CarCard from "../components/CarCard";

const FILTERS = ["hamısı", "boş", "icarədə", "servisdə"];

export default function Cars() {
  const { setCompanyName } = useOutletContext();
  const companyId = getCompanyId();
  const [cars, setCars] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [filter, setFilter] = useState("hamısı");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const unsubCars = listenCars(companyId, setCars);
    const unsubRentals = listenRentals(companyId, setRentals);
    const unsubProfile = listenCompanyProfile(companyId, (p) =>
      setCompanyName(p?.name)
    );
    return () => {
      unsubCars();
      unsubRentals();
      unsubProfile();
    };
  }, [companyId, setCompanyName]);

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

  async function cycleStatus(car) {
    const next = car.status === "boş" ? "servisdə" : "boş";
    await updateCar(companyId, car.id, { status: next });
  }

  if (cars === null) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[76px] rounded-xl2 bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-ink">Maşınlar</h1>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="h-9 w-9 rounded-full bg-ink text-white flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Maşın əlavə et"
        >
          {showAddForm ? <X size={17} /> : <Plus size={18} />}
        </button>
      </div>

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
                ? "bg-ink text-white"
                : "bg-white text-slate-500 ring-1 ring-slate-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {cars.length === 0 ? (
        <EmptyState />
      ) : visibleCars.length === 0 ? (
        <p className="text-center text-[13px] text-slate-400 mt-16">
          Bu statusda maşın yoxdur
        </p>
      ) : (
        <div className="space-y-3">
          {visibleCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              activeRental={activeRentalByCar[car.id]}
              onCycleStatus={cycleStatus}
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
      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <CarFront size={24} className="text-slate-400" />
      </div>
      <p className="text-[14px] font-medium text-ink">Hələ maşın əlavə olunmayıb</p>
      <p className="text-[13px] text-slate-400 mt-1 max-w-[240px]">
        Yuxarıdakı + düyməsi ilə ilk maşınızı əlavə edin
      </p>
    </div>
  );
}

function AddCarForm({ companyId, onDone }) {
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !plate.trim() || !dailyPrice) return;
    setSaving(true);
    try {
      await addCar(companyId, {
        name: name.trim(),
        plate: plate.trim().toUpperCase(),
        dailyPrice: Number(dailyPrice),
      });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl2 bg-white ring-1 ring-slate-100 shadow-soft p-4 space-y-3 mb-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Marka / Model"
          autoFocus
          className="h-11 rounded-lg bg-paper ring-1 ring-slate-200 px-3 text-[13.5px]"
        />
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="Dövlət nömrəsi"
          className="h-11 rounded-lg bg-paper ring-1 ring-slate-200 px-3 text-[13.5px]"
        />
      </div>
      <div className="flex gap-3">
        <input
          value={dailyPrice}
          onChange={(e) => setDailyPrice(e.target.value)}
          type="number"
          min="0"
          placeholder="Günlük qiymət (₼)"
          className="h-11 flex-1 rounded-lg bg-paper ring-1 ring-slate-200 px-3 text-[13.5px]"
        />
        <button
          type="submit"
          disabled={saving}
          className="h-11 px-4 rounded-lg bg-ink text-white text-[13.5px] font-medium disabled:opacity-40"
        >
          {saving ? "..." : "Əlavə et"}
        </button>
      </div>
    </form>
  );
}
