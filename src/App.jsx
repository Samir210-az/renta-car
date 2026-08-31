import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  isCompanyAuthed,
  isTenantAdminAuthed,
  isPlatformAuthed,
} from "./lib/session";
import { ensureDefaultPlatform } from "./lib/data";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cars from "./pages/Cars";
import NewRental from "./pages/NewRental";
import Calendar from "./pages/Calendar";
import TenantAdminLogin from "./pages/TenantAdminLogin";
import TenantAdmin from "./pages/TenantAdmin";
import PlatformLogin from "./pages/PlatformLogin";
import PlatformAdmin from "./pages/PlatformAdmin";
import Layout from "./components/Layout";

function RequireCompany({ children }) {
  if (!isCompanyAuthed()) return <Navigate to="/login" replace />;
  return children;
}

function RequireTenantAdmin({ children }) {
  if (!isCompanyAuthed()) return <Navigate to="/login" replace />;
  if (!isTenantAdminAuthed())
    return <Navigate to="/tenant-admin-login" replace />;
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
        <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/platform-login" element={<PlatformLogin />} />
      <Route
        path="/platform-admin"
        element={
          <RequirePlatform>
            <PlatformAdmin />
          </RequirePlatform>
        }
      />

      <Route path="/tenant-admin-login" element={<TenantAdminLogin />} />
      <Route
        path="/tenant-admin"
        element={
          <RequireTenantAdmin>
            <TenantAdmin />
          </RequireTenantAdmin>
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
