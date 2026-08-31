// Şəkli brauzerdə kiçildib base64 JPEG-ə çevirir (Firebase Storage əvəzinə
// birbaşa RTDB-də saxlamaq üçün — kiçik ölçü vacibdir).
export function compressImage(file, { maxWidth = 640, quality = 0.6 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Şəkil oxuna bilmədi"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Fayl oxuna bilmədi"));
    reader.readAsDataURL(file);
  });
}
