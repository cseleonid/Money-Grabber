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

const PAY_PATHS = {
  carta: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3 9.5h18" /><path d="M6.5 14.5h4" /></>,
  portafoglio: <><path d="M4 7.5V17a2 2 0 0 0 2 2h13.5v-4" /><path d="M19.5 10.5V7.5H6a2 2 0 0 1 0-4h11.5v4" /><path d="M21 10.5h-4a2 2 0 0 0 0 4h4z" /></>,
}

export function PaymentIcon({ id, size = 20 }) {
  return (
    <svg className="pay-icon" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PAY_PATHS[id] ?? PAY_PATHS.carta}
    </svg>
  )
}

// Icone monocolore delle sezioni (stesso tratto sottile delle categorie)
const SECTION_PATHS = {
  personale: <><circle cx="12" cy="12" r="8.5" /><path d="M15 9.2a3.6 3.6 0 1 0 0 5.6" /><path d="M7.8 11h5.4M7.8 13.2h5.4" /></>,
  calendario: <><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  spesa: <><path d="M3 4.5h2.2l2.2 10.2h10.4l1.9-7.4H6.3" /><circle cx="9" cy="19" r="1.3" /><circle cx="16.5" cy="19" r="1.3" /></>,
  todo: <><rect x="4" y="4" width="16" height="16" rx="4.5" /><path d="m8.5 12.2 2.4 2.4 4.6-5" /></>,
  condivise: <><circle cx="9" cy="8.5" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="16.5" cy="9.5" r="2.4" /><path d="M15.6 13.9A4.5 4.5 0 0 1 20.5 19" /></>,
}

export function SectionIcon({ id, size = 22 }) {
  return (
    <svg className="sec-icon" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SECTION_PATHS[id] ?? SECTION_PATHS.personale}
    </svg>
  )
}

// Polipo simpatico: testa tonda, occhioni, sorriso, guance e tentacoli arricciati
export function OctoIcon({ size = 30 }) {
  return (
    <svg className="octo-icon" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5.3 12.6V10a6.7 6.7 0 0 1 13.4 0v2.6" />
      <circle cx="9.4" cy="9.3" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="14.6" cy="9.3" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="9.8" cy="8.9" r=".35" fill="var(--raised, #fff)" stroke="none" />
      <circle cx="15" cy="8.9" r=".35" fill="var(--raised, #fff)" stroke="none" />
      <path d="M10.4 11.7c.9.8 2.3.8 3.2 0" />
      <circle cx="7.6" cy="11.4" r=".75" fill="currentColor" stroke="none" opacity=".35" />
      <circle cx="16.4" cy="11.4" r=".75" fill="currentColor" stroke="none" opacity=".35" />
      <path d="M5.3 12.6c-.2 2.4-2.5 3-2.3 5 .1 1.2 1.6 1.4 2.1.5" />
      <path d="M8.5 13.1c0 2.7-1.3 4.4-.7 6.1.4 1.1 1.9 1 2.1-.2" />
      <path d="M12 13.3v5.2c0 1.2 1.1 1.7 1.8 1" />
      <path d="M15.5 13.1c0 2.7 1.3 4.4.7 6.1-.4 1.1-1.9 1-2.1-.2" />
      <path d="M18.7 12.6c.2 2.4 2.5 3 2.3 5-.1 1.2-1.6 1.4-2.1.5" />
    </svg>
  )
}
