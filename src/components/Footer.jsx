export default function Footer({ className = "", light = false }) {
  return (
    <footer className={`py-4 text-center ${className}`}>
      <a
        href="https://instagram.com/securtiy_group"
        target="_blank"
        rel="noopener noreferrer"
        className={`text-[11px] tracking-wide transition-colors ${
          light
            ? "text-stone-400 hover:text-stone-600"
            : "text-stone-500 hover:text-stone-300"
        }`}
      >
        By securtiy_group
      </a>
    </footer>
  );
}
