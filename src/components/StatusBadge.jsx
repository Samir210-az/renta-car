const STATUS_STYLES = {
  boş: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  icarədə: "bg-rose-50 text-rose-700 ring-rose-600/20",
  servisdə: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

const STATUS_DOT = {
  boş: "bg-emerald-500",
  icarədə: "bg-rose-500",
  servisdə: "bg-amber-500",
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.boş;
  const dot = STATUS_DOT[status] || STATUS_DOT.boş;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
