import {
  ref,
  onValue,
  push,
  set,
  update,
  remove,
  get,
  runTransaction,
} from "firebase/database";
import { db } from "./firebase";
import { planDays } from "./plans";
import { hashPin } from "./crypto";

export function normalizePhone(phone) {
  return (phone || "").replace(/\D/g, "");
}

// ---- Platform tənzimləmələri ----

export async function ensureDefaultPlatform() {
  const snap = await get(ref(db, "platform/adminPinHash"));
  if (!snap.exists()) {
    await set(ref(db, "platform/adminPinHash"), await hashPin("2026"));
  }
}

export function listenPlatformAdminPinHash(callback) {
  return onValue(ref(db, "platform/adminPinHash"), (snap) => {
    callback(snap.val() || null);
  });
}

export async function checkPlatformPin(pin) {
  const snap = await get(ref(db, "platform/adminPinHash"));
  const stored = snap.val();
  if (!stored) return false;
  return (await hashPin(pin)) === stored;
}

// ---- Şirkətlər (platform admin tərəfindən idarə olunur) ----
//
// Təhlükəsizlik: /companies node-u artıq siyahı kimi oxuna bilmir (rules-da
// bağlıdır) — yalnız konkret ID ilə. Platform Admin üçün /companyIndex adlı
// ayrı, "redaktə edilmiş" (PIN-siz) nüsxə saxlanılır; giriş üçün /phoneIndex
// telefon → ID uyğunlaşdırması aparır ki, login zamanı bütün şirkətlər
// bazaya sorğu olaraq getməsin.

function toIndexEntry(profile) {
  return {
    name: profile.name,
    phone: profile.phone,
    status: profile.status,
    plan: profile.plan,
    expiresAt: profile.expiresAt,
    createdAt: profile.createdAt,
  };
}

export function listenCompanies(callback) {
  return onValue(ref(db, "companyIndex"), (snap) => {
    const val = snap.val() || {};
    const list = Object.entries(val).map(([id, c]) => ({ id, ...c }));
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(list);
  });
}

export async function findCompanyIdByPhone(phone) {
  const snap = await get(ref(db, `phoneIndex/${normalizePhone(phone)}`));
  return snap.val() || null;
}

export async function registerCompany({ name, phone, pin, logo }) {
  const normalized = normalizePhone(phone);
  const existingId = await findCompanyIdByPhone(normalized);
  if (existingId) {
    throw new Error("Bu nömrə ilə artıq qeydiyyat var");
  }
  const companyRef = push(ref(db, "companies"));
  const id = companyRef.key;
  const profile = {
    name: name.trim(),
    phone: normalized,
    pinHash: await hashPin(pin),
    logo: logo || null,
    status: "pending",
    plan: null,
    activatedAt: null,
    expiresAt: null,
    createdAt: Date.now(),
  };
  await Promise.all([
    set(ref(db, `companies/${id}/profile`), profile),
    set(ref(db, `phoneIndex/${normalized}`), id),
    set(ref(db, `companyIndex/${id}`), toIndexEntry(profile)),
  ]);
  return id;
}

export async function activateCompany(companyId, planId) {
  const days = planDays(planId);
  const updates = {
    status: "active",
    plan: planId,
    activatedAt: Date.now(),
    expiresAt: Date.now() + days * 86400000,
  };
  await update(ref(db, `companies/${companyId}/profile`), updates);
  await update(ref(db, `companyIndex/${companyId}`), updates);
}

export async function deactivateCompany(companyId) {
  await update(ref(db, `companies/${companyId}/profile`), { status: "deactivated" });
  await update(ref(db, `companyIndex/${companyId}`), { status: "deactivated" });
}

export async function loginCompany(phone, pin) {
  const companyId = await findCompanyIdByPhone(phone);
  if (!companyId) return { ok: false, reason: "not-found" };

  const snap = await get(ref(db, `companies/${companyId}/profile`));
  const company = snap.val();
  if (!company) return { ok: false, reason: "not-found" };

  const enteredHash = await hashPin(pin);
  if (enteredHash !== company.pinHash) return { ok: false, reason: "wrong-pin" };
  if (company.status === "pending") return { ok: false, reason: "pending" };
  if (company.status === "deactivated") return { ok: false, reason: "deactivated" };
  if (company.status === "active" && company.expiresAt < Date.now())
    return { ok: false, reason: "expired" };
  return { ok: true, companyId };
}

// ---- Şirkət profili (tenant özü dəyişə bilər: ad, PIN) ----

export function listenCompanyProfile(companyId, callback) {
  return onValue(ref(db, `companies/${companyId}/profile`), (snap) => {
    callback(snap.val());
  });
}

