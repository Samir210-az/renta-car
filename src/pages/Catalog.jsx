import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Phone, Images } from "lucide-react";
import { getPublicCompany, listenPublicCars, submitCarRequest } from "../lib/data";
import Lightbox from "../components/Lightbox";
import Footer from "../components/Footer";

export default function Catalog() {
  const { companyId } = useParams();
  const [company, setCompany] = useState(undefined);
  const [cars, setCars] = useState(null);

  useEffect(() => {
    getPublicCompany(companyId).then((p) => setCompany(p || null));
    const unsub = listenPublicCars(companyId, setCars);
    return () => unsub();
  }, [companyId]);

  if (company === undefined || cars === null) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-stone-700 border-t-gold animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6 text-center">
        <p className="text-[14px] text-stone-400">Bu link mövcud deyil</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="bg-ink px-6 py-8 text-center">
        {company.logo ? (
          <img
            src={company.logo}
            alt={company.name}
            className="h-16 w-16 rounded-2xl object-cover mx-auto mb-3 ring-1 ring-white/10"
          />
        ) : (
          <img
            src="/logo-icon.png"
            alt=""
            className="h-14 w-14 rounded-2xl bg-white/10 p-2 mx-auto mb-3"
          />
        )}
        <h1 className="text-white font-semibold text-[18px]">{company.name}</h1>
        <p className="text-stone-400 text-[13px] mt-1">Mövcud maşınlar</p>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-5 py-5">
        {cars.length === 0 ? (
          <p className="text-center text-[13.5px] text-stone-400 mt-12">
            Hazırda boş maşın yoxdur
          </p>
        ) : (
          <div className="space-y-3">
            {cars.map((car) => (
              <CarListing key={car.id} companyId={companyId} car={car} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function CarListing({ companyId, car }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const photos = car.photos || [];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || sending) return;
    setSending(true);
    try {
      await submitCarRequest(companyId, {
        carId: car.id,
        customerName: name,
        customerPhone: phone,
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft overflow-hidden">
      {photos.length > 0 && (
        <button
          onClick={() => setLightboxOpen(true)}
          className="relative w-full h-40 block"
        >
          <img src={photos[0]} alt={car.name} className="w-full h-full object-cover" />
          {photos.length > 1 && (
            <span className="absolute bottom-2 right-2 h-6 px-2 rounded-full bg-black/60 text-white text-[11px] font-medium flex items-center gap-1">
              <Images size={12} />
              {photos.length}
            </span>
          )}
        </button>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-stone-50 text-[15px]">{car.name}</p>
            <p className="text-[12.5px] text-stone-500 mt-0.5">
              {car.plate}
              {car.year ? ` · ${car.year}` : ""}
            </p>
          </div>
          <p className="font-semibold text-stone-50 text-[16px] shrink-0">
            {car.dailyPrice} ₼<span className="text-[12px] text-stone-400 font-normal">/gün</span>
          </p>
        </div>

        {sent ? (
          <p className="flex items-center gap-1.5 text-[12.5px] text-emerald-600 font-medium mt-3">
            <CheckCircle2 size={15} />
            Sorğunuz göndərildi, tezliklə əlaqə saxlanılacaq
          </p>
        ) : open ? (
          <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-stone-700 space-y-2.5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınız"
              className="w-full h-10 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telefon nömrəniz"
              className="w-full h-10 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] text-stone-50"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full h-10 rounded-lg bg-gold text-ink text-[13px] font-semibold disabled:opacity-40"
            >
              {sending ? "Göndərilir..." : "Sorğunu göndər"}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="w-full h-10 rounded-lg bg-gold text-ink text-[13px] font-semibold mt-3 flex items-center justify-center gap-1.5"
          >
            <Phone size={14} />
            Bu maşını istəyirəm
          </button>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox photos={photos} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}
