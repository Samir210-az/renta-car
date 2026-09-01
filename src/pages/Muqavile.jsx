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
          AVTOMOBİL İCARƏSİ MÜQAVİLƏSİ
        </h1>
        <p className="text-center text-stone-400 text-[12px] mb-1">
          № {contractNo} · {fmtDate(rental.createdAt)}
        </p>
        <p className="text-center text-stone-400 text-[10.5px] mb-6">
          Azərbaycan Respublikası Mülki Məcəlləsinin 743-cü maddəsinə əsasən
        </p>

        <p className="mb-4">
          Bu Müqavilə bir tərəfdən (bundan sonra — "<b>İcarəyə verən</b>"){" "}
          <b>{company?.name}</b> (əlaqə telefonu: +{company?.phone}) və digər
          tərəfdən (bundan sonra — "<b>İcarəçi</b>"){" "}
          <b>{rental.customerName}</b> (əlaqə telefonu: {rental.customerPhone}
          {rental.licenseNumber
            ? `, sürücülük vəsiqəsi № ${rental.licenseNumber}`
            : ""}
          ) arasında, tərəflər bundan sonra birlikdə "Tərəflər", ayrı-ayrılıqda
          isə "Tərəf" adlandırılmaqla, aşağıdakı şərtlərlə bağlanmışdır.
        </p>

        <Section title="1. Müqavilənin predmeti">
          <p>
            1.1. İcarəyə verən aşağıda göstərilən avtomobili (bundan sonra —
            "Əmlak") müvəqqəti istifadəyə (icarəyə) verməyi, İcarəçi isə onu
            qəbul edib icarə haqqını ödəməyi və müddəti bitdikdə geri
            qaytarmağı öhdəsinə götürür.
          </p>
          <div className="mt-2 space-y-1">
            <Row label="Marka/Model" value={car?.name} />
            <Row label="İl" value={car?.year || "—"} />
            <Row label="Dövlət qeydiyyat nişanı" value={car?.plate} />
          </div>
          <p className="mt-2">
            1.2. Əmlak İcarəçiyə Tərəflərin birgə imzaladığı Təhvil-Təslim
            Aktı əsasında, orada qeyd olunan texniki vəziyyətdə təhvil verilir
            və həmin vəziyyətdə (adi aşınma nəzərə alınmaqla) geri qaytarılır.
          </p>
        </Section>

        <Section title="2. Müqavilənin müddəti və icarə haqqı">
          <div className="space-y-1">
            <Row label="Başlanğıc tarixi" value={rental.startDate} />
            <Row label="Bitmə tarixi" value={rental.endDate} />
            <Row label="Günlük icarə haqqı" value={`${rental.dailyPrice} ₼`} />
            <Row label="Ümumi icarə haqqı" value={`${rental.totalPrice} ₼`} />
            {rental.depositAmount > 0 && (
              <Row label="Depozit (girov)" value={`${rental.depositAmount} ₼`} />
            )}
          </div>
          <p className="mt-2">
            2.1. Tərəflərdən hər hansı biri Müqavilənin müddətini uzatmaq
            istədikdə, bu barədə digər Tərəfi əvvəlcədən məlumatlandırır və
            uzatma yeni razılaşma əsasında rəsmiləşdirilir.
          </p>
        </Section>

        <Section title="3. Depozit">
          <p>
            3.1. Depozit Əmlakın vaxtında və müqavilə şərtlərinə uyğun
            qaytarılmasının təminatı kimi götürülür.
          </p>
          <p>
            3.2. Əmlak heç bir qeydsiz-şərtsiz qaytarıldıqda depozit tam
            məbləğdə İcarəçiyə geri qaytarılır. Zədə, əskiklik və ya
            gecikdirmə aşkar edildikdə, müvafiq məbləğ depozitdən tutulur,
            qalan hissə İcarəçiyə qaytarılır.
          </p>
        </Section>

        <Section title="4. İcarəyə verənin hüquq və vəzifələri">
          <ol className="list-decimal list-inside space-y-1">
            <li>Əmlakı texniki cəhətdən saz, təhlükəsiz vəziyyətdə, lazımi sənədlərlə birlikdə təhvil verir.</li>
            <li>Əmlakın icarə müddətindən əvvəl mövcud olan qüsurları barədə İcarəçini məlumatlandırır.</li>
            <li>Müqavilə şərtləri pozulmadıqda Əmlaka icarə müddətində əsassız müdaxilə etmir.</li>
            <li>Depozitin qaytarılmasını 3-cü bənddə göstərilən qaydada həyata keçirir.</li>
          </ol>
        </Section>

        <Section title="5. İcarəçinin hüquq və vəzifələri">
          <ol className="list-decimal list-inside space-y-1">
            <li>Əmlakı yalnız qanuni sürücülük hüququ olan şəxs kimi, müqavilə məqsədinə uyğun istifadə edir.</li>
            <li>Əmlakı Müqavilədə göstərilən müddətdə, təhvil aldığı vəziyyətdə (adi aşınma istisna olmaqla) qaytarır.</li>
            <li>İcarəyə verənin əvvəlcədən yazılı razılığı olmadan Əmlakı üçüncü şəxsə təkrar icarəyə vermir və ya idarəetməsini etibar etmir.</li>
            <li>İcarə müddətində baş verən yol-nəqliyyat hadisəsi, cərimə və digər hüquqi hadisələr barədə İcarəyə verəni dərhal məlumatlandırır.</li>
            <li>Yanacaq xərclərini özü qarşılayır və Əmlakı təhvil aldığı yanacaq səviyyəsində qaytarır.</li>
            <li>İcarə haqqını və (tələb olunduqda) depozitini vaxtında ödəyir.</li>
          </ol>
        </Section>

        <Section title="6. Ödəniş qaydaları">
          <p>
            6.1. İcarə haqqı Tərəflərin razılaşdığı qaydada ödənilir.
          </p>
          <p>
            6.2. Əmlakın gecikdirilərək qaytarılması halında hər gecikən gün
            üçün gündəlik icarə haqqının 1.5 (bir tam yarım) misli məbləğində
            əlavə ödəniş tətbiq olunur.
          </p>
        </Section>

        <Section title="7. Tərəflərin məsuliyyəti">
          <p>
            7.1. Təhvil-Təslim Aktında qeyd olunmayan zədə və ya nasazlığa
            görə məsuliyyət İcarəçinin üzərindədir; onun dəyəri depozitdən
            tutulur, depozit kifayət etmədikdə İcarəçi qalan məbləği ayrıca
            ödəyir.
          </p>
          <p>
            7.2. Tərəflərdən biri Müqavilə üzrə öhdəliyini yerinə
            yetirmədikdə və ya lazımi qaydada yerinə yetirmədikdə, digər
            Tərəf qarşısında Azərbaycan Respublikasının qüvvədə olan
            qanunvericiliyinə uyğun məsuliyyət daşıyır.
          </p>
        </Section>

        <Section title="8. Fors-major">
          <p>
            8.1. Tərəflər öz iradələrindən asılı olmayan hallar (təbii
            fəlakət, hərbi əməliyyatlar, dövlət orqanlarının qərarları və
            digər qarşısıalınmaz hallar) nəticəsində öhdəliklərini yerinə
            yetirə bilmədikdə, bu hallar davam etdiyi müddətdə məsuliyyətdən
            azad olunurlar.
          </p>
        </Section>

        <Section title="9. Konfidensiallıq">
          <p>
            9.1. Tərəflər bu Müqavilənin icrası ilə bağlı bir-birinə açdıqları
            şəxsi məlumatların məxfiliyini qoruyur və onları üçüncü şəxslərə
            ötürmür (qanunvericiliklə tələb olunan hallar istisna olmaqla).
          </p>
        </Section>

        <Section title="10. Müqavilənin xitamı">
          <p>
            10.1. Müqavilə müddətin bitməsi, Tərəflərin qarşılıqlı
            razılaşması və ya qanunvericilikdə nəzərdə tutulan digər hallarda
            xitam olunur.
          </p>
          <p>
            10.2. İcarəçi Əmlakı müqavilə şərtlərini kobud şəkildə pozaraq
            istifadə etdikdə, İcarəyə verən Müqaviləyə birtərəfli qaydada
            xitam vermək hüququna malikdir.
          </p>
        </Section>

        <Section title="11. Mübahisələrin həlli">
          <p>
            11.1. Tərəflər arasında yaranan mübahisələr ilk növbədə
            danışıqlar yolu ilə həll edilir. Razılıq əldə olunmadıqda,
            mübahisə Azərbaycan Respublikasının qüvvədə olan
            qanunvericiliyinə uyğun məhkəmə qaydasında həll edilir.
          </p>
        </Section>

        <p className="text-[10.5px] text-stone-400 italic mt-4">
          Bu Müqavilə Azərbaycan Respublikası Mülki Məcəlləsinin icarə
          münasibətlərini tənzimləyən müddəalarına əsaslanan ümumi çərçivə
          mətnidir və konkret hüquqi məsləhət əvəz etmir. Şirkət öz xüsusi
          biznes şərtlərini əlavə etmək üçün hüquqşünasla məsləhətləşməlidir.
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
      <div className="space-y-1.5">{children}</div>
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
