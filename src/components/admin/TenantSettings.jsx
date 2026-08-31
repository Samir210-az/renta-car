import { useState } from "react";
import { updateCompanyProfile } from "../../lib/data";

export default function TenantSettings({ companyId, profile }) {
  const [name, setName] = useState(profile.name || "");
  const [loginPin, setLoginPin] = useState(profile.pin || "");
  const [adminPin, setAdminPin] = useState(profile.tenantAdminPin || "");
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    await updateCompanyProfile(companyId, {
      name: name.trim(),
      pin: loginPin.trim(),
      tenantAdminPin: adminPin.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-xl2 bg-white ring-1 ring-slate-100 shadow-soft p-4 space-y-4"
    >
      <Field label="Şirkət adı">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-11 rounded-lg bg-paper ring-1 ring-slate-200 px-3 text-[13.5px]"
        />
      </Field>

      <Field label="Giriş PIN-i (telefon + PIN ilə daxil olmaq üçün)">
        <input
          value={loginPin}
          onChange={(e) =>
            setLoginPin(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          inputMode="numeric"
          className="w-full h-11 rounded-lg bg-paper ring-1 ring-slate-200 px-3 text-[13.5px] tracking-widest"
        />
      </Field>

      <Field label="Admin PIN (bu panelə giriş)">
        <input
          value={adminPin}
          onChange={(e) =>
            setAdminPin(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          inputMode="numeric"
          className="w-full h-11 rounded-lg bg-paper ring-1 ring-slate-200 px-3 text-[13.5px] tracking-widest"
        />
      </Field>

      <button
        type="submit"
        className="w-full h-11 rounded-lg bg-ink text-white font-medium text-[13.5px]"
      >
        {saved ? "Yadda saxlanıldı ✓" : "Yadda saxla"}
      </button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-slate-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
