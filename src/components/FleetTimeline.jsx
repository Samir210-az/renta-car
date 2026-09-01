import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format, addDays } from "date-fns";
import { az } from "date-fns/locale";

const DAYS_AHEAD = 14;

const COLORS = {
  boş: "bg-emerald-500/70",
  icarədə: "bg-rose-500/70",
  rezerv: "bg-sky-500/70",
  servisdə: "bg-amber-500/70",
};

function dayStatus(car, dateStr, rentalsByCarId) {
  if (car.status === "servisdə") return "servisdə";
  const carRentals = rentalsByCarId[car.id] || [];
  const hit = carRentals.find(
    (r) =>
      (r.status === "aktiv" || r.status === "rezerv") &&
      dateStr >= r.startDate &&
      dateStr <= r.endDate
  );
  if (hit) return hit.status === "aktiv" ? "icarədə" : "rezerv";
  return "boş";
}

export default function FleetTimeline({ cars, rentals }) {
  const days = useMemo(() => {
    const list = [];
    for (let i = 0; i < DAYS_AHEAD; i++) {
      list.push(format(addDays(new Date(), i), "yyyy-MM-dd"));
    }
    return list;
  }, []);

  const rentalsByCarId = useMemo(() => {
    const map = {};
    for (const r of rentals) {
      if (!map[r.carId]) map[r.carId] = [];
      map[r.carId].push(r);
    }
    return map;
  }, [rentals]);

  const sortedCars = useMemo(
    () => [...cars].sort((a, b) => a.name.localeCompare(b.name, "az")),
    [cars]
  );

  if (sortedCars.length === 0) {
    return (
      <p className="text-center text-[13px] text-stone-400 mt-16">
        Hələ maşın əlavə olunmayıb
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3 flex-wrap text-[11px] text-stone-400">
        {Object.entries(COLORS).map(([label, cls]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded ${cls}`} />
            {label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto -mx-5 px-5 pb-2">
        <div className="inline-block min-w-full">
          <div className="flex items-center gap-[3px] mb-1.5 pl-[84px]">
            {days.map((d) => (
              <div
                key={d}
                className="w-6 shrink-0 text-center text-[9px] text-stone-500"
              >
                {format(new Date(d), "d", { locale: az })}
              </div>
            ))}
          </div>

          {sortedCars.map((car) => (
            <Link
              key={car.id}
              to={`/masin/${car.id}`}
              className="flex items-center gap-[3px] mb-1.5"
            >
              <div className="w-[80px] shrink-0 text-[11px] text-stone-300 truncate pr-2">
                {car.name}
              </div>
              {days.map((d) => (
                <div
                  key={d}
                  className={`w-6 h-6 shrink-0 rounded ${
                    COLORS[dayStatus(car, d, rentalsByCarId)]
                  }`}
                />
              ))}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
