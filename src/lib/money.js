export function daysBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.round(ms / 86400000));
}

// Bir maşının bütün icarələri üzrə sahibinə düşən ümumi məbləği hesablayır
export function calcOwnerOwed(car, rentals) {
  if (!car?.ownerDailyRate) return 0;
  return rentals.reduce((sum, r) => {
    return sum + daysBetween(r.startDate, r.endDate) * car.ownerDailyRate;
  }, 0);
}

export function calcTotalPaid(payments) {
  return payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
}
