// Temi delle liste della spesa: ogni tema ha un colore e un'icona a linea.
export const THEMES = [
  { id: 'casa', name: 'Spesa per la casa', color: 'pesca', icon: <><path d="M3.5 10.5 12 4l8.5 6.5" /><path d="M5.5 9v10.5h13V9" /><path d="M10 19.5v-5.5h4v5.5" /></> },
  { id: 'faidate', name: 'Fai da te', color: 'sole', icon: <><path d="M14.5 5.5a4 4 0 0 0 4.8 5.2L11 19a2.1 2.1 0 0 1-3-3l8.3-8.3a4 4 0 0 0-1.8-2.2Z" /><path d="m16.5 4.5 3 3" /></> },
  { id: 'animali', name: 'Animali', color: 'lavanda', icon: <><circle cx="7" cy="9" r="1.8" /><circle cx="11" cy="6.5" r="1.8" /><circle cx="15" cy="7.5" r="1.8" /><circle cx="17.8" cy="11.5" r="1.6" /><path d="M8.5 18c0-3 1.8-5.5 4.2-5.5S17 15 16 17.5c-.7 1.6-2.5 1.5-3.6 1-1 .7-3.9 1.3-3.9-.5Z" /></> },
  { id: 'tempolibero', name: 'Tempo libero', color: 'cielo', icon: <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5M12 3.5C9.5 5.8 8.2 8.7 8.2 12s1.3 6.2 3.8 8.5M3.5 12h17" /></> },
  { id: 'altro', name: 'Altro', color: 'menta', icon: <><circle cx="12" cy="12" r="8.5" /><circle cx="8.3" cy="12" r=".6" fill="currentColor" /><circle cx="12" cy="12" r=".6" fill="currentColor" /><circle cx="15.7" cy="12" r=".6" fill="currentColor" /></> },
]

const BY_COLOR = Object.fromEntries(THEMES.map((t) => [t.color, t.id]))
// liste create prima dei temi: il tema si ricava dal colore scelto allora
export const themeOf = (list) => THEMES.find((t) => t.id === (list?.theme || BY_COLOR[list?.color])) || THEMES[0]

export const ThemeIcon = ({ theme, size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {theme.icon}
  </svg>
)

export const ThemeBadge = ({ theme }) => (
  <span className="theme-badge"><ThemeIcon theme={theme} size={16} />{theme.name}</span>
)

export function ThemePicker({ value, onChange }) {
  return (
    <div className="theme-pick" role="radiogroup" aria-label="Tema della lista">
      {THEMES.map((t) => (
        <button key={t.id} type="button" role="radio" aria-checked={value === t.id} className={`theme-chip lc-${t.color} ${value === t.id ? 'on' : ''}`} onClick={() => onChange(t.id)}>
          <ThemeIcon theme={t} size={22} />
          <span>{t.name}</span>
        </button>
      ))}
    </div>
  )
}
