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
const eurInt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
// cifre intere senza decimali (0 €, 650 €); con centesimi a due decimali (23,40 €)
export const formatEur = (n) => (Math.round(n * 100) % 100 === 0 ? eurInt : eur).format(n)

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()))

// ---------------------------------------------------------------------------
// Persistenza.
// Pubblicata come Artifact su claude.ai: dati salvati nel tuo account
// (capability `db`, area privata per utente) -> stessi dati da telefono e PC.
// In locale (npm run dev) o se il db non è disponibile: localStorage.
//
// Oltre alle spese ("exp-"), ogni mini-sito ha la sua lista di documenti,
// identificata da un prefisso nell'id del documento:
//   cal-  eventi del calendario      shop- lista della spesa
//   todo- attività                   shx-  spese condivise    ppl- persone
// ---------------------------------------------------------------------------
export const LIST_KINDS = ['cal', 'shop', 'todo', 'shx', 'ppl']
const emptyLists = () => Object.fromEntries(LIST_KINDS.map((k) => [k, []]))

export async function createStore(onState) {
  let state = loadState()
  state = { ...state, lists: { ...emptyLists(), ...(state.lists || {}) } }
  const emit = () => onState({ ...state })

  const db = window.claude?.use ? await window.claude.use('db').catch(() => null) : null
  const user = db && window.claude?.use ? await window.claude.use('user').catch(() => null) : null
  const uidUser = user ? await user.id().catch(() => null) : null

  const withList = (kind, fn) => ({ ...state, lists: { ...state.lists, [kind]: fn(state.lists[kind] || []) } })

  if (!db || !uidUser) {
    emit()
    const commit = (next) => { state = next; saveState(state); emit() }
    return {
      mode: 'local',
      addExpense: (e) => commit({ ...state, expenses: [...state.expenses, e] }),
      patchExpense: (id, p) => commit({ ...state, expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...p } : e)) }),
      removeExpense: (id) => commit({ ...state, expenses: state.expenses.filter((e) => e.id !== id) }),
      setCategories: (categories) => commit({ ...state, categories }),
      setLayout: (layout) => commit({ ...state, layout }),
      addItem: (kind, item) => commit(withList(kind, (l) => [...l, item])),
      patchItem: (kind, id, p) => commit(withList(kind, (l) => l.map((x) => (x.id === id ? { ...x, ...p } : x)))),
      removeItem: (kind, id) => commit(withList(kind, (l) => l.filter((x) => x.id !== id))),
    }
  }

  const base = `data/users/${uidUser}`
  const col = db.collection(base)
  const settingsRef = db.doc(`${base}/settings`)
  state = { expenses: [], categories: DEFAULT_CATEGORIES, lists: emptyLists(), loading: true }
  emit()

  await new Promise((resolve) => {
    const timer = setTimeout(resolve, 10000)
    col.onSnapshot(
      (snap) => {
        const expenses = []
        const lists = emptyLists()
        let categories = state.categories
        let layout = state.layout ?? null
        snap.docs.forEach((d) => {
          const data = d.data()
          if (!data) return
          if (d.id === 'settings') { categories = data.categories ?? DEFAULT_CATEGORIES; layout = data.layout ?? null; return }
          if (d.id.startsWith('exp-')) { expenses.push({ ...data, id: d.id }); return }
          const kind = d.id.split('-')[0]
          if (lists[kind]) lists[kind].push({ ...data, id: d.id })
        })
        state = { expenses, categories, lists, layout, loading: false }
        emit()
        clearTimeout(timer)
        resolve()
      },
      (err) => {
        state = { ...state, loading: false, error: err?.message || 'Errore di caricamento' }
        emit()
        clearTimeout(timer)
        resolve()
      },
    )
  })

  const fail = (err) => { state = { ...state, error: err?.message || 'Salvataggio non riuscito' }; emit() }
  const strip = ({ id, ...rest }) => rest

  return {
    mode: 'cloud',
    addExpense: (e) => {
      const id = 'exp-' + e.id
      state = { ...state, expenses: [...state.expenses, { ...e, id }] }; emit()
      db.doc(`${base}/${id}`).set(strip(e)).catch(fail)
    },
    patchExpense: (id, p) => {
      state = { ...state, expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...p } : e)) }; emit()
      db.doc(`${base}/${id}`).update(p).catch(fail)
    },
    removeExpense: (id) => {
      state = { ...state, expenses: state.expenses.filter((e) => e.id !== id) }; emit()
      db.doc(`${base}/${id}`).delete().catch(fail)
    },
    setCategories: (categories) => {
      state = { ...state, categories }; emit()
      settingsRef.set({ categories, ...(state.layout ? { layout: state.layout } : {}) }).catch(fail)
    },
    setLayout: (layout) => {
      state = { ...state, layout }; emit()
      settingsRef.set({ categories: state.categories, layout }).catch(fail)
    },
    addItem: (kind, item) => {
      const id = `${kind}-${item.id}`
      state = withList(kind, (l) => [...l, { ...item, id }]); emit()
      db.doc(`${base}/${id}`).set(strip(item)).catch(fail)
    },
    patchItem: (kind, id, p) => {
      state = withList(kind, (l) => l.map((x) => (x.id === id ? { ...x, ...p } : x))); emit()
      db.doc(`${base}/${id}`).update(p).catch(fail)
    },
    removeItem: (kind, id) => {
      state = withList(kind, (l) => l.filter((x) => x.id !== id)); emit()
      db.doc(`${base}/${id}`).delete().catch(fail)
    },
  }
}
