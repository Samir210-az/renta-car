import { useNavigate } from "react-router-dom";
import PhoneActions from "./PhoneActions";

const STATUS_STYLE = {
  boş: "ring-emerald-500/40 bg-emerald-500/[0.06]",
  icarədə: "ring-rose-500/40 bg-rose-500/[0.06]",
  servisdə: "ring-amber-500/40 bg-amber-500/[0.06]",
};

const STATUS_DOT = {
  boş: "bg-emerald-500",
  icarədə: "bg-rose-500",
  servisdə: "bg-amber-500",
};

export default function CarCard({ car, activeRental }) {
  const navigate = useNavigate();
  const ring = STATUS_STYLE[car.status] || STATUS_STYLE.boş;
  const dot = STATUS_DOT[car.status] || STATUS_DOT.boş;
  const photo = car.photos?.[0];

  return (
    <div
      onClick={() => navigate(`/masin/${car.id}`)}
      role="button"
      tabIndex={0}
      className={`rounded-xl2 bg-surface ring-2 ${ring} p-3 flex flex-col active:scale-[0.98] transition-transform cursor-pointer`}
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          className="w-full h-24 rounded-lg object-cover mb-2.5"
        />
      ) : (
        <div className="w-full h-24 rounded-lg bg-paper mb-2.5 flex items-center justify-center">
          <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        </div>
      )}

      <div className="flex items-start justify-between gap-1.5">
        <h3 className="font-semibold text-stone-50 text-[13.5px] leading-tight truncate">
          {car.name}
        </h3>
        <span className={`h-2 w-2 rounded-full shrink-0 mt-1 ${dot}`} />
      </div>
      <p className="text-[11.5px] text-stone-500 mt-0.5">
        {car.plate}
        {car.year ? ` · ${car.year}` : ""}
      </p>

      {car.status === "icarədə" && activeRental && (
        <div className="mt-1.5">
          <p className="text-[11px] text-stone-400 truncate">
            {activeRental.customerName} · {activeRental.endDate}
          </p>
          <div className="mt-1">
            <PhoneActions phone={activeRental.customerPhone} size={13} />
          </div>
        </div>
      )}
    </div>
  );
}
