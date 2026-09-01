const STATUS_STYLES = {
  boş: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25",
  icarədə: "bg-rose-500/15 text-rose-400 ring-rose-500/25",
  servisdə: "bg-amber-500/15 text-amber-400 ring-amber-500/25",
  rezerv: "bg-sky-500/15 text-sky-400 ring-sky-500/25",
};

const STATUS_DOT = {
  boş: "bg-emerald-500",
  icarədə: "bg-rose-500",
  servisdə: "bg-amber-500",
  rezerv: "bg-sky-500",
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
