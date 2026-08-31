import { useMemo } from "react";

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Bu ay gəlir" value={`${stats.monthRevenue} ₼`} />
        <StatCard label="Ümumi gəlir" value={`${stats.totalRevenue} ₼`} />
        <StatCard label="Flot doluluğu" value={`${stats.utilization}%`} />
        <StatCard label="Ümumi icarələr" value={rentals.length} />
      </div>

      <div className="rounded-xl2 bg-white ring-1 ring-stone-100 shadow-soft p-4">
        <p className="text-[13px] font-medium text-stone-500 mb-3">
          Maşın statusları
        </p>
        <div className="space-y-2 text-[13.5px]">
          <Row label="Boş" value={stats.freeCount} color="bg-emerald-500" />
          <Row label="İcarədə" value={stats.activeCount} color="bg-rose-500" />
          <Row label="Servisdə" value={stats.serviceCount} color="bg-amber-500" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl2 bg-white ring-1 ring-stone-100 shadow-soft p-4">
      <p className="text-[12px] text-stone-400 mb-1">{label}</p>
      <p className="text-[19px] font-semibold text-ink">{value}</p>
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-stone-600">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        {label}
      </span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
