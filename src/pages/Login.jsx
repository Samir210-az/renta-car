import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Delete } from "lucide-react";
import { listenSettings } from "../lib/data";
import { setStaffAuthed, isStaffAuthed } from "../lib/session";
import Footer from "../components/Footer";

const PIN_LENGTH = 4;

export default function Login() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isStaffAuthed()) navigate("/", { replace: true });
    const unsub = listenSettings(setSettings);
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (pin.length !== PIN_LENGTH || !settings) return;

    if (pin === settings.staffPin) {
      setStaffAuthed();
      navigate("/", { replace: true });
    } else {
      setError(true);
      const t = setTimeout(() => {
        setPin("");
        setError(false);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [pin, settings, navigate]);

  function press(digit) {
    if (pin.length >= PIN_LENGTH) return;
    setError(false);
    setPin((p) => p + digit);
  }

  function backspace() {
    setPin((p) => p.slice(0, -1));
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="h-14 w-14 rounded-2xl bg-ink flex items-center justify-center shadow-card mb-5">
          <Car size={26} className="text-white" strokeWidth={2.2} />
        </div>
        <h1 className="text-lg font-semibold text-ink">
          {settings?.companyName || "Renta-Car"}
        </h1>
        <p className="text-[13px] text-slate-400 mt-1 mb-8">PIN kodu daxil edin</p>

        <div
          className={`flex items-center gap-3 mb-10 ${
            error ? "animate-pulse" : ""
          }`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 rounded-full transition-colors ${
                i < pin.length
                  ? error
                    ? "bg-rose-500"
                    : "bg-ink"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              onClick={() => press(d)}
              className="h-16 rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft text-xl font-medium text-ink active:scale-95 transition-transform"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => press("0")}
            className="h-16 rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft text-xl font-medium text-ink active:scale-95 transition-transform"
          >
            0
          </button>
          <button
            onClick={backspace}
            className="h-16 rounded-2xl flex items-center justify-center text-slate-400 active:scale-95 transition-transform"
            aria-label="Sil"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
