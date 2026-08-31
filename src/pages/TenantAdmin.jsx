import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { getCompanyId, logoutCompany } from "../lib/session";
import { listenCars, listenRentals, listenCompanyProfile } from "../lib/data";
import Footer from "../components/Footer";
import AdminCars from "../components/admin/AdminCars";
import AdminRentals from "../components/admin/AdminRentals";
import AdminReport from "../components/admin/AdminReport";
import TenantSettings from "../components/admin/TenantSettings";

const TABS = [
  { id: "cars", label: "Maşınlar" },
  { id: "rentals", label: "İcarələr" },
  { id: "report", label: "Hesabat" },
  { id: "settings", label: "Tənzimləmələr" },
];

export default function TenantAdmin() {
  const navigate = useNavigate();
  const companyId = getCompanyId();
  const [tab, setTab] = useState("cars");
  const [cars, setCars] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsubCars = listenCars(companyId, setCars);
    const unsubRentals = listenRentals(companyId, setRentals);
    const unsubProfile = listenCompanyProfile(companyId, setProfile);
    return () => {
      unsubCars();
      unsubRentals();
      unsubProfile();
    };
  }, [companyId]);

  const carsById = useMemo(() => {
    const map = {};
    for (const c of cars) map[c.id] = c;
    return map;
  }, [cars]);

  function handleLogout() {
    logoutCompany();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="sticky top-0 z-20 bg-ink">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-[13px] text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Tətbiqə qayıt
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[13px] text-slate-300 hover:text-white transition-colors"
          >
            <LogOut size={15} />
            Çıxış
          </button>
        </div>
        <div className="max-w-2xl mx-auto px-5 pb-3">
          <h1 className="text-white font-semibold text-[17px]">
            {profile?.name || "Admin Panel"}
          </h1>
        </div>
        <div className="max-w-2xl mx-auto px-5 flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3.5 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-white text-white"
                  : "border-transparent text-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-5">
        {tab === "cars" && <AdminCars companyId={companyId} cars={cars} />}
        {tab === "rentals" && (
          <AdminRentals
            companyId={companyId}
            rentals={rentals}
            carsById={carsById}
          />
        )}
        {tab === "report" && <AdminReport cars={cars} rentals={rentals} />}
        {tab === "settings" && profile && (
          <TenantSettings companyId={companyId} profile={profile} />
        )}
      </main>

      <Footer />
    </div>
  );
}
