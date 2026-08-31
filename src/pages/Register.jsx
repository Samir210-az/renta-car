import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ImagePlus, X } from "lucide-react";
import { registerCompany } from "../lib/data";
import { compressImage } from "../lib/image";
import Footer from "../components/Footer";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const isValid =
    name.trim().length > 1 && phone.trim().length >= 7 && pin.length === 4;

  async function handleLogoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoBusy(true);
    try {
      const dataUrl = await compressImage(file, { maxWidth: 320, quality: 0.7 });
      setLogo(dataUrl);
    } finally {
      setLogoBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || saving) return;
    setSaving(true);
    setError("");
    try {
      await registerCompany({ name, phone, pin, logo });
      setDone(true);
    } catch (err) {
      setError(err.message || "Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <CheckCircle2 size={40} className="text-emerald-500 mb-3" />
          <p className="font-semibold text-stone-50 text-[16px]">
            Qeydiyyat göndərildi
          </p>
          <p className="text-[13.5px] text-stone-500 mt-2 max-w-[260px]">
            Hesabınız təsdiqləndikdən sonra bu telefon nömrəsi və PIN kodu ilə
            daxil ola bilərsiniz.
          </p>
          <Link
            to="/login"
            className="mt-6 h-11 px-6 rounded-xl bg-gold text-ink text-[14px] font-semibold flex items-center"
          >
            Giriş ekranına qayıt
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="max-w-sm w-full mx-auto px-6 pt-8">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 text-[13px] text-stone-500 hover:text-stone-50 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Geri
        </button>

        <h1 className="text-lg font-semibold text-stone-50 mb-1 flex items-center gap-2">
          <img src="/logo-icon.png" alt="" className="h-6 w-6" />
          Qeydiyyat
        </h1>
        <p className="text-[13px] text-stone-400 mb-6">
          Şirkətinizi qeydə alın, təsdiqdən sonra daxil ola bilərsiniz
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Şirkət loqosu (istəyə görə)">
            {logo ? (
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover ring-1 ring-stone-700"
                />
                <button
                  type="button"
                  onClick={() => setLogo(null)}
                  className="h-8 px-3 rounded-lg ring-1 ring-stone-700 text-[12px] text-stone-500 flex items-center gap-1.5"
                >
                  <X size={13} />
                  Sil
                </button>
              </div>
            ) : (
              <label className="h-20 rounded-xl bg-surface ring-1 ring-dashed ring-stone-600 flex flex-col items-center justify-center gap-1 text-stone-400 cursor-pointer">
                <ImagePlus size={18} />
                <span className="text-[12px]">
                  {logoBusy ? "Yüklənir..." : "Loqo seç"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoSelect}
                />
              </label>
            )}
          </Field>

          <Field label="Şirkət adı">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Məs. Ram Rent a Car"
              className="w-full h-12 rounded-xl bg-surface ring-1 ring-stone-700 px-3.5 text-[14px] text-stone-50 placeholder:text-stone-400"
            />
          </Field>

          <Field label="Telefon nömrəsi">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+994 XX XXX XX XX"
              className="w-full h-12 rounded-xl bg-surface ring-1 ring-stone-700 px-3.5 text-[14px] text-stone-50 placeholder:text-stone-400"
            />
          </Field>

          <Field label="4 rəqəmli PIN seçin (giriş üçün istifadə edəcəksiniz)">
            <input
              type="tel"
              inputMode="numeric"
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="••••"
              className="w-full h-12 rounded-xl bg-surface ring-1 ring-stone-700 px-3.5 text-[16px] tracking-[0.4em] text-stone-50 placeholder:text-stone-400"
            />
          </Field>

          {error && (
            <p className="text-[12.5px] text-rose-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={!isValid || saving}
            className="w-full h-12 rounded-xl bg-gold text-ink font-semibold text-[14px] disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            {saving ? "Göndərilir..." : "Qeydiyyatdan keç"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-stone-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
