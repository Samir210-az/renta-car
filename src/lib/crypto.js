// PIN-ləri açıq mətn kimi saxlamamaq üçün SHA-256 hash.
// Qeyd: 4 rəqəmli PIN-lər öz-özlüyündə "brute-force"-a qarşı zəifdir (cəmi
// 10 000 kombinasiya), amma hash-ləmə ən azı bazanı birbaşa oxuyan/dump edən
// tərəfə açıq mətn PIN verməməyi təmin edir.
export async function hashPin(pin) {
  const enc = new TextEncoder().encode(String(pin));
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
