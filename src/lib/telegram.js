// Digər layihələrindəki pattern: VITE_TELEGRAM_BOT_TOKEN / VITE_TELEGRAM_CHAT_ID
// Vercel-də tənzimlənməlidir. Dəyişənlər yoxdursa sakitcə heç nə etmir (əsas
// axını pozmamaq üçün), amma konsola aydın izah yazır ki, debug etmək asan olsun.
export async function notifyTelegram(message) {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn(
      "[telegram] VITE_TELEGRAM_BOT_TOKEN / VITE_TELEGRAM_CHAT_ID tapılmadı — Vercel-də əlavə edilib amma build köhnə ola bilər (yeni deploy lazımdır)."
    );
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[telegram] sendMessage uğursuz oldu:", res.status, body);
    }
  } catch (err) {
    console.error("[telegram] sorğu göndərilə bilmədi:", err);
  }
}
