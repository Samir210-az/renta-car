import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { calcOwnerOwed } from "../../lib/money";

export default function AdminReport({ cars, rentals }) {
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const activeCount = cars.filter((c) => c.status === "icarədə").length;
    const serviceCount = cars.filter((c) => c.status === "servisdə").length;
    const freeCount = cars.filter((c) => c.status === "boş").length;

    const monthRevenue = rentals
      .filter((r) => {
        const d = new Date(r.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, r) => sum + Number(r.totalPrice || 0), 0);

    const totalRevenue = rentals.reduce(
      (sum, r) => sum + Number(r.totalPrice || 0),
      0
    );

    const utilization =
      cars.length === 0 ? 0 : Math.round((activeCount / cars.length) * 100);

    return {
      activeCount,
      serviceCount,
      freeCount,
      monthRevenue,
      totalRevenue,
      utilization,
    };
  }, [cars, rentals]);

  const carsWithOwner = useMemo(
    () => cars.filter((c) => c.ownerName || c.ownerDailyRate),
    [cars]
  );

  const rentalsByCarId = useMemo(() => {
    const map = {};
    for (const r of rentals) {
      if (!map[r.carId]) map[r.carId] = [];
      map[r.carId].push(r);
    }
    return map;
  }, [rentals]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Bu ay gəlir" value={`${stats.monthRevenue} ₼`} />
        <StatCard label="Ümumi gəlir" value={`${stats.totalRevenue} ₼`} />
        <StatCard label="Flot doluluğu" value={`${stats.utilization}%`} />
        <StatCard label="Ümumi icarələr" value={rentals.length} />
      </div>

      <div className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4">
        <p className="text-[13px] font-medium text-stone-500 mb-3">
          Maşın statusları
        </p>
        <div className="space-y-2 text-[13.5px]">
          <Row label="Boş" value={stats.freeCount} color="bg-emerald-500" />
          <Row label="İcarədə" value={stats.activeCount} color="bg-rose-500" />
          <Row label="Servisdə" value={stats.serviceCount} color="bg-amber-500" />
        </div>
      </div>

      {carsWithOwner.length > 0 && (
        <div>
          <p className="text-[13px] font-medium text-stone-500 mb-2.5">
            Maşın sahibləri
          </p>
          <div className="space-y-2">
            {carsWithOwner.map((car) => {
              const owed = calcOwnerOwed(car, rentalsByCarId[car.id] || []);
              return (
                <Link
                  key={car.id}
                  to={`/masin/${car.id}`}
                  className="flex items-center justify-between rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium text-stone-50 truncate">
                      {car.ownerName || "Sahib qeyd olunmayıb"}
                    </p>
                    <p className="text-[12px] text-stone-500">{car.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[13px] font-medium text-stone-300">
                      {owed} ₼
                    </span>
                    <ChevronRight size={15} className="text-stone-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4">
      <p className="text-[12px] text-stone-400 mb-1">{label}</p>
      <p className="text-[19px] font-semibold text-stone-50">{value}</p>
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-stone-300">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        {label}
      </span>
      <span className="font-medium text-stone-50">{value}</span>
    </div>
  );
}
