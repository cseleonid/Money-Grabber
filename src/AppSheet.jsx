import Sheet, { IconChoice } from './Sheet.jsx'
import { usePrefs } from './prefs.js'

// Impostazioni generali (valgono per tutta l'app): per ora il tema.
const Phone = ({ mode }) => (
  <span className={`phone-prev ${mode}`} aria-hidden="true">
    <span className="pp-line" /><span className="pp-row red"><i /><i /><i /></span>
    <span className="pp-line short" /><span className="pp-row green"><i /><i /><i /></span>
    <span className="pp-bar" />
  </span>
)

export default function AppSheet({ onClose }) {
  const [prefs, setPrefs] = usePrefs()
  return (
    <Sheet scope="app" label="Tutta l'app" title="Impostazioni" onClose={onClose}>
      <IconChoice
        label="Tema"
        value={prefs.theme}
        onChange={(theme) => setPrefs({ theme })}
        options={[
          { id: 'dark', label: 'Scuro', art: <Phone mode="dark" /> },
          { id: 'light', label: 'Chiaro', art: <Phone mode="light" /> },
          { id: 'system', label: 'Automatico', art: <Phone mode="system" /> },
        ]}
      />
    </Sheet>
  )
}
