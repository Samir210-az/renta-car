import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { isStaffAuthed, isAdminAuthed } from "./lib/session";
import { ensureDefaultSettings } from "./lib/data";
import Login from "./pages/Login";
import Cars from "./pages/Cars";
import NewRental from "./pages/NewRental";
import Calendar from "./pages/Calendar";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import Layout from "./components/Layout";

function RequireStaff({ children }) {
  if (!isStaffAuthed()) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  if (!isAdminAuthed()) return <Navigate to="/admin-login" replace />;
  return children;
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureDefaultSettings().finally(() => setReady(true));
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
      <Route path="/admin-login" element={<AdminLogin />} />

      <Route
        element={
          <RequireStaff>
            <Layout />
          </RequireStaff>
        }
      >
        <Route path="/" element={<Cars />} />
        <Route path="/yeni-icare" element={<NewRental />} />
        <Route path="/teqvim" element={<Calendar />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <Admin />
          </RequireAdmin>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
