import { useState } from "react";

export const DAMAGE_TYPES = [
  { id: "cizig", label: "Cızıq", color: "#eab308" },
  { id: "ezik", label: "Əzik", color: "#f97316" },
  { id: "sinig", label: "Sınıq / Fara", color: "#ef4444" },
];

export default function DamageDiagram({ value = [], onChange, readOnly = false }) {
  const [activeType, setActiveType] = useState(DAMAGE_TYPES[0].id);

  function handleClick(e) {
    if (readOnly || !onChange) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 320);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 160);
    onChange([...value, { x, y, type: activeType }]);
  }

  function removeMarker(index, e) {
    e.stopPropagation();
    if (readOnly || !onChange) return;
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      {!readOnly && (
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {DAMAGE_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveType(t.id)}
              className="h-7 px-2.5 rounded-full text-[11px] font-medium flex items-center gap-1.5 ring-1 transition-colors"
              style={{
                backgroundColor: activeType === t.id ? t.color : "white",
                color: activeType === t.id ? "white" : "#57534e",
                borderColor: t.color,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: activeType === t.id ? "white" : t.color }}
              />
              {t.label}
            </button>
          ))}
        </div>
      )}

      <svg
        viewBox="0 0 320 160"
        onClick={handleClick}
        className={`w-full rounded-lg bg-paper ring-1 ring-stone-700 ${
          !readOnly ? "cursor-crosshair" : ""
        }`}
      >
        <rect x="60" y="35" width="200" height="90" rx="35" fill="none" stroke="#a8a29e" strokeWidth="2" />
        <path d="M215 45 L245 55 L245 105 L215 115 Z" fill="none" stroke="#d6d3d1" strokeWidth="1.5" />
        <path d="M105 45 L75 55 L75 105 L105 115 Z" fill="none" stroke="#d6d3d1" strokeWidth="1.5" />
        <rect x="85" y="20" width="26" height="10" rx="4" fill="#d6d3d1" />
        <rect x="85" y="130" width="26" height="10" rx="4" fill="#d6d3d1" />
        <rect x="205" y="20" width="26" height="10" rx="4" fill="#d6d3d1" />
        <rect x="205" y="130" width="26" height="10" rx="4" fill="#d6d3d1" />
        <text x="262" y="85" fontSize="10" fill="#a8a29e">ÖN</text>
        <text x="58" y="85" fontSize="10" fill="#a8a29e" textAnchor="end">ARXA</text>

        {value.map((m, i) => {
          const t = DAMAGE_TYPES.find((x) => x.id === m.type) || DAMAGE_TYPES[0];
          return (
            <circle
              key={i}
              cx={m.x}
              cy={m.y}
              r="6"
              fill={t.color}
              stroke="white"
              strokeWidth="1.5"
              onClick={(e) => removeMarker(i, e)}
              className={!readOnly ? "cursor-pointer" : ""}
            />
          );
        })}
      </svg>

      {!readOnly && (
        <p className="text-[11px] text-stone-400 mt-1.5">
          Zədə yerinə toxunub işarələyin · mövcud nöqtəyə toxunsanız silinir
        </p>
      )}
    </div>
  );
}
