import { CheckCircle2, Trash2 } from "lucide-react";
import { closeRental, deleteRental } from "../../lib/data";
import StatusBadge from "../StatusBadge";

export default function AdminRentals({ rentals, carsById }) {
  async function handleClose(rental) {
    if (!confirm("Bu icarə bağlansın (maşın boşaldılsın)?")) return;
    await closeRental(rental);
  }

  async function handleDelete(rental) {
    if (!confirm("Bu icarə qeydi silinsin?")) return;
    await deleteRental(rental);
  }

  if (rentals.length === 0) {
    return (
      <p className="text-[13px] text-slate-400 text-center py-8">
        Hələ icarə qeydi yoxdur
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {rentals.map((r) => {
        const car = carsById[r.carId];
        return (
          <div
            key={r.id}
            className="rounded-xl2 bg-white ring-1 ring-slate-100 shadow-soft p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink text-[14px]">
                  {car?.name || "Silinmiş maşın"}
                </p>
                <p className="text-[12.5px] text-slate-500 mt-0.5">
                  {r.customerName} · {r.customerPhone}
                </p>
                <p className="text-[12.5px] text-slate-400 mt-0.5">
                  {r.startDate} → {r.endDate}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-ink text-[14px]">
                  {r.totalPrice} ₼
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={r.status === "aktiv" ? "icarədə" : "boş"} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
              {r.status === "aktiv" && (
                <button
                  onClick={() => handleClose(r)}
                  className="flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-600 hover:text-emerald-700"
                >
                  <CheckCircle2 size={14} />
                  Maşını qaytar
                </button>
              )}
              <button
                onClick={() => handleDelete(r)}
                className="flex items-center gap-1.5 text-[12.5px] text-slate-400 hover:text-rose-500 ml-auto"
              >
                <Trash2 size={13} />
                Sil
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
