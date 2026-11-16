import { useEffect } from 'react'

// Pannello che sale dal basso. Lo "scope" dice a colpo d'occhio cosa si sta cambiando:
//  app    → ingranaggio, grigio-blu: vale per tutta l'app
//  screen → cursori, colore della sezione: vale per questa schermata
//  list   → cursori, colore della lista: vale solo per questa lista
export const Ico = ({ d, size = 22, fill }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
)
export const I = {
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></>,
  sliders: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>,
  pencil: <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  rows: <><rect x="4" y="5" width="16" height="3" rx="1" /><rect x="4" y="10.5" width="16" height="3" rx="1" /><rect x="4" y="16" width="16" height="3" rx="1" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  layers: <><path d="m12 4 8 4-8 4-8-4Z" /><path d="m4 12 8 4 8-4M4 16l8 4 8-4" /></>,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2" /></>,
  az: <><path d="M4 18 7.5 6 11 18M5.2 14h4.6M14 6h6l-6 12h6" /></>,
  shelves: <><path d="M4 4v16M20 4v16M4 9h16M4 15h16" /><rect x="7" y="5.5" width="3" height="3.5" /><rect x="13" y="11.5" width="4" height="3.5" /></>,
  people: <><circle cx="9" cy="8.5" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="16.5" cy="9.5" r="2.4" /><path d="M15.6 13.9A4.5 4.5 0 0 1 20.5 19" /></>,
  trash: <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />,
  tag: <><path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9Z" /><circle cx="8" cy="8" r="1.4" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
}

export default function Sheet({ scope = 'screen', label, title, onClose, children, color }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className={`sheet scope-${scope} ${color ? 'lc-' + color : ''}`}>
        <div className="sheet-grab" aria-hidden="true" />
        <div className="sheet-head">
          <span className="scope-chip">
            <Ico d={scope === 'app' ? I.gear : I.sliders} size={16} />
            {label}
          </span>
          <button type="button" className="sheet-x" onClick={onClose} aria-label="Chiudi"><Ico d={I.close} size={18} /></button>
        </div>
        <h2 className="sheet-title">{title}</h2>
        {children}
      </div>
    </div>
  )
}

// Riga di opzioni a icone grandi (scelta singola)
export function IconChoice({ options, value, onChange, label }) {
  return (
    <div className="icon-choice" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.art || <Ico d={o.icon} size={28} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  )
}

// Interruttore con icona
export function IconToggle({ icon, label, checked, onChange }) {
  return (
    <label className="icon-toggle">
      <span className="it-ico"><Ico d={icon} size={22} /></span>
      <span className="it-label">{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

export const Section = ({ icon, title, children }) => (
  <section className="sheet-sec">
    <h3><Ico d={icon} size={18} />{title}</h3>
    {children}
  </section>
)

// Intestazione uguale per tutte le pagine: titolo grande + pulsanti tondi a icona
export const PageHeader = ({ title, children }) => (
  <header className="page-head">
    <h1>{title}</h1>
    {children && <div className="page-actions">{children}</div>}
  </header>
)
