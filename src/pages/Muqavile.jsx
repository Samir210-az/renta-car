import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { getRentalDetail } from "../lib/data";

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("az-AZ");
}

export default function Muqavile() {
  const { companyId, rentalId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(undefined);

  useEffect(() => {
    getRentalDetail(companyId, rentalId).then(setData);
  }, [companyId, rentalId]);

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
        Sənəd tapılmadı
      </div>
    );
  }

  const { rental, car, company } = data;
  const contractNo = rentalId.slice(-6).toUpperCase();

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-lg mx-auto px-5 py-5 print:hidden flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] text-stone-500"
        >
          <ArrowLeft size={16} />
          Geri
        </button>
        <button
          onClick={() => window.print()}
          className="h-9 px-3.5 rounded-full bg-gold text-ink text-[12.5px] font-semibold flex items-center gap-1.5"
        >
          <Printer size={14} />
          Çap et
        </button>
      </div>

      <div className="max-w-lg mx-auto bg-white px-6 py-8 print:px-0 print:py-0 text-[12.5px] text-stone-800 leading-relaxed">
        <h1 className="text-[17px] font-semibold text-center text-stone-900 mb-1">
          AVTOMOBİL İCARƏ MÜQAVİLƏSİ
        </h1>
        <p className="text-center text-stone-400 text-[12px] mb-6">
          № {contractNo} · {fmtDate(rental.createdAt)}
        </p>

        <p className="mb-4">
          Bu müqavilə bir tərəfdən aşağıda "<b>İcarəyə verən</b>" adlanan{" "}
          <b>{company?.name}</b> (əlaqə: +{company?.phone}) və digər tərəfdən
          "<b>İcarəçi</b>" adlanan <b>{rental.customerName}</b> (əlaqə:{" "}
          {rental.customerPhone}
          {rental.licenseNumber ? `, sürücülük vəsiqəsi № ${rental.licenseNumber}` : ""})
          arasında aşağıdakı şərtlərlə bağlanmışdır.
        </p>

        <Section title="1. Müqavilənin predmeti">
          <p>
            İcarəyə verən aşağıda göstərilən avtomobili müvəqqəti istifadəyə
            (icarəyə) verir, İcarəçi isə onu qəbul edib, müqavilədə göstərilən
            şərtlərlə istifadə etməyi və vaxtında qaytarmağı öhdəsinə götürür.
          </p>
          <div className="mt-2 space-y-1">
            <Row label="Marka/Model" value={car?.name} />
            <Row label="İl" value={car?.year || "—"} />
            <Row label="Dövlət qeydiyyat nişanı" value={car?.plate} />
          </div>
        </Section>

        <Section title="2. İcarə müddəti və haqqı">
          <div className="space-y-1">
            <Row label="Başlanğıc tarixi" value={rental.startDate} />
            <Row label="Bitmə tarixi" value={rental.endDate} />
            <Row label="Günlük icarə haqqı" value={`${rental.dailyPrice} ₼`} />
            <Row label="Ümumi məbləğ" value={`${rental.totalPrice} ₼`} />
            {rental.depositAmount > 0 && (
              <Row label="Depozit (girov)" value={`${rental.depositAmount} ₼`} />
            )}
          </div>
        </Section>

        <Section title="3. İcarəyə verənin öhdəlikləri">
          <ol className="list-decimal list-inside space-y-1">
            <li>Avtomobili texniki cəhətdən saz, təhlükəsiz vəziyyətdə təhvil verir.</li>
            <li>Avtomobillə bağlı sənədləri (qeydiyyat vəsiqəsi, sığorta olduğu halda) İcarəçiyə təqdim edir.</li>
            <li>Depozitin qaytarılmasını, əgər əsas yoxdursa, icarə bitdikdən dərhal sonra həyata keçirir.</li>
          </ol>
        </Section>

        <Section title="4. İcarəçinin öhdəlikləri">
          <ol className="list-decimal list-inside space-y-1">
            <li>Avtomobili yalnız qanuni sürücülük hüququ olan şəxs kimi idarə edə bilər.</li>
            <li>Avtomobili müqavilədə göstərilən müddətdə, təhvil aldığı vəziyyətdə (adi aşınma istisna olmaqla) qaytarır.</li>
            <li>İcarə müddətində baş verən yol-nəqliyyat hadisələri, cərimələr və digər hüquq pozuntuları barədə dərhal İcarəyə verəni məlumatlandırır.</li>
            <li>Avtomobili üçüncü şəxslərə təkrar icarəyə vermir və ya idarəetməsini etibar etmir (əvvəlcədən yazılı razılıq olmadan).</li>
            <li>Yanacaq xərclərini özü qarşılayır və avtomobili təhvil aldığı yanacaq səviyyəsində qaytarır.</li>
          </ol>
        </Section>

        <Section title="5. Ödəniş qaydaları">
          <p>
            İcarə haqqı bu müqavilənin bağlanması zamanı və ya tərəflərin
            razılaşdığı qaydada ödənilir. Gecikdirilmiş qaytarma halında hər
            gecikən gün üçün gündəlik icarə haqqının 1.5 (bir tam yarım) misli
            məbləğində əlavə ödəniş tətbiq olunur.
          </p>
        </Section>

        <Section title="6. Məsuliyyət">
          <p>
            Təhvil-təslim aktında qeyd olunmayan zədə və ya nasazlıqlara görə
            məsuliyyət İcarəçinin üzərindədir və onların dəyəri depozitdən
            tutulur, depozit kifayət etmədikdə İcarəçi qalan məbləği ayrıca
            ödəyir. Tərəflər arasında yaranan mübahisələr qarşılıqlı
            danışıqlar yolu ilə, nəticə əldə olunmadıqda isə Azərbaycan
            Respublikasının qüvvədə olan qanunvericiliyinə uyğun həll edilir.
          </p>
        </Section>

        <p className="text-[10.5px] text-stone-400 italic mt-4">
          Bu müqavilə ümumi çərçivə mətnidir və hüquqi məsləhət deyil.
          Şirkət öz konkret biznes şərtlərini əlavə etmək üçün
          hüquqşünasla məsləhətləşməlidir.
        </p>

        <div className="grid grid-cols-2 gap-8 mt-12 pt-6">
          <div>
            <div className="border-b border-stone-300 h-10" />
            <p className="text-[11.5px] text-stone-400 mt-1.5">
              İcarəyə verən — {company?.name}
            </p>
          </div>
          <div>
            <div className="border-b border-stone-300 h-10" />
            <p className="text-[11.5px] text-stone-400 mt-1.5">
              İcarəçi — {rental.customerName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <p className="text-[12.5px] font-semibold text-stone-900 mb-1.5">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-stone-100 py-1">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-stone-900">{value}</span>
    </div>
  );
}
