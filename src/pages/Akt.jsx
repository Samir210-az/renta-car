import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { getRentalDetail } from "../lib/data";
import DamageDiagram, { DAMAGE_TYPES } from "../components/DamageDiagram";

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("az-AZ");
}

export default function Akt() {
  const { companyId, rentalId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(undefined);

  useEffect(() => {
    getRentalDetail(companyId, rentalId).then(setData);
  }, [companyId, rentalId]);

  if (data === undefined) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-[13px] text-slate-400">
        Sənəd tapılmadı
      </div>
    );
  }

  const { rental, car, company } = data;
  const pickup = rental.pickupCondition || {};
  const ret = rental.returnCondition || null;

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-lg mx-auto px-5 py-5 print:hidden flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] text-slate-500"
        >
          <ArrowLeft size={16} />
          Geri
        </button>
        <button
          onClick={() => window.print()}
          className="h-9 px-3.5 rounded-full bg-ink text-white text-[12.5px] font-medium flex items-center gap-1.5"
        >
          <Printer size={14} />
          Çap et
        </button>
      </div>

      <div className="max-w-lg mx-auto bg-white px-6 py-8 print:px-0 print:py-0 text-[13px] text-ink">
        <h1 className="text-[17px] font-semibold text-center mb-1">
          MAŞIN TƏHVİL-TƏSLİM AKTI
        </h1>
        <p className="text-center text-slate-400 text-[12px] mb-6">
          {company?.name}
        </p>

        <Section title="Şirkət">
          <Row label="Ad" value={company?.name} />
          <Row label="Telefon" value={`+${company?.phone}`} />
        </Section>

        <Section title="Müştəri">
          <Row label="Ad" value={rental.customerName} />
          <Row label="Telefon" value={rental.customerPhone} />
        </Section>

        <Section title="Maşın">
          <Row label="Marka/Model" value={car?.name} />
          <Row label="Dövlət nömrəsi" value={car?.plate} />
          <Row label="Günlük qiymət" value={`${rental.dailyPrice} ₼`} />
        </Section>

        <Section title="İcarə müddəti">
          <Row label="Başlanğıc" value={rental.startDate} />
          <Row label="Bitmə" value={rental.endDate} />
          <Row label="Ümumi məbləğ" value={`${rental.totalPrice} ₼`} />
        </Section>

        <Section title="Təhvil zamanı vəziyyət">
          <Row label="Tarix" value={fmtDate(pickup.signedAt)} />
          <Row label="Km sayğacı" value={pickup.km ?? "—"} />
          <Row label="Yanacaq" value={pickup.fuel || "—"} />
          <Row label="Qeyd" value={pickup.notes || "Qeyd yoxdur"} />
          {pickup.damageMarkers?.length > 0 && (
            <div className="mt-2">
              <DamageDiagram value={pickup.damageMarkers} readOnly />
            </div>
          )}
        </Section>

        <Section title="Qaytarma zamanı vəziyyət">
          {ret ? (
            <>
              <Row label="Tarix" value={fmtDate(ret.signedAt)} />
              <Row label="Km sayğacı" value={ret.km ?? "—"} />
              <Row label="Yanacaq" value={ret.fuel || "—"} />
              <Row label="Qeyd" value={ret.notes || "Qeyd yoxdur"} />
              {ret.damageMarkers?.length > 0 && (
                <div className="mt-2">
                  <DamageDiagram value={ret.damageMarkers} readOnly />
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400">Maşın hələ qaytarılmayıb</p>
          )}
        </Section>

        {(pickup.damageMarkers?.length > 0 || ret?.damageMarkers?.length > 0) && (
          <div className="flex items-center gap-3 -mt-2 mb-5">
            {DAMAGE_TYPES.map((t) => (
              <span key={t.id} className="flex items-center gap-1 text-[11px] text-slate-500">
                <span
                  className="h-2 w-2 rounded-full inline-block"
                  style={{ background: t.color }}
                />
                {t.label}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 mt-12 pt-6">
          <div>
            <div className="border-b border-slate-300 h-10" />
            <p className="text-[11.5px] text-slate-400 mt-1.5">Şirkət imzası</p>
          </div>
          <div>
            <div className="border-b border-slate-300 h-10" />
            <p className="text-[11.5px] text-slate-400 mt-1.5">Müştəri imzası</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-slate-100 py-1">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
