// Categorie predefinite. L'ordine è fisso: ogni categoria tiene sempre lo
// stesso colore (slot), indipendentemente da quanto spende.
export const DEFAULT_CATEGORIES = [
  { id: 'casa', name: 'Casa', slot: 1, autoSuperflua: false },
  { id: 'alimentari', name: 'Alimentari', slot: 2, autoSuperflua: false },
  { id: 'trasporti', name: 'Trasporti', slot: 3, autoSuperflua: false },
  { id: 'bollette', name: 'Bollette', slot: 4, autoSuperflua: false },
  { id: 'salute', name: 'Salute', slot: 5, autoSuperflua: false },
  { id: 'svago', name: 'Svago', slot: 6, autoSuperflua: true },
  { id: 'abbonamenti', name: 'Abbonamenti', slot: 7, autoSuperflua: true },
  { id: 'altro', name: 'Altro', slot: 8, autoSuperflua: false },
]

const KEY = 'money-grabber:v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.expenses) && Array.isArray(parsed.categories)) {
        return parsed
      }
    }
  } catch {
    /* storage non disponibile: si riparte vuoti */
  }
  return { expenses: [], categories: DEFAULT_CATEGORIES }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignora: l'app funziona comunque in memoria */
  }
}

export const monthKey = (date) => date.slice(0, 7) // "YYYY-MM"

export function todayISO() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number)
  const s = new Date(y, m - 1, 1).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
export const formatEur = (n) => eur.format(n)

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()))
