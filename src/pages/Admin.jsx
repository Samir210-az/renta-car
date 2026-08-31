import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { logoutAdmin } from "../lib/session";
import {
  listenCars,
  listenRentals,
  listenSettings,
} from "../lib/data";
import Footer from "../components/Footer";
import AdminCars from "../components/admin/AdminCars";
import AdminRentals from "../components/admin/AdminRentals";
import AdminReport from "../components/admin/AdminReport";
import AdminSettings from "../components/admin/AdminSettings";

const TABS = [
  { id: "cars", label: "Maşınlar" },
  { id: "rentals", label: "İcarələr" },
  { id: "report", label: "Hesabat" },
  { id: "settings", label: "Tənzimləmələr" },
];

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("cars");
  const [cars, setCars] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const unsubCars = listenCars(setCars);
    const unsubRentals = listenRentals(setRentals);
    const unsubSettings = listenSettings(setSettings);
    return () => {
      unsubCars();
      unsubRentals();
      unsubSettings();
    };
  }, []);

  const rentalsByCarId = useMemo(() => {
    const map = {};
    for (const c of cars) map[c.id] = c;
    return map;
  }, [cars]);

  function handleExit() {
    logoutAdmin();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="sticky top-0 z-20 bg-ink">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 text-[13px] text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Tətbiqə qayıt
          </button>
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 text-[13px] text-slate-300 hover:text-white transition-colors"
          >
            <LogOut size={15} />
            Çıxış
          </button>
        </div>
        <div className="max-w-2xl mx-auto px-5 pb-3">
          <h1 className="text-white font-semibold text-[17px]">Admin Panel</h1>
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
        {tab === "cars" && <AdminCars cars={cars} />}
        {tab === "rentals" && (
          <AdminRentals rentals={rentals} carsById={rentalsByCarId} />
        )}
        {tab === "report" && <AdminReport cars={cars} rentals={rentals} />}
        {tab === "settings" && settings && <AdminSettings settings={settings} />}
      </main>

      <Footer />
    </div>
  );
}
