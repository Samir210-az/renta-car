// Maşının bilinən son km-ni icarə tarixçəsindən çıxarır (ən son
// qaytarma km-i, yoxdursa ən son təhvil km-i).
export function getCurrentKm(rentals) {
  const sorted = [...rentals].sort((a, b) => b.createdAt - a.createdAt);
  for (const r of sorted) {
    if (r.returnCondition?.km != null) return r.returnCondition.km;
    if (r.pickupCondition?.km != null) return r.pickupCondition.km;
  }
  return null;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isServiceDue(car, currentKm) {
  const kmDue =
    car.nextServiceKm != null &&
    currentKm != null &&
    currentKm >= Number(car.nextServiceKm);
  const dateDue = car.nextServiceDate && todayISO() >= car.nextServiceDate;
  return kmDue || dateDue;
}
