import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight, Search } from "lucide-react";
import PhoneActions from "../PhoneActions";

const PAGE_SIZE = 20;

export default function AdminCustomers({ customers }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q)
    );
  }, [customers, query]);

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
    <div className="space-y-3">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          placeholder="Ad və ya telefon üzrə axtar"
          className="w-full h-10 rounded-lg bg-surface ring-1 ring-stone-700 pl-9 pr-3 text-[13px] text-stone-50 placeholder:text-stone-500"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-[13px] text-stone-400 text-center py-8">Nəticə tapılmadı</p>
      ) : (
        <>
          <div className="space-y-2.5">
            {filtered.slice(0, visibleCount).map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/musteri/${c.id}`)}
                className="flex items-center justify-between rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4 cursor-pointer"
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
              </div>
            ))}
          </div>
          {visibleCount < filtered.length && (
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="w-full h-10 rounded-lg ring-1 ring-stone-700 text-[13px] text-stone-400"
            >
              Daha çox göstər ({filtered.length - visibleCount})
            </button>
          )}
        </>
      )}
    </div>
  );
}
