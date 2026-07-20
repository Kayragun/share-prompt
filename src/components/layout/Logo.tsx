export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="none" aria-hidden="true">
      <g transform="translate(0 14)">
      <path
        d="M 68 32
           L 188 32
           Q 228 32, 228 72
           L 228 144
           Q 228 184, 188 184
           L 116 184
           L 64 226
           L 64 182
           Q 28 176, 28 140
           L 28 72
           Q 28 32, 68 32 Z"
        fill="var(--primary)"
      />
      <path
        d="M 78 76 L 116 106 L 78 136"
        stroke="var(--primary-foreground)"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="134" y="124" width="48" height="17" rx="8" fill="var(--primary-foreground)" />
      </g>
    </svg>
  );
}
