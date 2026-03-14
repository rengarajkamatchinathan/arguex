export function ArgueXLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ArgueX"
    >
      {/* PRO bar — Indigo, ↗ diagonal */}
      <rect
        x="5" y="15" width="30" height="10" rx="5"
        fill="#4F46E5"
        transform="rotate(-45 20 20)"
      />
      {/* CON bar — Orange, ↘ diagonal */}
      <rect
        x="5" y="15" width="30" height="10" rx="5"
        fill="#F59E0B"
        transform="rotate(45 20 20)"
      />
      {/* Collision point — Purple diamond (where arguments meet) */}
      <polygon points="20,13 27,20 20,27 13,20" fill="#7C3AED" />
    </svg>
  );
}
