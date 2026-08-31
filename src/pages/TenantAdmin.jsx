import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { getCompanyId, logoutCompany } from "../lib/session";
import { listenCars, listenRentals, listenCompanyProfile, listenRequests } from "../lib/data";
import Footer from "../components/Footer";
import AdminCars from "../components/admin/AdminCars";
import AdminRentals from "../components/admin/AdminRentals";
import AdminReport from "../components/admin/AdminReport";
import AdminRequests from "../components/admin/AdminRequests";
import TenantSettings from "../components/admin/TenantSettings";

const TABS = [
  { id: "requests", label: "Sorğular" },
  { id: "cars", label: "Maşınlar" },
  { id: "rentals", label: "İcarələr" },
  { id: "report", label: "Hesabat" },
  { id: "settings", label: "Tənzimləmələr" },
];

export default function TenantAdmin() {
  const navigate = useNavigate();
  const companyId = getCompanyId();
  const [tab, setTab] = useState("requests");
  const [cars, setCars] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsubCars = listenCars(companyId, setCars);
    const unsubRentals = listenRentals(companyId, setRentals);
    const unsubRequests = listenRequests(companyId, setRequests);
    const unsubProfile = listenCompanyProfile(companyId, setProfile);
    return () => {
      unsubCars();
      unsubRentals();
      unsubRequests();
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
        <div className="max-w-2xl mx-auto px-5 pb-3 flex items-center gap-2.5">
          {profile?.logo ? (
            <img
              src={profile.logo}
              alt=""
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10"
            />
          ) : (
            <img src="/logo-icon.png" alt="" className="h-8 w-8 rounded-lg bg-white/10 p-1.5" />
          )}
          <h1 className="text-white font-semibold text-[17px]">
            {profile?.name || "Admin Panel"}
          </h1>
        </div>
        <div className="max-w-2xl mx-auto px-5 flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3.5 py-2.5 text-[13px] font-medium border-b-2 transition-colors relative ${
                tab === t.id
                  ? "border-white text-white"
                  : "border-transparent text-slate-400"
              }`}
            >
              {t.label}
              {t.id === "requests" && requests.length > 0 && (
                <span className="absolute -top-0.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-semibold flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-5">
        {tab === "requests" && (
          <AdminRequests
            companyId={companyId}
            requests={requests}
            carsById={carsById}
          />
        )}
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
