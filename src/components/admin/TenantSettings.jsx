import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { updateCompanyProfile } from "../../lib/data";
import { compressImage } from "../../lib/image";

export default function TenantSettings({ companyId, profile }) {
  const [name, setName] = useState(profile.name || "");
  const [loginPin, setLoginPin] = useState(profile.pin || "");
  const [adminPin, setAdminPin] = useState(profile.tenantAdminPin || "");
  const [logo, setLogo] = useState(profile.logo || null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [saved, setSaved] = useState(false);

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

  async function handleSave(e) {
    e.preventDefault();
    await updateCompanyProfile(companyId, {
      name: name.trim(),
      pin: loginPin.trim(),
      tenantAdminPin: adminPin.trim(),
      logo: logo || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4 space-y-4"
    >
      <Field label="Şirkət loqosu">
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
          <label className="h-16 rounded-xl bg-paper ring-1 ring-dashed ring-stone-600 flex items-center justify-center gap-2 text-stone-400 cursor-pointer">
            <ImagePlus size={16} />
            <span className="text-[12.5px]">
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
          className="w-full h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px]"
        />
      </Field>

      <Field label="Giriş PIN-i (telefon + PIN ilə daxil olmaq üçün)">
        <input
          value={loginPin}
          onChange={(e) =>
            setLoginPin(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          inputMode="numeric"
          className="w-full h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] tracking-widest"
        />
      </Field>

      <Field label="Admin PIN (bu panelə giriş)">
        <input
          value={adminPin}
          onChange={(e) =>
            setAdminPin(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          inputMode="numeric"
          className="w-full h-11 rounded-lg bg-paper ring-1 ring-stone-700 px-3 text-[13.5px] tracking-widest"
        />
      </Field>

      <button
        type="submit"
        className="w-full h-11 rounded-lg bg-gold text-ink font-semibold text-[13.5px]"
      >
        {saved ? "Yadda saxlanıldı ✓" : "Yadda saxla"}
      </button>
    </form>
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
