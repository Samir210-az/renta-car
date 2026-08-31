import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { isCompanyAuthed, isPlatformAuthed } from "./lib/session";
import { ensureDefaultPlatform } from "./lib/data";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import Akt from "./pages/Akt";
import Cars from "./pages/Cars";
import NewRental from "./pages/NewRental";
import Calendar from "./pages/Calendar";
import TenantAdmin from "./pages/TenantAdmin";
import PlatformLogin from "./pages/PlatformLogin";
import PlatformAdmin from "./pages/PlatformAdmin";
import Layout from "./components/Layout";

function RequireCompany({ children }) {
  if (!isCompanyAuthed()) return <Navigate to="/login" replace />;
  return children;
}

function RequirePlatform({ children }) {
  if (!isPlatformAuthed()) return <Navigate to="/platform-login" replace />;
  return children;
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureDefaultPlatform().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/kataloq/:companyId" element={<Catalog />} />

      <Route path="/platform-login" element={<PlatformLogin />} />
      <Route
        path="/platform-admin"
        element={
          <RequirePlatform>
            <PlatformAdmin />
          </RequirePlatform>
        }
      />

      <Route
        path="/tenant-admin"
        element={
          <RequireCompany>
            <TenantAdmin />
          </RequireCompany>
        }
      />
      <Route
        path="/akt/:companyId/:rentalId"
        element={
          <RequireCompany>
            <Akt />
          </RequireCompany>
        }
      />

      <Route
        element={
          <RequireCompany>
            <Layout />
          </RequireCompany>
        }
      >
        <Route path="/" element={<Cars />} />
        <Route path="/yeni-icare" element={<NewRental />} />
        <Route path="/teqvim" element={<Calendar />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
