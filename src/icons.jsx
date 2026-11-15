// Icone a contorno fine (stroke 1.5) per le categorie.
const PATHS = {
  casa: <><path d="M3.5 10.5 12 4l8.5 6.5" /><path d="M5.5 9v10.5h13V9" /><path d="M10 19.5v-5.5h4v5.5" /></>,
  alimentari: <><path d="M3 4.5h2.2l2.2 10.2h10.4l1.9-7.4H6.3" /><circle cx="9" cy="19" r="1.3" /><circle cx="16.5" cy="19" r="1.3" /></>,
  trasporti: <><path d="M5 16.5V12l1.8-4.6A1.5 1.5 0 0 1 8.2 6.5h7.6a1.5 1.5 0 0 1 1.4.9L19 12v4.5" /><path d="M4 16.5h16" /><path d="M5 12h14" /><circle cx="8" cy="16.5" r="1.6" /><circle cx="16" cy="16.5" r="1.6" /></>,
  bollette: <path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12L13 3Z" />,
  salute: <path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.3 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />,
  svago: <><path d="M4 8.5V6.5h16v2a2.5 2.5 0 0 0 0 5v2H4v-2a2.5 2.5 0 0 0 0-5Z" transform="translate(0 1)" /><path d="M14.5 7.5v1.5M14.5 11v1.5M14.5 15v1.5" /></>,
  abbonamenti: <><path d="M17 3.5 20 6.5l-3 3" /><path d="M4 11.5v-1a4 4 0 0 1 4-4h12" /><path d="M7 20.5 4 17.5l3-3" /><path d="M20 12.5v1a4 4 0 0 1-4 4H4" /></>,
  altro: <><circle cx="12" cy="12" r="8.5" /><circle cx="8.3" cy="12" r=".6" fill="currentColor" /><circle cx="12" cy="12" r=".6" fill="currentColor" /><circle cx="15.7" cy="12" r=".6" fill="currentColor" /></>,
}

export function CategoryIcon({ id, slot, size = 20 }) {
  return (
    <svg
      className="cat-icon"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: `var(--series-${slot ?? 8})` }}
      aria-hidden="true"
    >
      {PATHS[id] ?? PATHS.altro}
    </svg>
  )
}
