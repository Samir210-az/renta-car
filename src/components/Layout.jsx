import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Car, CalendarDays, PlusCircle, ShieldCheck, LogOut } from "lucide-react";
import { logoutCompany } from "../lib/session";
import Footer from "./Footer";

const NAV_ITEMS = [
  { to: "/", label: "Maşınlar", icon: Car, end: true },
  { to: "/yeni-icare", label: "Yeni icarə", icon: PlusCircle, end: false },
  { to: "/teqvim", label: "Təqvim", icon: CalendarDays, end: false },
  { to: "/tenant-admin", label: "Admin", icon: ShieldCheck, end: false },
];

export default function Layout() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("Renta-Car");
  const [companyLogo, setCompanyLogo] = useState(null);

  function handleLogout() {
    logoutCompany();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-stone-100">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="h-8 w-8 rounded-xl object-cover ring-1 ring-stone-100"
              />
            ) : (
              <img src="/logo-icon.png" alt="" className="h-8 w-8 rounded-xl bg-ink p-1" />
            )}
            <span className="font-semibold text-ink text-[15px] truncate">
              {companyName}
            </span>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Çıxış"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-5 py-5 pb-24">
        <Outlet context={{ setCompanyName, setCompanyLogo }} />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-stone-100">
        <div className="max-w-lg mx-auto grid grid-cols-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-stone-400 transition-colors"
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.4 : 2}
                    className={isActive ? "text-ink" : "text-stone-400"}
                  />
                  <span className={isActive ? "text-ink" : "text-stone-400"}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        <Footer className="!py-1.5 border-t border-stone-50" />
      </nav>
    </div>
  );
}
