// Azərbaycan telefon nömrəsini beynəlxalq formata (994XXXXXXXXX) çevirir.
// Qəbul edir: 0502103468 (10 rəqəm, yerli format), 502103468 (9 rəqəm),
// 994502103468 (artıq beynəlxalq), +994502103468 və s.
export function toIntlDigits(phone) {
  let digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = `994${digits.slice(1)}`;
  } else if (digits.length === 9) {
    digits = `994${digits}`;
  }
  // artıq 994 ilə başlayırsa (12 rəqəm) toxunmuruq
  return digits;
}
