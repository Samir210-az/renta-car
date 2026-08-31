import { Wrench } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function CarCard({ car, activeRental, onCycleStatus }) {
  return (
    <div className="rounded-xl2 bg-white ring-1 ring-slate-100 shadow-soft p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-ink text-[15px] truncate">
            {car.name}
          </h3>
        </div>
        <p className="text-[13px] text-slate-500 mt-0.5">
          {car.plate}
          {car.year ? ` · ${car.year}` : ""}
        </p>

        {car.status === "icarədə" && activeRental && (
          <p className="text-[12.5px] text-slate-500 mt-2">
            {activeRental.customerName} · qayıdış{" "}
            <span className="font-medium text-slate-700">
              {activeRental.endDate}
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <StatusBadge status={car.status} />
        {car.status !== "icarədə" && (
          <button
            onClick={() => onCycleStatus(car)}
            className="inline-flex items-center gap-1 text-[11.5px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Wrench size={12} />
            {car.status === "boş" ? "servisə göndər" : "aktiv et"}
          </button>
        )}
      </div>
    </div>
  );
}
