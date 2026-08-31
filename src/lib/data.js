import {
  ref,
  onValue,
  push,
  set,
  update,
  remove,
  get,
} from "firebase/database";
import { db } from "./firebase";
import { planDays } from "./plans";

export function normalizePhone(phone) {
  return (phone || "").replace(/\D/g, "");
}

// ---- Platform tənzimləmələri ----

export async function ensureDefaultPlatform() {
  const snap = await get(ref(db, "platform/adminPin"));
  if (!snap.exists()) {
    await set(ref(db, "platform/adminPin"), "2026");
  }
}

export function listenPlatformAdminPin(callback) {
  return onValue(ref(db, "platform/adminPin"), (snap) => {
    callback(snap.val() || "2026");
  });
}

// ---- Şirkətlər (platform admin tərəfindən idarə olunur) ----

export function listenCompanies(callback) {
  return onValue(ref(db, "companies"), (snap) => {
    const val = snap.val() || {};
    const list = Object.entries(val).map(([id, c]) => ({
      id,
      ...c.profile,
    }));
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(list);
  });
}

export async function findCompanyByPhone(phone) {
  const target = normalizePhone(phone);
  const snap = await get(ref(db, "companies"));
  const val = snap.val() || {};
  for (const [id, c] of Object.entries(val)) {
    if (normalizePhone(c.profile?.phone) === target) {
      return { id, ...c.profile };
    }
  }
  return null;
}

export async function registerCompany({ name, phone, pin }) {
  const existing = await findCompanyByPhone(phone);
  if (existing) {
    throw new Error("Bu nömrə ilə artıq qeydiyyat var");
  }
  const companyRef = push(ref(db, "companies"));
  await set(ref(db, `companies/${companyRef.key}/profile`), {
    name: name.trim(),
    phone: normalizePhone(phone),
    pin,
    tenantAdminPin: pin,
    status: "pending",
    plan: null,
    activatedAt: null,
    expiresAt: null,
    createdAt: Date.now(),
  });
  return companyRef.key;
}

export async function activateCompany(companyId, planId) {
  const days = planDays(planId);
  await update(ref(db, `companies/${companyId}/profile`), {
    status: "active",
    plan: planId,
    activatedAt: Date.now(),
    expiresAt: Date.now() + days * 86400000,
  });
}

export async function deactivateCompany(companyId) {
  await update(ref(db, `companies/${companyId}/profile`), {
    status: "deactivated",
  });
}

export async function loginCompany(phone, pin) {
  const company = await findCompanyByPhone(phone);
  if (!company) return { ok: false, reason: "not-found" };
  if (company.pin !== pin) return { ok: false, reason: "wrong-pin" };
  if (company.status === "pending") return { ok: false, reason: "pending" };
  if (company.status === "deactivated")
    return { ok: false, reason: "deactivated" };
  if (company.status === "active" && company.expiresAt < Date.now())
    return { ok: false, reason: "expired" };
  return { ok: true, companyId: company.id };
}

// ---- Şirkət profili (tenant özü dəyişə bilər: ad, PIN-lər) ----

export function listenCompanyProfile(companyId, callback) {
  return onValue(ref(db, `companies/${companyId}/profile`), (snap) => {
    callback(snap.val());
  });
}

export async function updateCompanyProfile(companyId, updates) {
  await update(ref(db, `companies/${companyId}/profile`), updates);
}

// ---- Maşınlar (tenant-scoped) ----

export function listenCars(companyId, callback) {
  return onValue(ref(db, `companies/${companyId}/cars`), (snap) => {
    const val = snap.val() || {};
    const list = Object.entries(val).map(([id, car]) => ({ id, ...car }));
    list.sort((a, b) => a.name.localeCompare(b.name, "az"));
    callback(list);
  });
}

export async function addCar(companyId, car) {
  const carsRef = ref(db, `companies/${companyId}/cars`);
  const newRef = push(carsRef);
  await set(newRef, {
    name: car.name,
    plate: car.plate,
    dailyPrice: car.dailyPrice,
    status: "boş",
    createdAt: Date.now(),
  });
  return newRef.key;
}

export async function updateCar(companyId, id, updates) {
  await update(ref(db, `companies/${companyId}/cars/${id}`), updates);
}

export async function deleteCar(companyId, id) {
  await remove(ref(db, `companies/${companyId}/cars/${id}`));
}

// ---- İcarələr (tenant-scoped) ----

export function listenRentals(companyId, callback) {
  return onValue(ref(db, `companies/${companyId}/rentals`), (snap) => {
    const val = snap.val() || {};
    const list = Object.entries(val).map(([id, rental]) => ({
      id,
      ...rental,
    }));
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  });
}

export async function addRental(companyId, rental) {
  const rentalsRef = ref(db, `companies/${companyId}/rentals`);
  const newRef = push(rentalsRef);
  await set(newRef, {
    ...rental,
    status: "aktiv",
    createdAt: Date.now(),
  });
  await update(ref(db, `companies/${companyId}/cars/${rental.carId}`), {
    status: "icarədə",
  });
  return newRef.key;
}

export async function closeRental(companyId, rental) {
  await update(ref(db, `companies/${companyId}/rentals/${rental.id}`), {
    status: "bitib",
  });
  await update(ref(db, `companies/${companyId}/cars/${rental.carId}`), {
    status: "boş",
  });
}

export async function deleteRental(companyId, rental) {
  await remove(ref(db, `companies/${companyId}/rentals/${rental.id}`));
  if (rental.status === "aktiv") {
    await update(ref(db, `companies/${companyId}/cars/${rental.carId}`), {
      status: "boş",
    });
  }
}

// ---- İctimai kataloq üçün (giriş tələb olunmur) ----

export async function getPublicCompany(companyId) {
  const snap = await get(ref(db, `companies/${companyId}/profile`));
  return snap.val();
}

export function listenPublicCars(companyId, callback) {
  return onValue(ref(db, `companies/${companyId}/cars`), (snap) => {
    const val = snap.val() || {};
    const list = Object.entries(val)
      .map(([id, car]) => ({ id, ...car }))
      .filter((c) => c.status === "boş");
    list.sort((a, b) => a.name.localeCompare(b.name, "az"));
    callback(list);
  });
}

// ---- Sorğular (müştəri kataloqdan seçir, işçi təsdiqləyir) ----

export function listenRequests(companyId, callback) {
  return onValue(ref(db, `companies/${companyId}/requests`), (snap) => {
    const val = snap.val() || {};
    const list = Object.entries(val).map(([id, r]) => ({ id, ...r }));
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list.filter((r) => r.status === "pending"));
  });
}

export async function submitCarRequest(companyId, { carId, customerName, customerPhone }) {
  const requestsRef = ref(db, `companies/${companyId}/requests`);
  const newRef = push(requestsRef);
  await set(newRef, {
    carId,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    status: "pending",
    createdAt: Date.now(),
  });
  return newRef.key;
}

export async function resolveRequest(companyId, requestId, status) {
  await update(ref(db, `companies/${companyId}/requests/${requestId}`), {
    status,
  });
}
