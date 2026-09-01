import { useEffect, useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { isCompanyAuthed, isPlatformAuthed } from "./lib/session";
import { ensureDefaultPlatform } from "./lib/data";
import Login from "./pages/Login";
import Cars from "./pages/Cars";
import Layout from "./components/Layout";

// Bu səhifələr ilk açılışda dərhal lazım deyil — kod-splitting ilə
// ayrıca fayllara bölünür, yalnız ziyarət olunanda yüklənir. Bundle
// ölçüsünü kiçildir, ilk yüklənməni sürətləndirir.
const Register = lazy(() => import("./pages/Register"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Akt = lazy(() => import("./pages/Akt"));
const Muqavile = lazy(() => import("./pages/Muqavile"));
const CarDetail = lazy(() => import("./pages/CarDetail"));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail"));
const NewRental = lazy(() => import("./pages/NewRental"));
const Calendar = lazy(() => import("./pages/Calendar"));
const TenantAdmin = lazy(() => import("./pages/TenantAdmin"));
const PlatformLogin = lazy(() => import("./pages/PlatformLogin"));
const PlatformAdmin = lazy(() => import("./pages/PlatformAdmin"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-stone-700 border-t-gold animate-spin" />
    </div>
  );
}

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

  if (!ready) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
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
          path="/muqavile/:companyId/:rentalId"
          element={
            <RequireCompany>
              <Muqavile />
            </RequireCompany>
          }
        />
        <Route
          path="/masin/:carId"
          element={
            <RequireCompany>
              <CarDetail />
            </RequireCompany>
          }
        />
        <Route
          path="/musteri/:customerId"
          element={
            <RequireCompany>
              <CustomerDetail />
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
    </Suspense>
  );
}
