// Digər layihələrindəki pattern: VITE_TELEGRAM_BOT_TOKEN / VITE_TELEGRAM_CHAT_ID
// Vercel-də tənzimlənməlidir. Dəyişənlər yoxdursa sakitcə heç nə etmir.
export async function notifyTelegram(message) {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch {
    // bildiriş uğursuz olsa belə əsas axını pozmamalıyıq
  }
}
