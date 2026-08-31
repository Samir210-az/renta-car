import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Building2 } from "lucide-react";
import { listenCompanies, activateCompany, deactivateCompany } from "../lib/data";
import { logoutPlatform } from "../lib/session";
import { PLAN_OPTIONS, planLabel } from "../lib/plans";
import Footer from "../components/Footer";

function statusOf(company) {
  if (company.status === "pending") return "pending";
  if (company.status === "deactivated") return "deactivated";
  if (company.status === "active" && company.expiresAt < Date.now())
    return "expired";
  return "active";
}

const GROUPS = [
  { key: "pending", label: "Gözləyən qeydiyyatlar" },
  { key: "active", label: "Aktiv şirkətlər" },
  { key: "expired", label: "Müddəti bitmiş" },
  { key: "deactivated", label: "Deaktiv edilmiş" },
];

export default function PlatformAdmin() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const unsub = listenCompanies(setCompanies);
    return () => unsub();
  }, []);

  const grouped = useMemo(() => {
    const map = { pending: [], active: [], expired: [], deactivated: [] };
    for (const c of companies || []) {
      map[statusOf(c)].push(c);
    }
    return map;
  }, [companies]);

  async function handleActivate(companyId, planId) {
    setBusyId(companyId);
    try {
      await activateCompany(companyId, planId);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeactivate(companyId) {
    if (!confirm("Bu şirkət deaktiv edilsin?")) return;
    setBusyId(companyId);
    try {
      await deactivateCompany(companyId);
    } finally {
      setBusyId(null);
    }
  }

  function handleExit() {
    logoutPlatform();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="sticky top-0 z-20 bg-ink">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1.5 text-[13px] text-stone-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Giriş ekranı
          </button>
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 text-[13px] text-stone-300 hover:text-white transition-colors"
          >
            <LogOut size={15} />
            Çıxış
          </button>
        </div>
        <div className="max-w-2xl mx-auto px-5 pb-4 flex items-center gap-2.5">
          <img src="/logo-icon.png" alt="" className="h-8 w-8 rounded-lg bg-white/10 p-1.5" />
          <div>
            <h1 className="text-white font-semibold text-[17px]">
              Platform Admin
            </h1>
            <p className="text-[12.5px] text-stone-400 mt-0.5">
              Bütün rent-a-car şirkətləri
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-5">
        {companies === null ? (
          <p className="text-[13px] text-stone-400 text-center py-10">
            Yüklənir...
          </p>
        ) : companies.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-7">
            {GROUPS.map(
              (g) =>
                grouped[g.key].length > 0 && (
                  <section key={g.key}>
                    <p className="text-[12.5px] font-semibold text-stone-400 mb-2.5">
                      {g.label} ({grouped[g.key].length})
                    </p>
                    <div className="space-y-2.5">
                      {grouped[g.key].map((c) => (
                        <CompanyCard
                          key={c.id}
                          company={c}
                          status={g.key}
                          busy={busyId === c.id}
                          onActivate={handleActivate}
                          onDeactivate={handleDeactivate}
                        />
                      ))}
                    </div>
                  </section>
                )
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function CompanyCard({ company, status, busy, onActivate, onDeactivate }) {
  const daysLeft =
    status === "active"
      ? Math.max(0, Math.ceil((company.expiresAt - Date.now()) / 86400000))
      : null;

  return (
    <div className="rounded-xl2 bg-surface ring-1 ring-white/5 shadow-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-stone-50 text-[14px] truncate">
            {company.name}
          </p>
          <p className="text-[12.5px] text-stone-500 mt-0.5">
            {company.phone} · PIN {company.pin}
          </p>
          {status === "active" && (
            <p className="text-[12px] text-emerald-600 mt-1 font-medium">
              {planLabel(company.plan)} · {daysLeft} gün qaldı
            </p>
          )}
          {status === "expired" && (
            <p className="text-[12px] text-rose-600 mt-1 font-medium">
              {planLabel(company.plan)} müddəti bitib
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-stone-50">
        {PLAN_OPTIONS.map((p) => (
          <button
            key={p.id}
            disabled={busy}
            onClick={() => onActivate(company.id, p.id)}
            className="h-8 px-3 rounded-lg bg-paper ring-1 ring-stone-700 text-[12px] font-medium text-stone-300 hover:bg-stone-800 disabled:opacity-40 transition-colors"
          >
            {p.label}
          </button>
        ))}
        {(status === "active" || status === "expired") && (
          <button
            disabled={busy}
            onClick={() => onDeactivate(company.id)}
            className="h-8 px-3 rounded-lg text-[12px] font-medium text-rose-500 hover:bg-rose-500/10 disabled:opacity-40 transition-colors ml-auto"
          >
            Deaktiv et
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center mt-20">
      <div className="h-14 w-14 rounded-2xl bg-stone-800 flex items-center justify-center mb-4">
        <Building2 size={24} className="text-stone-400" />
      </div>
      <p className="text-[14px] font-medium text-stone-50">Hələ qeydiyyat yoxdur</p>
    </div>
  );
}
