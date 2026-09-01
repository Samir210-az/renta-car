import { useRef, useState } from "react";
import { X, Check } from "lucide-react";

export default function SignaturePad({ onSave, onCancel }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return {
      x: ((point.clientX - rect.left) / rect.width) * canvas.width,
      y: ((point.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function start(e) {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#141210";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    setHasDrawn(true);
  }

  function end() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  function save() {
    if (!hasDrawn) return;
    onSave(canvasRef.current.toDataURL("image/png"));
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-4">
        <p className="text-[13px] font-medium text-stone-800 mb-2">
          Bu sahəyə barmaqla/qələmlə imza atın
        </p>
        <canvas
          ref={canvasRef}
          width={320}
          height={160}
          className="w-full h-40 rounded-xl bg-stone-50 ring-1 ring-stone-200 touch-none"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={clear}
            className="h-10 px-3.5 rounded-lg ring-1 ring-stone-200 text-[13px] text-stone-500"
          >
            Təmizlə
          </button>
          <button
            onClick={onCancel}
            className="h-10 w-10 rounded-lg ring-1 ring-stone-200 flex items-center justify-center text-stone-500 ml-auto"
            aria-label="Bağla"
          >
            <X size={16} />
          </button>
          <button
            onClick={save}
            disabled={!hasDrawn}
            className="h-10 px-4 rounded-lg bg-gold text-ink text-[13px] font-semibold disabled:opacity-40 flex items-center gap-1.5"
          >
            <Check size={15} />
            Təsdiqlə
          </button>
        </div>
      </div>
    </div>
  );
}
