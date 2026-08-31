import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Wallet, FileText, ImagePlus } from "lucide-react";
import { getCompanyId } from "../lib/session";
import { getCarDetail, updateCar, addOwnerPayment } from "../lib/data";
import { calcOwnerOwed, calcTotalPaid } from "../lib/money";
import { compressImage } from "../lib/image";
import StatusBadge from "../components/StatusBadge";
import Lightbox from "../components/Lightbox";

export default function CarDetail() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const companyId = getCompanyId();
  const [data, setData] = useState(undefined);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [paySaving, setPaySaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  async function reload() {
    const result = await getCarDetail(companyId, carId);
    setData(result);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, carId]);

  async function handleStatusChange(status) {
    await updateCar(companyId, carId, { status });
    reload();
  }

  async function handlePhotoAdd(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const photos = data.car.photos || [];
    const room = 5 - photos.length;
    setPhotoBusy(true);
    try {
      const compressed = await Promise.all(
        files.slice(0, room).map((f) => compressImage(f, { maxWidth: 640, quality: 0.6 }))
      );
      await updateCar(companyId, carId, { photos: [...photos, ...compressed] });
      reload();
    } finally {
      setPhotoBusy(false);
      e.target.value = "";
    }
  }

  async function handlePay(e) {
    e.preventDefault();
    if (!payAmount || paySaving) return;
    setPaySaving(true);
    try {
      await addOwnerPayment(companyId, { carId, amount: payAmount, note: payNote });
      setPayAmount("");
      setPayNote("");
      reload();
    } finally {
      setPaySaving(false);
    }
  }

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
        Maşın tapılmadı
      </div>
    );
  }

  const { car, rentals, payments } = data;
  const totalRevenue = rentals.reduce((s, r) => s + Number(r.totalPrice || 0), 0);
  const owed = calcOwnerOwed(car, rentals);
  const paid = calcTotalPaid(payments);
  const remaining = owed - paid;
  const photos = car.photos || [];

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
              {car.name}
              {car.year ? ` · ${car.year}` : ""}
            </h1>
            <p className="text-stone-400 text-[12px]">{car.plate}</p>
          </div>
          <div className="ml-auto shrink-0">
            <StatusBadge status={car.status} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-5 py-5 space-y-5">
        {photos.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {photos.map((src, i) => (
              <button key={i} onClick={() => setLightboxOpen(true)} className="shrink-0">
                <img
                  src={src}
                  alt=""
                  className="h-20 w-20 rounded-lg object-cover ring-1 ring-stone-700"
                />
              </button>
            ))}
          </div>
        )}

        {car.status === "icarədə" && (
          <p className="flex items-center gap-1.5 text-[12px] text-stone-500">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Bu maşın hazırda aktiv icarədədir — statusu dəyişmək üçün əvvəlcə
            İcarələr bölməsindən "Maşını qaytar" edin
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStatusChange("boş")}
            disabled={car.status === "boş" || car.status === "icarədə"}
            className="h-9 px-3.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[12.5px] font-medium disabled:opacity-40 ring-1 ring-emerald-500/25"
          >
            Boş et
          </button>
          <button
            onClick={() => handleStatusChange("servisdə")}
            disabled={car.status === "servisdə" || car.status === "icarədə"}
            className="h-9 px-3.5 rounded-full bg-amber-500/15 text-amber-400 text-[12.5px] font-medium disabled:opacity-40 ring-1 ring-amber-500/25"
          >
            Servisə göndər
          </button>
          <label className="h-9 w-9 rounded-full bg-surface ring-1 ring-stone-700 flex items-center justify-center text-stone-400 cursor-pointer ml-auto">
            <ImagePlus size={15} />
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoAdd}
              disabled={photoBusy}
            />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="İcarələr" value={rentals.length} />
          <StatCard label="Gəlir" value={`${totalRevenue} ₼`} />
          <StatCard label="Günlük" value={`${car.dailyPrice} ₼`} />
        </div>

        {(car.ownerName || car.ownerDailyRate) && (
          <Section title="Maşın sahibi">
            <div className="rounded-xl2 bg-surface ring-1 ring-stone-700 p-4 space-y-1.5">
              <Row label="Ad" value={car.ownerName || "—"} />
              <Row label="Telefon" value={car.ownerPhone || "—"} />
              <Row
                label="Sahibə günlük"
                value={car.ownerDailyRate ? `${car.ownerDailyRate} ₼` : "—"}
              />
              <div className="border-t border-stone-700 my-2" />
              <Row label="Cəmi borc" value={`${owed} ₼`} />
              <Row label="Ödənilib" value={`${paid} ₼`} />
              <Row
                label="Qalıq"
                value={`${remaining} ₼`}
                highlight={remaining > 0}
              />
            </div>

            <form onSubmit={handlePay} className="rounded-xl2 bg-surface ring-1 ring-stone-700 p-4 space-y-2.5 mt-3">
              <p className="text-[12.5px] font-medium text-stone-400 flex items-center gap-1.5">
                <Wallet size={13} />
                Sahibə ödəniş et
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Məbləğ (₼)"
                  className="h-10 flex-1 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13px]"
                />
                <input
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Qeyd (istəyə görə)"
                  className="h-10 flex-1 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13px]"
                />
              </div>
              <button
                type="submit"
                disabled={!payAmount || paySaving}
                className="h-9 px-4 rounded-lg bg-gold text-ink text-[12.5px] font-semibold disabled:opacity-40"
              >
                {paySaving ? "..." : "Ödənişi qeyd et"}
              </button>
            </form>

            {payments.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-[12.5px] text-stone-400 px-1"
                  >
                    <span>
                      {new Date(p.paidAt).toLocaleDateString("az-AZ")}
                      {p.note ? ` · ${p.note}` : ""}
                    </span>
                    <span className="font-medium text-stone-200">{p.amount} ₼</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        <Section title={`İcarə tarixçəsi (${rentals.length})`}>
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
                    <p className="text-[13px] font-medium text-stone-100 truncate">
                      {r.customerName}
                    </p>
                    <p className="text-[12px] text-stone-500">
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
        </Section>
      </main>

      {lightboxOpen && (
        <Lightbox photos={photos} onClose={() => setLightboxOpen(false)} />
      )}
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

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[12.5px] font-semibold text-stone-400 mb-2">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-stone-500">{label}</span>
      <span className={`font-medium ${highlight ? "text-gold" : "text-stone-200"}`}>
        {value}
      </span>
    </div>
  );
}
