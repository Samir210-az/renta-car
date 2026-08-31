export default function Footer({ className = "" }) {
  return (
    <footer className={`py-4 text-center ${className}`}>
      <a
        href="https://instagram.com/securtiy_group"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] tracking-wide text-slate-400 hover:text-slate-600 transition-colors"
      >
        By securtiy_group
      </a>
    </footer>
  );
}
