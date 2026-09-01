import { Link } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";
import PhoneActions from "../PhoneActions";

export default function AdminCustomers({ customers }) {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <div className="h-14 w-14 rounded-2xl bg-stone-800 flex items-center justify-center mb-4">
          <Users size={24} className="text-stone-400" />
        </div>
        <p className="text-[14px] font-medium text-stone-50">Hələ müştəri yoxdur</p>
        <p className="text-[13px] text-stone-400 mt-1 max-w-[240px]">
          İlk icarəni yaradanda müştəri avtomatik qeydə alınacaq
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {customers.map((c) => (
        <Link
          key={c.id}
          to={`/musteri/${c.id}`}
          className="flex items-center justify-between rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4"
        >
          <div className="min-w-0">
            <p className="font-medium text-stone-50 text-[14px] truncate">
              {c.name}
            </p>
            <p className="text-[12.5px] text-stone-500 mt-0.5 flex items-center gap-1.5">
              {c.phone}
              <PhoneActions phone={c.phone} />
            </p>
          </div>
          <ChevronRight size={16} className="text-stone-600 shrink-0" />
        </Link>
      ))}
    </div>
  );
}
