import { useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { az } from "date-fns/locale";
import { CalendarClock, PlayCircle } from "lucide-react";
import { getCompanyId, getStaffName } from "../lib/session";
import { listenCars, listenRentals, startReservation } from "../lib/data";

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
  const [tab, setTab] = useState("returns");
  const [busyId, setBusyId] = useState(null);

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

  const returnGroups = useMemo(() => {
    const active = rentals.filter((r) => r.status === "aktiv");
    const withDays = active.map((r) => ({
      ...r,
      days: differenceInCalendarDays(parseISO(r.endDate), new Date()),
      dateField: r.endDate,
    }));
    withDays.sort((a, b) => a.days - b.days);
    const map = {};
    for (const r of withDays) {
      const label = groupLabel(r.days);
      if (!map[label]) map[label] = [];
      map[label].push(r);
    }
    return map;
  }, [rentals]);

  const pickupGroups = useMemo(() => {
    const reserved = rentals.filter((r) => r.status === "rezerv");
    const withDays = reserved.map((r) => ({
      ...r,
      days: differenceInCalendarDays(parseISO(r.startDate), new Date()),
      dateField: r.startDate,
    }));
    withDays.sort((a, b) => a.days - b.days);
    const map = {};
    for (const r of withDays) {
      const label = groupLabel(r.days);
      if (!map[label]) map[label] = [];
      map[label].push(r);
    }
    return map;
  }, [rentals]);

  const groups = tab === "returns" ? returnGroups : pickupGroups;
  const hasAny = Object.keys(groups).length > 0;
  const pickupCount = pickupGroups
    ? Object.values(pickupGroups).reduce((s, arr) => s + arr.length, 0)
    : 0;

  async function handleStart(rental) {
    setBusyId(rental.id);
    try {
      await startReservation(companyId, rental, getStaffName());
    } catch (err) {
      alert(err.message || "Başlada bilmədik");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-stone-50 mb-4">Təqvim</h1>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setTab("returns")}
          className={`h-9 px-3.5 rounded-full text-[12.5px] font-medium transition-colors ${
            tab === "returns"
              ? "bg-gold text-ink"
              : "bg-surface text-stone-500 ring-1 ring-stone-700"
          }`}
        >
          Qayıdışlar
        </button>
        <button
          onClick={() => setTab("pickups")}
          className={`h-9 px-3.5 rounded-full text-[12.5px] font-medium transition-colors relative ${
            tab === "pickups"
              ? "bg-gold text-ink"
              : "bg-surface text-stone-500 ring-1 ring-stone-700"
          }`}
        >
          Gələn təhvillər
          {pickupCount > 0 && (
            <span className="ml-1.5 text-[10.5px]">({pickupCount})</span>
          )}
        </button>
      </div>

      {!hasAny ? (
        <div className="flex flex-col items-center text-center mt-20">
          <div className="h-14 w-14 rounded-2xl bg-stone-800 flex items-center justify-center mb-4">
            <CalendarClock size={24} className="text-stone-400" />
          </div>
          <p className="text-[14px] font-medium text-stone-50">
            {tab === "returns" ? "Aktiv icarə yoxdur" : "Gələn rezervasiya yoxdur"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {GROUP_ORDER.filter((g) => groups[g]).map((label) => (
            <div key={label}>
              <p
                className={`text-[12.5px] font-semibold mb-2 ${
                  label === "Gecikib" ? "text-rose-500" : "text-stone-400"
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
                      className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-stone-50 text-[14px] truncate">
                          {car?.name || "Silinmiş maşın"}
                        </p>
                        <p className="text-[12.5px] text-stone-500 mt-0.5">
                          {r.customerName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[12.5px] font-medium text-stone-300">
                          {format(parseISO(r.dateField), "d MMM", { locale: az })}
                        </span>
                        {tab === "pickups" && (
                          <button
                            onClick={() => handleStart(r)}
                            disabled={busyId === r.id}
                            aria-label="Təhvil ver"
                            className="h-7 w-7 rounded-full bg-gold/15 text-gold flex items-center justify-center disabled:opacity-40"
                          >
                            <PlayCircle size={15} />
                          </button>
                        )}
                      </div>
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
