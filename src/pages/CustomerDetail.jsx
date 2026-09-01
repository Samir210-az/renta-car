import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import { getCompanyId } from "../lib/session";
import { getCustomerDetail } from "../lib/data";
import PhoneActions from "../components/PhoneActions";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function CustomerDetail() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const companyId = getCompanyId();
  const [data, setData] = useState(undefined);

  useEffect(() => {
    getCustomerDetail(companyId, customerId).then(setData);
  }, [companyId, customerId]);

  if (data === undefined) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-stone-700 border-t-gold animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-[13px] text-stone-400">
        Müştəri tapılmadı
      </div>
    );
  }

  const { customer, rentals } = data;
  const totalSpent = rentals.reduce((s, r) => s + Number(r.totalPrice || 0), 0);
  const licenseExpired =
    customer.licenseValidUntil && customer.licenseValidUntil < todayISO();

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="sticky top-0 z-20 bg-ink">
        <div className="max-w-lg mx-auto px-5 py-3.5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-white shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-white font-semibold text-[16px] truncate">
              {customer.name}
            </h1>
            <p className="text-stone-400 text-[12px] flex items-center gap-1.5">
              {customer.phone}
              <PhoneActions phone={customer.phone} />
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-5 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Ümumi icarə" value={rentals.length} />
          <StatCard label="Ümumi xərc" value={`${totalSpent} ₼`} />
        </div>

        {customer.licenseNumber && (
          <div className="rounded-xl2 bg-surface ring-1 ring-stone-700 p-4 space-y-1.5">
            <Row label="Vəsiqə №" value={customer.licenseNumber} />
            <Row
              label="Hüquq bitmə tarixi"
              value={customer.licenseValidUntil || "—"}
            />
            {licenseExpired && (
              <p className="flex items-center gap-1.5 text-[12px] text-rose-400 mt-1">
                <AlertTriangle size={12} />
                Vəsiqənin müddəti bitib
              </p>
            )}
          </div>
        )}

        <div>
          <p className="text-[12.5px] font-semibold text-stone-400 mb-2">
            İcarə tarixçəsi
          </p>
          {rentals.length === 0 ? (
            <p className="text-[13px] text-stone-500">Hələ icarə olmayıb</p>
          ) : (
            <div className="space-y-2">
              {rentals.map((r) => (
                <Link
                  key={r.id}
                  to={`/akt/${companyId}/${r.id}`}
                  className="flex items-center justify-between rounded-xl2 bg-surface ring-1 ring-stone-700 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[12.5px] text-stone-500">
                      {r.startDate} → {r.endDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[13px] font-medium text-stone-200">
                      {r.totalPrice} ₼
                    </span>
                    <FileText size={13} className="text-stone-500" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl2 bg-surface ring-1 ring-stone-700 p-3.5 text-center">
      <p className="text-[17px] font-semibold text-stone-50">{value}</p>
      <p className="text-[11px] text-stone-500 mt-0.5">{label}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-stone-200">{value}</span>
    </div>
  );
}
