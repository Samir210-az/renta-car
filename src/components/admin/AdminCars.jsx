import { useState } from "react";
import { Plus, X } from "lucide-react";
import CarForm from "../CarForm";
import CarCard from "../CarCard";

export default function AdminCars({ companyId, cars }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-stone-400">
          {cars.length} maşın
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="h-8 px-3 rounded-full bg-gold text-ink text-[12.5px] font-semibold flex items-center gap-1.5"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          Maşın əlavə et
        </button>
      </div>

      {showForm && (
        <CarForm companyId={companyId} onDone={() => setShowForm(false)} />
      )}

      {cars.length === 0 ? (
        <p className="text-[13px] text-stone-400 text-center py-8">
          Hələ maşın yoxdur
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
