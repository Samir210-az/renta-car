import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CarFront } from "lucide-react";
import { listenCars, listenRentals, updateCar, listenSettings } from "../lib/data";
import CarCard from "../components/CarCard";

const FILTERS = ["hamısı", "boş", "icarədə", "servisdə"];

export default function Cars() {
  const { setCompanyName } = useOutletContext();
  const [cars, setCars] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [filter, setFilter] = useState("hamısı");

  useEffect(() => {
    const unsubCars = listenCars(setCars);
    const unsubRentals = listenRentals(setRentals);
    const unsubSettings = listenSettings((s) => setCompanyName(s.companyName));
    return () => {
      unsubCars();
      unsubRentals();
      unsubSettings();
    };
  }, [setCompanyName]);

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
    await updateCar(car.id, { status: next });
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
    <div className="flex flex-col items-center text-center mt-20">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <CarFront size={24} className="text-slate-400" />
      </div>
      <p className="text-[14px] font-medium text-ink">Hələ maşın əlavə olunmayıb</p>
      <p className="text-[13px] text-slate-400 mt-1 max-w-[240px]">
        Maşınları admin paneldən əlavə edə bilərsiniz
      </p>
    </div>
  );
}
