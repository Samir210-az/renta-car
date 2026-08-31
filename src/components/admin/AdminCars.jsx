import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addCar, updateCar, deleteCar } from "../../lib/data";
import StatusBadge from "../StatusBadge";

const STATUS_OPTIONS = ["boş", "icarədə", "servisdə"];

export default function AdminCars({ companyId, cars }) {
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim() || !plate.trim() || !dailyPrice) return;
    setSaving(true);
    try {
      await addCar(companyId, {
        name: name.trim(),
        plate: plate.trim().toUpperCase(),
        dailyPrice: Number(dailyPrice),
      });
      setName("");
      setPlate("");
      setDailyPrice("");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(car) {
    if (!confirm(`"${car.name}" silinsin? Bu geri qaytarıla bilməz.`)) return;
    await deleteCar(companyId, car.id);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleAdd}
        className="rounded-xl2 bg-white ring-1 ring-slate-100 shadow-soft p-4 space-y-3"
      >
        <p className="text-[13px] font-medium text-slate-500">Yeni maşın</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Marka / Model"
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
            className="h-11 px-4 rounded-lg bg-ink text-white flex items-center gap-1.5 text-[13.5px] font-medium disabled:opacity-40"
          >
            <Plus size={16} />
            Əlavə et
          </button>
        </div>
      </form>

      <div className="space-y-2.5">
        {cars.length === 0 && (
          <p className="text-[13px] text-slate-400 text-center py-8">
            Hələ maşın yoxdur
          </p>
        )}
        {cars.map((car) => (
          <div
            key={car.id}
            className="rounded-xl2 bg-white ring-1 ring-slate-100 shadow-soft p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-ink text-[14px]">{car.name}</p>
                <p className="text-[12.5px] text-slate-500">{car.plate}</p>
              </div>
              <button
                onClick={() => handleDelete(car)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                aria-label="Sil"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={car.status}
                onChange={(e) =>
                  updateCar(companyId, car.id, { status: e.target.value })
                }
                className="h-9 rounded-lg bg-paper ring-1 ring-slate-200 px-2.5 text-[12.5px]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={car.dailyPrice}
                onChange={(e) =>
                  updateCar(companyId, car.id, {
                    dailyPrice: Number(e.target.value),
                  })
                }
                className="h-9 w-24 rounded-lg bg-paper ring-1 ring-slate-200 px-2.5 text-[12.5px]"
              />
              <span className="text-[12px] text-slate-400">₼/gün</span>
              <div className="ml-auto">
                <StatusBadge status={car.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
