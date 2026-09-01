export function daysBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.round(ms / 86400000));
}

// Bir maşının bütün icarələri üzrə sahibinə düşən ümumi məbləği hesablayır.
// Yalnız faktiki baş vermiş (aktiv/bitib) icarələr sayılır — rezervasiya
// (hələ başlamayıb) və ləğv edilmiş icarələr sahibə borc yaratmır.
export function calcOwnerOwed(car, rentals) {
  if (!car?.ownerDailyRate) return 0;
  return rentals
    .filter((r) => r.status === "aktiv" || r.status === "bitib")
    .reduce((sum, r) => {
      return sum + daysBetween(r.startDate, r.endDate) * car.ownerDailyRate;
    }, 0);
}

export function calcTotalPaid(payments) {
  return payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
}

// Gün sayına görə ən uyğun tarifi seçir: 30+ gün üçün aylıq endirim,
// 7+ gün üçün həftəlik endirim, əks halda adi gündəlik qiymət.
export function calcRentalPrice(car, days) {
  const daily = Number(car?.dailyPrice || 0);
  let percent = 0;
  let tierLabel = "Gündəlik";

  if (days >= 30 && car?.monthlyDiscountPercent) {
    percent = Number(car.monthlyDiscountPercent);
    tierLabel = "Aylıq endirim";
  } else if (days >= 7 && car?.weeklyDiscountPercent) {
    percent = Number(car.weeklyDiscountPercent);
    tierLabel = "Həftəlik endirim";
  }

  const base = daily * days;
  const discount = Math.round((base * percent) / 100);
  return { total: base - discount, discount, percent, tierLabel, base };
}
