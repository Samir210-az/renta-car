import { useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { az } from "date-fns/locale";
import { CalendarClock } from "lucide-react";
import { getCompanyId } from "../lib/session";
import { listenCars, listenRentals } from "../lib/data";

function groupLabel(days) {
  if (days < 0) return "Gecikib";
  if (days === 0) return "Bu gün";
  if (days === 1) return "Sabah";
  if (days <= 7) return "Bu həftə";
  return "Sonra";
}

const GROUP_ORDER = ["Gecikib", "Bu gün", "Sabah", "Bu həftə", "Sonra"];

export default function Calendar() {
  const companyId = getCompanyId();
  const [cars, setCars] = useState({});
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    const unsubCars = listenCars(companyId, (list) => {
      const map = {};
      for (const c of list) map[c.id] = c;
      setCars(map);
    });
    const unsubRentals = listenRentals(companyId, setRentals);
    return () => {
      unsubCars();
      unsubRentals();
    };
  }, [companyId]);

  const groups = useMemo(() => {
    const active = rentals.filter((r) => r.status === "aktiv");
    const withDays = active.map((r) => ({
      ...r,
      daysLeft: differenceInCalendarDays(parseISO(r.endDate), new Date()),
    }));
    withDays.sort((a, b) => a.daysLeft - b.daysLeft);

    const map = {};
    for (const r of withDays) {
      const label = groupLabel(r.daysLeft);
      if (!map[label]) map[label] = [];
      map[label].push(r);
    }
    return map;
  }, [rentals]);

  const hasAny = Object.keys(groups).length > 0;

  return (
    <div>
      <h1 className="text-lg font-semibold text-ink mb-4">Qayıdışlar</h1>

      {!hasAny ? (
        <div className="flex flex-col items-center text-center mt-20">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <CalendarClock size={24} className="text-slate-400" />
          </div>
          <p className="text-[14px] font-medium text-ink">Aktiv icarə yoxdur</p>
        </div>
      ) : (
        <div className="space-y-6">
          {GROUP_ORDER.filter((g) => groups[g]).map((label) => (
            <div key={label}>
              <p
                className={`text-[12.5px] font-semibold mb-2 ${
                  label === "Gecikib" ? "text-rose-600" : "text-slate-400"
                }`}
              >
                {label}
              </p>
              <div className="space-y-2.5">
                {groups[label].map((r) => {
                  const car = cars[r.carId];
                  return (
                    <div
                      key={r.id}
                      className="rounded-xl2 bg-white ring-1 ring-slate-100 shadow-soft p-4 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-ink text-[14px] truncate">
                          {car?.name || "Silinmiş maşın"}
                        </p>
                        <p className="text-[12.5px] text-slate-500 mt-0.5">
                          {r.customerName}
                        </p>
                      </div>
                      <span className="text-[12.5px] font-medium text-slate-600 shrink-0">
                        {format(parseISO(r.endDate), "d MMM", { locale: az })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
