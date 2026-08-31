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

// ---- Settings (PIN-lər) ----

const DEFAULT_SETTINGS = {
  staffPin: "1111",
  adminPin: "2026",
  companyName: "Renta-Car",
};

export async function ensureDefaultSettings() {
  const snap = await get(ref(db, "settings"));
  if (!snap.exists()) {
    await set(ref(db, "settings"), DEFAULT_SETTINGS);
  }
}

export function listenSettings(callback) {
  return onValue(ref(db, "settings"), (snap) => {
    callback(snap.val() || DEFAULT_SETTINGS);
  });
}

export async function updateSettings(updates) {
  await update(ref(db, "settings"), updates);
}

// ---- Cars ----

export function listenCars(callback) {
  return onValue(ref(db, "cars"), (snap) => {
    const val = snap.val() || {};
    const list = Object.entries(val).map(([id, car]) => ({ id, ...car }));
    list.sort((a, b) => a.name.localeCompare(b.name, "az"));
    callback(list);
  });
}

export async function addCar(car) {
  const carsRef = ref(db, "cars");
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

export async function updateCar(id, updates) {
  await update(ref(db, `cars/${id}`), updates);
}

export async function deleteCar(id) {
  await remove(ref(db, `cars/${id}`));
}

// ---- Rentals ----

export function listenRentals(callback) {
  return onValue(ref(db, "rentals"), (snap) => {
    const val = snap.val() || {};
    const list = Object.entries(val).map(([id, rental]) => ({
      id,
      ...rental,
    }));
    list.sort((a, b) => b.createdAt - a.createdAt);
    callback(list);
  });
}

export async function addRental(rental) {
  const rentalsRef = ref(db, "rentals");
  const newRef = push(rentalsRef);
  await set(newRef, {
    ...rental,
    status: "aktiv",
    createdAt: Date.now(),
  });
  await update(ref(db, `cars/${rental.carId}`), { status: "icarədə" });
  return newRef.key;
}

export async function closeRental(rental) {
  await update(ref(db, `rentals/${rental.id}`), { status: "bitib" });
  await update(ref(db, `cars/${rental.carId}`), { status: "boş" });
}

export async function deleteRental(rental) {
  await remove(ref(db, `rentals/${rental.id}`));
  if (rental.status === "aktiv") {
    await update(ref(db, `cars/${rental.carId}`), { status: "boş" });
  }
}