export async function updateCompanyProfile(companyId, updates) {
  const payload = { ...updates };
  if (payload.newPin) {
    payload.pinHash = await hashPin(payload.newPin);
    delete payload.newPin;
  }
  await update(ref(db, `companies/${companyId}/profile`), payload);

  const indexUpdate = {};
  if ("name" in payload) indexUpdate.name = payload.name;
  if (Object.keys(indexUpdate).length > 0) {
    await update(ref(db, `companyIndex/${companyId}`), indexUpdate);
  }
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
  const plate = car.plate.trim().toUpperCase();

  // Nömrə nişanının təkrarlanmadığını yoxla
  const snap = await get(ref(db, `companies/${companyId}/cars`));
  const existing = snap.val() || {};
  const duplicate = Object.values(existing).some((c) => c.plate === plate);
  if (duplicate) {
    throw new Error(`"${plate}" nömrəli maşın artıq mövcuddur`);
  }

  const carsRef = ref(db, `companies/${companyId}/cars`);
  const newRef = push(carsRef);
  await set(newRef, {
    name: car.name,
    plate,
    year: car.year ?? null,
    dailyPrice: car.dailyPrice,
    ownerName: car.ownerName || null,
    ownerPhone: car.ownerPhone || null,
    ownerDailyRate: car.ownerDailyRate ?? null,
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

// Bir maşının statusunu YALNIZ "boş" olduğu halda "icarədə"-yə çevirir —
// iki işçinin eyni maşını eyni anda icarəyə verməsinin qarşısını alır.
export async function tryReserveCar(companyId, carId) {
  const carRef = ref(db, `companies/${companyId}/cars/${carId}/status`);
  const result = await runTransaction(carRef, (current) => {
    if (current !== "boş") return; // abort — artıq boş deyil
    return "icarədə";
  });
  return result.committed;
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
  const reserved = await tryReserveCar(companyId, rental.carId);
  if (!reserved) {
    throw new Error(
      "Bu maşın artıq başqası tərəfindən icarəyə verilib. Səhifəni yeniləyin."
    );
  }
  const rentalsRef = ref(db, `companies/${companyId}/rentals`);
  const newRef = push(rentalsRef);
  try {
    await set(newRef, {
      ...rental,
      status: "aktiv",
      createdAt: Date.now(),
    });
  } catch (err) {
    // İcarə qeydi yaranmadısa, maşını geri "boş"a qaytar
    await update(ref(db, `companies/${companyId}/cars/${rental.carId}`), {
      status: "boş",
    });
    throw err;
  }
  return newRef.key;
}

export async function closeRental(companyId, rental, returnCondition) {
  await update(ref(db, `companies/${companyId}/rentals/${rental.id}`), {
    status: "bitib",
    returnCondition,
  });
  await update(ref(db, `companies/${companyId}/cars/${rental.carId}`), {
    status: "boş",
  });
}

export async function getRentalDetail(companyId, rentalId) {
  const [rentalSnap, companySnap] = await Promise.all([
    get(ref(db, `companies/${companyId}/rentals/${rentalId}`)),
    get(ref(db, `companies/${companyId}/profile`)),
  ]);
  const rental = rentalSnap.val();
  if (!rental) return null;
  const carSnap = await get(ref(db, `companies/${companyId}/cars/${rental.carId}`));
  return {
    rental: { id: rentalId, ...rental },
    car: carSnap.val(),
    company: companySnap.val(),
  };
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
  const val = snap.val();
  if (!val) return null;
  // PIN hash-i belə açıq şəkildə müştəriyə göndərmirik
  const { pinHash, ...safe } = val;
  return safe;
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

// status: "rejected" birbaşa; "approved" isə YALNIZ icarə faktiki
// yarandıqdan sonra çağırılmalıdır (bax: NewRental) ki, yarımçıq qalan
// sorğu itməsin.
export async function resolveRequest(companyId, requestId, status) {
  await update(ref(db, `companies/${companyId}/requests/${requestId}`), {
    status,
  });
}

// ---- Maşın sahiblərinə ödənişlər ----

export function listenOwnerPayments(companyId, callback) {
  return onValue(ref(db, `companies/${companyId}/ownerPayments`), (snap) => {
    const val = snap.val() || {};
    const list = Object.entries(val).map(([id, p]) => ({ id, ...p }));
    list.sort((a, b) => b.paidAt - a.paidAt);
    callback(list);
  });
}

export async function addOwnerPayment(companyId, { carId, amount, note }) {
  const paymentsRef = ref(db, `companies/${companyId}/ownerPayments`);
  const newRef = push(paymentsRef);
  await set(newRef, {
    carId,
    amount: Number(amount),
    note: (note || "").trim(),
    paidAt: Date.now(),
  });
  return newRef.key;
}

export async function deleteOwnerPayment(companyId, paymentId) {
  await remove(ref(db, `companies/${companyId}/ownerPayments/${paymentId}`));
}

// ---- Tək maşın üçün tam profil (kart səhifəsi) ----

export async function getCarDetail(companyId, carId) {
  const [carSnap, rentalsSnap, paymentsSnap] = await Promise.all([
    get(ref(db, `companies/${companyId}/cars/${carId}`)),
    get(ref(db, `companies/${companyId}/rentals`)),
    get(ref(db, `companies/${companyId}/ownerPayments`)),
  ]);
  const car = carSnap.val();
  if (!car) return null;

  const allRentals = rentalsSnap.val() || {};
  const rentals = Object.entries(allRentals)
    .map(([id, r]) => ({ id, ...r }))
    .filter((r) => r.carId === carId)
    .sort((a, b) => b.createdAt - a.createdAt);

  const allPayments = paymentsSnap.val() || {};
  const payments = Object.entries(allPayments)
    .map(([id, p]) => ({ id, ...p }))
    .filter((p) => p.carId === carId)
    .sort((a, b) => b.paidAt - a.paidAt);

  return { car: { id: carId, ...car }, rentals, payments };
}
