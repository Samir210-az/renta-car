import { useNavigate } from "react-router-dom";
import { Check, X, Inbox } from "lucide-react";
import { resolveRequest } from "../../lib/data";
import PhoneActions from "../PhoneActions";

export default function AdminRequests({ companyId, requests, carsById }) {
  const navigate = useNavigate();

  function handleApprove(request) {
    // Qeyd: sorğu burada "approved" işarələnmir — bu, yalnız icarə
    // faktiki yaradıldıqdan sonra (NewRental.jsx-də) baş verir. Əks halda
    // işçi formu doldurmadan geri qayıtsa, sorğu izsiz itərdi.
    sessionStorage.setItem(
      "rc_prefill_request",
      JSON.stringify({
        carId: request.carId,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        requestId: request.id,
      })
    );
    navigate("/yeni-icare");
  }

  async function handleReject(request) {
    await resolveRequest(companyId, request.id, "rejected");
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <div className="h-14 w-14 rounded-2xl bg-stone-800 flex items-center justify-center mb-4">
          <Inbox size={24} className="text-stone-400" />
        </div>
        <p className="text-[14px] font-medium text-stone-50">Yeni sorğu yoxdur</p>
        <p className="text-[13px] text-stone-400 mt-1 max-w-[240px]">
          Kataloq linkindən daxil olan sorğular burada görünəcək
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {requests.map((r) => {
        const car = carsById[r.carId];
        return (
          <div
            key={r.id}
            className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4"
          >
            <p className="font-medium text-stone-50 text-[14px]">
              {car?.name || "Silinmiş maşın"}
            </p>
            <p className="text-[12.5px] text-stone-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>{r.customerName} · {r.customerPhone}</span>
              <PhoneActions phone={r.customerPhone} />
            </p>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-700">
              <button
                onClick={() => handleApprove(r)}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-400 hover:text-emerald-300"
              >
                <Check size={14} />
                Təsdiqlə
              </button>
              <button
                onClick={() => handleReject(r)}
                className="flex items-center gap-1.5 text-[12.5px] text-stone-400 hover:text-rose-400 ml-auto"
              >
                <X size={13} />
                Rədd et
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
