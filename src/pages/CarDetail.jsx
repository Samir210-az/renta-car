import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Wallet, FileText, ImagePlus, Trash2, AlertOctagon, Check, Pencil, X, Wrench } from "lucide-react";
import { getCompanyId, getStaffName } from "../lib/session";
import { getCarDetail, updateCar, addOwnerPayment, deleteCar, addFine, toggleFinePaid, deleteFine } from "../lib/data";
import { calcOwnerOwed, calcTotalPaid } from "../lib/money";
import { getCurrentKm, isServiceDue } from "../lib/maintenance";
import { compressImage } from "../lib/image";
import StatusBadge from "../components/StatusBadge";
import Lightbox from "../components/Lightbox";
import PhoneActions from "../components/PhoneActions";
import ReturnConditionForm from "../components/ReturnConditionForm";

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
  const [fineAmount, setFineAmount] = useState("");
  const [fineDesc, setFineDesc] = useState("");
  const [fineSaving, setFineSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [returning, setReturning] = useState(false);

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

  async function handleDelete() {
    if (data.car.status === "icarədə") {
      alert(
        "Bu maşın hazırda aktiv icarədədir. Silmək üçün əvvəlcə İcarələr bölməsindən icarəni bağlayın."
      );
      return;
    }
    if (!confirm(`"${data.car.name}" silinsin? Bu geri qaytarıla bilməz.`))
      return;
    await deleteCar(companyId, carId);
    navigate("/", { replace: true });
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
      await addOwnerPayment(companyId, { carId, amount: payAmount, note: payNote, staffName: getStaffName() });
      setPayAmount("");
      setPayNote("");
      reload();
    } finally {
      setPaySaving(false);
    }
  }

  async function handleAddFine(e) {
    e.preventDefault();
    if (!fineAmount || fineSaving) return;
    setFineSaving(true);
    try {
      await addFine(companyId, { carId, amount: fineAmount, description: fineDesc });
      setFineAmount("");
      setFineDesc("");
      reload();
    } finally {
      setFineSaving(false);
    }
  }

  async function handleToggleFine(fine) {
    await toggleFinePaid(companyId, fine.id, !fine.paid);
    reload();
  }

  async function handleDeleteFine(fineId) {
    if (!confirm("Bu cərimə qeydi silinsin?")) return;
    await deleteFine(companyId, fineId);
    reload();
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

  const { car, rentals, payments, fines = [] } = data;
  const countedRentals = rentals.filter((r) => r.status === "aktiv" || r.status === "bitib");
  const totalRevenue = countedRentals.reduce((s, r) => s + Number(r.totalPrice || 0), 0);
  const unpaidFines = fines.filter((f) => !f.paid).reduce((s, f) => s + Number(f.amount || 0), 0);
  const owed = calcOwnerOwed(car, rentals);
  const paid = calcTotalPaid(payments);
  const remaining = owed - paid;
  const photos = car.photos || [];
  const currentKm = getCurrentKm(rentals);
  const serviceDue = isServiceDue(car, currentKm);
  const activeRental = rentals.find((r) => r.status === "aktiv");

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
          <div className="ml-auto shrink-0 flex items-center gap-2">
            <StatusBadge status={car.status} />
            <button
              onClick={handleDelete}
              aria-label="Maşını sil"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 size={16} />
            </button>
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

        {activeRental && (
          <div className="rounded-xl2 bg-rose-500/10 ring-1 ring-rose-500/25 p-4">
            <p className="text-[12.5px] font-medium text-rose-300 mb-1">
              Aktiv icarədə
            </p>
            <p className="text-[13px] text-stone-200">
              {activeRental.customerName} · {activeRental.startDate} →{" "}
              {activeRental.endDate}
            </p>

            {returning ? (
              <ReturnConditionForm
                companyId={companyId}
                rental={activeRental}
                onDone={() => {
                  setReturning(false);
                  reload();
                }}
                onCancel={() => setReturning(false)}
              />
            ) : (
              <button
                onClick={() => setReturning(true)}
                className="h-9 px-3.5 rounded-lg bg-emerald-600 text-white text-[12.5px] font-medium mt-3"
              >
                Maşını qaytar
              </button>
            )}
          </div>
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

        {serviceDue && (
          <div className="flex items-center gap-2.5 rounded-xl2 bg-amber-500/15 ring-1 ring-amber-500/25 px-4 py-3">
            <Wrench size={16} className="text-amber-400 shrink-0" />
            <span className="text-[13px] text-amber-300 font-medium">
              Servis vaxtıdır
              {currentKm != null && car.nextServiceKm
                ? ` — ${currentKm} km (limit: ${car.nextServiceKm} km)`
                : ""}
            </span>
          </div>
        )}
        {currentKm != null && (
          <p className="text-[12px] text-stone-500 -mt-2">
            Bilinən son km: {currentKm}
          </p>
        )}

        <button
          onClick={() => setEditing((v) => !v)}
          className="flex items-center gap-1.5 text-[12.5px] font-medium text-stone-400 hover:text-gold transition-colors"
        >
          {editing ? <X size={14} /> : <Pencil size={13} />}
          {editing ? "Redaktəni bağla" : "Maşın məlumatlarını redaktə et"}
        </button>

        {editing && (
          <CarEditForm
            companyId={companyId}
            car={car}
            onDone={() => {
              setEditing(false);
              reload();
            }}
          />
        )}

        {(car.ownerName || car.ownerDailyRate) && (
          <Section title="Maşın sahibi">
            <div className="rounded-xl2 bg-surface ring-1 ring-stone-700 p-4 space-y-1.5 text-stone-50">
              <Row label="Ad" value={car.ownerName || "—"} />
              <Row
                label="Telefon"
                value={
                  car.ownerPhone ? (
                    <span className="flex items-center gap-1.5">
                      {car.ownerPhone}
                      <PhoneActions phone={car.ownerPhone} />
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
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

            <form onSubmit={handlePay} className="rounded-xl2 bg-surface ring-1 ring-stone-700 p-4 space-y-2.5 mt-3 text-stone-50">
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
                  className="h-10 flex-1 min-w-0 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13px] text-stone-50"
                />
                <input
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Qeyd (istəyə görə)"
                  className="h-10 flex-1 min-w-0 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13px] text-stone-50"
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
                {p.paidBy ? ` · ${p.paidBy}` : ""}
                    </span>
                    <span className="font-medium text-stone-200">{p.amount} ₼</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        <Section title={`Cərimələr${unpaidFines > 0 ? ` · ${unpaidFines} ₼ ödənilməmiş` : ""}`}>
          <form onSubmit={handleAddFine} className="rounded-xl2 bg-surface ring-1 ring-stone-700 p-4 space-y-2.5 mb-3">
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={fineAmount}
                onChange={(e) => setFineAmount(e.target.value)}
                placeholder="Məbləğ (₼)"
                className="h-10 flex-1 min-w-0 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13px] text-stone-50"
              />
              <input
                value={fineDesc}
                onChange={(e) => setFineDesc(e.target.value)}
                placeholder="Səbəb (məs. sürət cəriməsi)"
                className="h-10 flex-1 min-w-0 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13px] text-stone-50"
              />
            </div>
            <button
              type="submit"
              disabled={!fineAmount || fineSaving}
              className="h-9 px-4 rounded-lg bg-gold text-ink text-[12.5px] font-semibold disabled:opacity-40"
            >
              {fineSaving ? "..." : "Cərimə əlavə et"}
            </button>
          </form>

          {fines.length === 0 ? (
            <p className="text-[13px] text-stone-500">Cərimə qeydi yoxdur</p>
          ) : (
            <div className="space-y-2">
              {fines.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded-xl2 bg-surface ring-1 ring-stone-700 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-stone-100">
                      {f.amount} ₼
                    </p>
                    {f.description && (
                      <p className="text-[12px] text-stone-500">{f.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleFine(f)}
                      className={`h-7 px-2.5 rounded-full text-[11.5px] font-medium flex items-center gap-1 ${
                        f.paid
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {f.paid ? <Check size={11} /> : <AlertOctagon size={11} />}
                      {f.paid ? "Ödənilib" : "Ödənilməyib"}
                    </button>
                    <button
                      onClick={() => handleDeleteFine(f.id)}
                      aria-label="Sil"
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-stone-500 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title={`İcarə tarixçəsi (${rentals.length})`}>
          {rentals.length === 0 ? (
            <p className="text-[13px] text-stone-500">Hələ icarə olmayıb</p>
          ) : (
            <div className="space-y-2">
              {rentals.map((r) => (
                <Link
                  key={r.id}
                  to={`/akt/${companyId}/${r.id}`}
                  className="flex items-center justify-between rounded-xl2 bg-surface ring-1 ring-stone-700 px-4 py-3 text-stone-50"
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
    <div className="rounded-xl2 bg-surface ring-1 ring-stone-700 p-3.5 text-center text-stone-50">
      <p className="text-[17px] font-semibold text-stone-50">{value}</p>
      <p className="text-[11px] text-stone-500 mt-0.5">{label}</p>
    </div>
  );
}

function CarEditForm({ companyId, car, onDone }) {
  const [year, setYear] = useState(car.year ?? "");
  const [dailyPrice, setDailyPrice] = useState(car.dailyPrice ?? "");
  const [weeklyDiscountPercent, setWeeklyDiscountPercent] = useState(
    car.weeklyDiscountPercent ?? ""
  );
  const [monthlyDiscountPercent, setMonthlyDiscountPercent] = useState(
    car.monthlyDiscountPercent ?? ""
  );
  const [ownerName, setOwnerName] = useState(car.ownerName || "");
  const [ownerPhone, setOwnerPhone] = useState(car.ownerPhone || "");
  const [ownerDailyRate, setOwnerDailyRate] = useState(car.ownerDailyRate ?? "");
  const [nextServiceKm, setNextServiceKm] = useState(car.nextServiceKm ?? "");
  const [nextServiceDate, setNextServiceDate] = useState(car.nextServiceDate || "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCar(companyId, car.id, {
        year: year ? Number(year) : null,
        dailyPrice: Number(dailyPrice) > 0 ? Number(dailyPrice) : car.dailyPrice,
        weeklyDiscountPercent: weeklyDiscountPercent ? Number(weeklyDiscountPercent) : null,
        monthlyDiscountPercent: monthlyDiscountPercent ? Number(monthlyDiscountPercent) : null,
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        ownerDailyRate: ownerDailyRate ? Number(ownerDailyRate) : null,
        nextServiceKm: nextServiceKm ? Number(nextServiceKm) : null,
        nextServiceDate: nextServiceDate || null,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-xl2 bg-surface ring-1 ring-stone-700 p-4 space-y-3"
    >
      <div className="flex gap-3">
        <input
          value={year}
          onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
          type="text"
          inputMode="numeric"
          placeholder="İl"
          className="h-11 w-20 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
        />
        <input
          value={dailyPrice}
          onChange={(e) => setDailyPrice(e.target.value)}
          type="number"
          min="0"
          placeholder="Müştəriyə günlük (₼)"
          className="h-11 flex-1 min-w-0 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
        />
      </div>
      <div className="flex gap-3">
        <input
          value={weeklyDiscountPercent}
          onChange={(e) => setWeeklyDiscountPercent(e.target.value.replace(/\D/g, "").slice(0, 2))}
          type="text"
          inputMode="numeric"
          placeholder="7+ gün endirim %"
          className="h-11 flex-1 min-w-0 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
        />
        <input
          value={monthlyDiscountPercent}
          onChange={(e) => setMonthlyDiscountPercent(e.target.value.replace(/\D/g, "").slice(0, 2))}
          type="text"
          inputMode="numeric"
          placeholder="30+ gün endirim %"
          className="h-11 flex-1 min-w-0 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
        />
      </div>

      <div className="border-t border-stone-700 pt-3">
        <p className="text-[12px] text-stone-500 mb-2">Servis xatırlatması (istəyə görə)</p>
        <div className="flex gap-3">
          <input
            value={nextServiceKm}
            onChange={(e) => setNextServiceKm(e.target.value.replace(/\D/g, ""))}
            type="text"
            inputMode="numeric"
            placeholder="Növbəti servis km-i"
            className="h-11 flex-1 min-w-0 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
          />
          <input
            value={nextServiceDate}
            onChange={(e) => setNextServiceDate(e.target.value)}
            type="date"
            className="h-11 flex-1 min-w-0 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
          />
        </div>
      </div>

      <div className="border-t border-stone-700 pt-3">
        <p className="text-[12px] text-stone-500 mb-2">Maşın sahibi</p>
        <div className="flex gap-3 mb-3">
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Sahibin adı"
            className="h-11 flex-1 min-w-0 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
          />
          <input
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            placeholder="Sahibin telefonu"
            className="h-11 flex-1 min-w-0 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
          />
        </div>
        <input
          value={ownerDailyRate}
          onChange={(e) => setOwnerDailyRate(e.target.value)}
          type="number"
          min="0"
          placeholder="Sahibə günlük ödəniləcək məbləğ (₼)"
          className="h-11 w-full rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full h-11 rounded-lg bg-gold text-ink text-[13.5px] font-semibold disabled:opacity-40"
      >
        {saving ? "..." : "Yadda saxla"}
      </button>
    </form>
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
