import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Lightbox({ photos, onClose }) {
  const [index, setIndex] = useState(0);

  function prev(e) {
    e.stopPropagation();
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }

  function next(e) {
    e.stopPropagation();
    setIndex((i) => (i + 1) % photos.length);
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4"
    >
      <button
        onClick={onClose}
        aria-label="Bağla"
        className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white"
      >
        <X size={18} />
      </button>

      <img
        src={photos[index]}
        alt=""
        className="max-h-[80vh] max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Əvvəlki"
            className="absolute left-3 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            aria-label="Növbəti"
            className="absolute right-3 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-6 left-1/2 -transtone-x-1/2 text-white/70 text-[12px]">
            {index + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}
