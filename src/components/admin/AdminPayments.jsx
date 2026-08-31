import { useMemo, useState } from "react";
import { Wallet, Users } from "lucide-react";
import { addOwnerPayment } from "../../lib/data";
import { calcOwnerOwed, calcTotalPaid } from "../../lib/money";

export default function AdminPayments({ companyId, cars, rentals, payments }) {
  const [expandedId, setExpandedId] = useState(null);

  const carsWithOwner = useMemo(
    () => cars.filter((c) => c.ownerName || c.ownerDailyRate),
    [cars]
  );

  const rentalsByCarId = useMemo(() => {
    const map = {};
    for (const r of rentals) {
      if (!map[r.carId]) map[r.carId] = [];
      map[r.carId].push(r);
    }
    return map;
  }, [rentals]);

  const paymentsByCarId = useMemo(() => {
    const map = {};
    for (const p of payments) {
      if (!map[p.carId]) map[p.carId] = [];
      map[p.carId].push(p);
    }
    return map;
  }, [payments]);

  if (carsWithOwner.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <div className="h-14 w-14 rounded-2xl bg-stone-800/60 flex items-center justify-center mb-4">
          <Users size={24} className="text-stone-400" />
        </div>
        <p className="text-[14px] font-medium text-stone-50">
          Sahibi olan maşın yoxdur
        </p>
        <p className="text-[13px] text-stone-400 mt-1 max-w-[260px]">
          Maşınlar tabında "Maşın sahibi" məlumatını doldursanız, burada görünəcək
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {carsWithOwner.map((car) => {
        const carRentals = rentalsByCarId[car.id] || [];
        const carPayments = paymentsByCarId[car.id] || [];
        const owed = calcOwnerOwed(car, carRentals);
        const paid = calcTotalPaid(carPayments);
        const remaining = owed - paid;

        return (
          <div
            key={car.id}
            className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4"
          >
            <button
              onClick={() => setExpandedId(expandedId === car.id ? null : car.id)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <p className="font-medium text-stone-50 text-[14px]">{car.name}</p>
                <p className="text-[12.5px] text-stone-500 mt-0.5">
                  {car.ownerName || "Sahib qeyd olunmayıb"}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-[15px] font-semibold ${
                    remaining > 0 ? "text-gold" : "text-stone-400"
                  }`}
                >
                  {remaining} ₼
                </p>
                <p className="text-[11px] text-stone-500">qalıq</p>
              </div>
            </button>

            {expandedId === car.id && (
              <PaymentDetail
                companyId={companyId}
                car={car}
                owed={owed}
                paid={paid}
                payments={carPayments}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PaymentDetail({ companyId, car, owed, paid, payments }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handlePay(e) {
    e.preventDefault();
    if (!amount || saving) return;
    setSaving(true);
    try {
      await addOwnerPayment(companyId, { carId: car.id, amount, note });
      setAmount("");
      setNote("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-stone-700 space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[13px] font-semibold text-stone-100">{owed} ₼</p>
          <p className="text-[10.5px] text-stone-500">cəmi borc</p>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-stone-100">{paid} ₼</p>
          <p className="text-[10.5px] text-stone-500">ödənilib</p>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gold">{owed - paid} ₼</p>
          <p className="text-[10.5px] text-stone-500">qalıq</p>
        </div>
      </div>

      <form onSubmit={handlePay} className="flex gap-2">
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Məbləğ (₼)"
          className="h-10 flex-1 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13px]"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Qeyd"
          className="h-10 flex-1 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13px]"
        />
        <button
          type="submit"
          disabled={!amount || saving}
          className="h-10 px-3.5 rounded-lg bg-gold text-ink text-[12.5px] font-semibold disabled:opacity-40 flex items-center gap-1.5 shrink-0"
        >
          <Wallet size={13} />
          Öde
        </button>
      </form>

      {payments.length > 0 && (
        <div className="space-y-1">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between text-[12px] text-stone-500 px-0.5"
            >
              <span>
                {new Date(p.paidAt).toLocaleDateString("az-AZ")}
                {p.note ? ` · ${p.note}` : ""}
              </span>
              <span className="text-stone-300 font-medium">{p.amount} ₼</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
