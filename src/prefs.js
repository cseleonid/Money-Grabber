// Preferenze di questo dispositivo (comodità per chi guarda): vista della lista e tema.
const KEY = 'mg:prefs'
export function getPrefs() {
  try { return { view: 'riquadri', group: false, theme: 'system', ...JSON.parse(localStorage.getItem(KEY) || '{}') } }
  catch { return { view: 'riquadri', group: false, theme: 'system' } }
}
export function setPrefs(patch) {
  const next = { ...getPrefs(), ...patch }
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ok */ }
  if ('theme' in patch) applyTheme(next.theme)
  return next
}
// "Sistema" lascia decidere al telefono/browser (o al tema scelto in claude.ai)
const hostTheme = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null
export function applyTheme(theme) {
  const el = document.documentElement
  if (theme === 'dark' || theme === 'light') el.setAttribute('data-theme', theme)
  else if (hostTheme) el.setAttribute('data-theme', hostTheme)
  else el.removeAttribute('data-theme')
}

// hook: ricarica la vista quando una preferenza cambia
import { useEffect, useState } from 'react'
export function usePrefs() {
  const [p, setP] = useState(getPrefs)
  useEffect(() => {
    const on = () => setP(getPrefs())
    window.addEventListener('mg-prefs', on)
    return () => window.removeEventListener('mg-prefs', on)
  }, [])
  return [p, (patch) => { setPrefs(patch); window.dispatchEvent(new Event('mg-prefs')) }]
}
