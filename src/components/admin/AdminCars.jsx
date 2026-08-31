import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ImagePlus, X, ExternalLink } from "lucide-react";
import { updateCar, deleteCar } from "../../lib/data";
import { compressImage } from "../../lib/image";
import CarForm from "../CarForm";
import StatusBadge from "../StatusBadge";

const STATUS_OPTIONS = ["boş", "icarədə", "servisdə"];
const MAX_PHOTOS = 5;

export default function AdminCars({ companyId, cars }) {
  async function handleDelete(car) {
    if (!confirm(`"${car.name}" silinsin? Bu geri qaytarıla bilməz.`)) return;
    await deleteCar(companyId, car.id);
  }

  return (
    <div className="space-y-6">
      <CarForm companyId={companyId} />

      <div className="space-y-2.5">
        {cars.length === 0 && (
          <p className="text-[13px] text-stone-400 text-center py-8">
            Hələ maşın yoxdur
          </p>
        )}
        {cars.map((car) => (
          <div
            key={car.id}
            className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-stone-50 text-[14px]">
                  {car.name}
                  {car.year ? (
                    <span className="text-stone-400 font-normal"> · {car.year}</span>
                  ) : null}
                </p>
                <p className="text-[12.5px] text-stone-500">{car.plate}</p>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  to={`/masin/${car.id}`}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-gold hover:bg-gold/10 transition-colors"
                  aria-label="Kart səhifəsi"
                >
                  <ExternalLink size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(car)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  aria-label="Sil"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <CarPhotos companyId={companyId} car={car} />

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <select
                value={car.status}
                onChange={(e) =>
                  updateCar(companyId, car.id, { status: e.target.value })
                }
                className="h-9 rounded-lg bg-paper ring-1 ring-stone-700 px-2.5 text-[12.5px]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                type="text"
                inputMode="numeric"
                defaultValue={car.year ?? ""}
                onBlur={(e) =>
                  updateCar(companyId, car.id, {
                    year: e.target.value.replace(/\D/g, "").slice(0, 4)
                      ? Number(e.target.value.replace(/\D/g, "").slice(0, 4))
                      : null,
                  })
                }
                placeholder="İl"
                className="h-9 w-16 rounded-lg bg-paper ring-1 ring-stone-700 px-2 text-[12.5px]"
              />
              <input
                type="number"
                min="0"
                defaultValue={car.dailyPrice}
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (v > 0) updateCar(companyId, car.id, { dailyPrice: v });
                  else e.target.value = car.dailyPrice;
                }}
                className="h-9 w-24 rounded-lg bg-paper ring-1 ring-stone-700 px-2.5 text-[12.5px]"
              />
              <span className="text-[12px] text-stone-400">₼/gün</span>
              <div className="ml-auto">
                <StatusBadge status={car.status} />
              </div>
            </div>

            <div
              key={`${car.id}-${car.ownerName}-${car.ownerPhone}-${car.ownerDailyRate}`}
              className="flex items-center gap-2 mt-2 flex-wrap"
            >
              <input
                defaultValue={car.ownerName || ""}
                onBlur={(e) =>
                  updateCar(companyId, car.id, { ownerName: e.target.value.trim() })
                }
                placeholder="Sahibin adı"
                className="h-9 flex-1 min-w-[110px] rounded-lg bg-paper ring-1 ring-stone-700 px-2.5 text-[12.5px]"
              />
              <input
                defaultValue={car.ownerPhone || ""}
                onBlur={(e) =>
                  updateCar(companyId, car.id, { ownerPhone: e.target.value.trim() })
                }
                placeholder="Sahibin telefonu"
                className="h-9 flex-1 min-w-[110px] rounded-lg bg-paper ring-1 ring-stone-700 px-2.5 text-[12.5px]"
              />
              <input
                type="number"
                min="0"
                defaultValue={car.ownerDailyRate ?? ""}
                onBlur={(e) =>
                  updateCar(companyId, car.id, {
                    ownerDailyRate: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="Sahibə/gün ₼"
                className="h-9 w-28 rounded-lg bg-paper ring-1 ring-stone-700 px-2.5 text-[12.5px]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CarPhotos({ companyId, car }) {
  const [busy, setBusy] = useState(false);
  const photos = car.photos || [];

  async function handleSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    const toAdd = files.slice(0, room);
    setBusy(true);
    try {
      const compressed = await Promise.all(
        toAdd.map((f) => compressImage(f, { maxWidth: 640, quality: 0.6 }))
      );
      await updateCar(companyId, car.id, { photos: [...photos, ...compressed] });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function removePhoto(index) {
    const next = photos.filter((_, i) => i !== index);
    await updateCar(companyId, car.id, { photos: next });
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {photos.map((src, i) => (
        <div key={i} className="relative shrink-0">
          <img
            src={src}
            alt=""
            className="h-16 w-16 rounded-lg object-cover ring-1 ring-stone-700"
          />
          <button
            onClick={() => removePhoto(i)}
            aria-label="Şəkli sil"
            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center"
          >
            <X size={11} />
          </button>
        </div>
      ))}
      {photos.length < MAX_PHOTOS && (
        <label className="h-16 w-16 rounded-lg bg-paper ring-1 ring-dashed ring-stone-600 flex flex-col items-center justify-center gap-0.5 text-stone-400 cursor-pointer shrink-0">
          <ImagePlus size={15} />
          <span className="text-[9.5px]">{busy ? "..." : "əlavə et"}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleSelect}
          />
        </label>
      )}
    </div>
  );
}
