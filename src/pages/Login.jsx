import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, Delete } from "lucide-react";
import { loginCompany } from "../lib/data";
import { setCompanyId, isCompanyAuthed } from "../lib/session";
import Footer from "../components/Footer";

const PIN_LENGTH = 4;

const ERROR_MESSAGES = {
  "not-found": "Bu nömrə ilə qeydiyyat tapılmadı",
  "wrong-pin": "PIN yanlışdır",
  pending: "Qeydiyyatınız hələ təsdiqlənməyib, gözləyin",
  deactivated: "Hesabınız deaktiv edilib",
  expired: "Abunəliyinizin müddəti bitib",
};

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  useEffect(() => {
    if (isCompanyAuthed()) navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (pin.length !== PIN_LENGTH || checking) return;
    if (phone.trim().length < 7) {
      setError("Telefon nömrəsini daxil edin");
      resetPin();
      return;
    }

    setChecking(true);
    loginCompany(phone, pin)
      .then((result) => {
        if (result.ok) {
          setCompanyId(result.companyId);
          navigate("/", { replace: true });
        } else {
          setError(ERROR_MESSAGES[result.reason] || "Giriş uğursuz oldu");
          resetPin();
        }
      })
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  function resetPin() {
    setTimeout(() => setPin(""), 500);
  }

  function press(digit) {
    if (pin.length >= PIN_LENGTH) return;
    setError("");
    setPin((p) => p + digit);
  }

  function backspace() {
    setPin((p) => p.slice(0, -1));
  }

  function handleLogoTap() {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);

    if (tapCount.current >= 5) {
      tapCount.current = 0;
      navigate("/platform-login");
      return;
    }

    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 2500);
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <button
          onClick={handleLogoTap}
          aria-label="logo"
          className="h-14 w-14 rounded-2xl bg-ink flex items-center justify-center shadow-card mb-5 touch-manipulation active:scale-95 transition-transform"
        >
          <Car size={26} className="text-white" strokeWidth={2.2} />
        </button>
        <h1 className="text-lg font-semibold text-ink">Renta-Car</h1>
        <p className="text-[13px] text-slate-400 mt-1 mb-6">
          Telefon və PIN kodu ilə daxil olun
        </p>

        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+994 XX XXX XX XX"
          className="w-full max-w-[280px] h-12 rounded-xl bg-white ring-1 ring-slate-200 px-4 text-center text-[15px] text-ink placeholder:text-slate-400 mb-6"
        />

        <div
          className={`flex items-center gap-3 mb-3 ${
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

        <p
          className={`text-[12.5px] text-rose-600 h-4 mb-4 ${
            error ? "opacity-100" : "opacity-0"
          }`}
        >
          {error || "."}
        </p>

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

        <Link
          to="/register"
          className="text-[13px] text-slate-500 mt-8 hover:text-ink transition-colors"
        >
          Hələ hesabınız yoxdur? <span className="font-medium text-ink">Qeydiyyatdan keçin</span>
        </Link>
      </div>
      <Footer />
    </div>
  );
}
