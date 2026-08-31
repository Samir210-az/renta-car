import { useNavigate } from "react-router-dom";
import { Check, X, Inbox } from "lucide-react";
import { resolveRequest } from "../../lib/data";

export default function AdminRequests({ companyId, requests, carsById }) {
  const navigate = useNavigate();

  async function handleApprove(request) {
    sessionStorage.setItem(
      "rc_prefill_request",
      JSON.stringify({
        carId: request.carId,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        requestId: request.id,
      })
    );
    await resolveRequest(companyId, request.id, "approved");
    navigate("/yeni-icare");
  }

  async function handleReject(request) {
    await resolveRequest(companyId, request.id, "rejected");
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <div className="h-14 w-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
          <Inbox size={24} className="text-stone-400" />
        </div>
        <p className="text-[14px] font-medium text-ink">Yeni sorğu yoxdur</p>
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
            className="rounded-xl2 bg-white ring-1 ring-stone-100 shadow-soft p-4"
          >
            <p className="font-medium text-ink text-[14px]">
              {car?.name || "Silinmiş maşın"}
            </p>
            <p className="text-[12.5px] text-stone-500 mt-0.5">
              {r.customerName} · {r.customerPhone}
            </p>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-50">
              <button
                onClick={() => handleApprove(r)}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-600 hover:text-emerald-700"
              >
                <Check size={14} />
                Təsdiqlə
              </button>
              <button
                onClick={() => handleReject(r)}
                className="flex items-center gap-1.5 text-[12.5px] text-stone-400 hover:text-rose-500 ml-auto"
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
