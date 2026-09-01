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

    const countedRentals = rentals.filter(
      (r) => r.status === "aktiv" || r.status === "bitib"
    );

    const monthRevenue = countedRentals
      .filter((r) => {
        const d = new Date(r.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, r) => sum + Number(r.totalPrice || 0), 0);

    const totalRevenue = countedRentals.reduce(
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

  const topCars = useMemo(() => {
    const revenueByCarId = {};
    for (const r of rentals) {
      if (r.status !== "aktiv" && r.status !== "bitib") continue;
      revenueByCarId[r.carId] = (revenueByCarId[r.carId] || 0) + Number(r.totalPrice || 0);
    }
    return Object.entries(revenueByCarId)
      .map(([carId, revenue]) => ({
        car: cars.find((c) => c.id === carId),
        revenue,
      }))
      .filter((x) => x.car)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [cars, rentals]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), revenue: 0 });
    }
    for (const r of rentals) {
      if (r.status !== "aktiv" && r.status !== "bitib") continue;
      const d = new Date(r.createdAt);
      const m = months.find(
        (x) => x.year === d.getFullYear() && x.month === d.getMonth()
      );
      if (m) m.revenue += Number(r.totalPrice || 0);
    }
    return months;
  }, [rentals]);

  const maxMonthly = Math.max(1, ...monthlyTrend.map((m) => m.revenue));

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

      {monthlyTrend.some((m) => m.revenue > 0) && (
        <div className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4">
          <p className="text-[13px] font-medium text-stone-500 mb-3">
            Son 6 ay — gəlir trendi
          </p>
          <div className="flex items-end gap-2 h-24">
            {monthlyTrend.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gold/70 rounded-t"
                  style={{
                    height: `${Math.max(4, (m.revenue / maxMonthly) * 100)}%`,
                  }}
                />
                <span className="text-[9px] text-stone-500">
                  {new Date(m.year, m.month).toLocaleDateString("az-AZ", {
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {topCars.length > 0 && (
        <div className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4">
          <p className="text-[13px] font-medium text-stone-500 mb-3">
            Ən çox gəlir gətirən maşınlar
          </p>
          <div className="space-y-2.5">
            {topCars.map(({ car, revenue }, i) => (
              <Link
                key={car.id}
                to={`/masin/${car.id}`}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2 text-[13px] text-stone-300 min-w-0">
                  <span className="text-stone-600 shrink-0">{i + 1}.</span>
                  <span className="truncate">{car.name}</span>
                </span>
                <span className="text-[13px] font-medium text-gold shrink-0">
                  {revenue} ₼
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

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
