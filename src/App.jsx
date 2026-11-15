import { useEffect, useMemo, useRef, useState } from 'react'
import PieChart from './PieChart.jsx'
import {
  createStore, DEFAULT_CATEGORIES, formatEur, monthKey, monthLabel, shiftMonth, todayISO, uid,
} from './data.js'

const emptyForm = () => ({ description: '', amount: '', date: todayISO(), categoryId: 'alimentari', superflua: false })

export default function App() {
  const [state, setState] = useState({ expenses: [], categories: DEFAULT_CATEGORIES, loading: true })
  const store = useRef(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [month, setMonth] = useState(() => monthKey(todayISO()))
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    let alive = true
    createStore((s) => alive && setState(s)).then((st) => { if (alive) store.current = st })
    return () => { alive = false }
  }, [])

  const { expenses, categories } = state
  const catById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])

  const isSuperflua = (e) => e.superflua || !!catById[e.categoryId]?.autoSuperflua

  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(e.date) === month).sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, month],
  )
  const total = monthExpenses.reduce((s, e) => s + e.amount, 0)

  const byCategory = categories.map((c) => ({
    ...c,
    value: monthExpenses.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0),
  }))

  const listed = filter ? monthExpenses.filter((e) => e.categoryId === filter) : monthExpenses
  const superflue = monthExpenses.filter(isSuperflua)
  const superflueTotal = superflue.reduce((s, e) => s + e.amount, 0)
  const daControllare = superflue.filter((e) => !e.controllata)

  const addExpense = (ev) => {
    ev.preventDefault()
    const amount = parseFloat(String(form.amount).replace(',', '.'))
    if (!form.description.trim() || !(amount > 0)) return
    const expense = {
      id: uid(),
      description: form.description.trim(),
      amount: Math.round(amount * 100) / 100,
      date: form.date,
      categoryId: form.categoryId,
      superflua: form.superflua,
      controllata: false,
    }
    if (!store.current) return
    store.current.addExpense(expense)
    setMonth(monthKey(form.date))
    setForm((f) => ({ ...emptyForm(), date: f.date, categoryId: f.categoryId }))
  }

  const patchExpense = (id, patch) => store.current?.patchExpense(id, patch)
  const removeExpense = (id) => {
    // niente confirm(): primo tocco arma, secondo tocco elimina
    if (pendingDelete === id) {
      store.current?.removeExpense(id)
      setPendingDelete(null)
    } else {
      setPendingDelete(id)
      setTimeout(() => setPendingDelete((p) => (p === id ? null : p)), 3000)
    }
  }
  const patchCategory = (id, patch) =>
    store.current?.setCategories(categories.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const formAuto = !!catById[form.categoryId]?.autoSuperflua

  return (
    <div className="app">
      <header className="top">
        <h1>Money Grabber</h1>
        <div className="month-nav">
          <button type="button" onClick={() => setMonth((m) => shiftMonth(m, -1))} aria-label="Mese precedente">‹</button>
          <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Mese" />
          <button type="button" onClick={() => setMonth((m) => shiftMonth(m, 1))} aria-label="Mese successivo">›</button>
        </div>
      </header>

      {state.error && <p className="error-msg">⚠ {state.error}. Ricarica la pagina e riprova.</p>}
      {state.loading && <p className="empty-msg">Caricamento delle tue spese…</p>}

      {/* 1. Grafico a torta per macro categorie */}
      <section className="card">
        <div className="card-head">
          <h2>Spese di {monthLabel(month)}</h2>
          <button type="button" className="link" onClick={() => setShowSettings((v) => !v)}>
            {showSettings ? 'Chiudi categorie' : 'Gestisci categorie'}
          </button>
        </div>

        {showSettings && (
          <div className="settings">
            <p className="hint">Rinomina le categorie e scegli quali sono <b>superflue in automatico</b>.</p>
            {categories.map((c) => (
              <div className="settings-row" key={c.id}>
                <span className="swatch" style={{ background: `var(--series-${c.slot})` }} />
                <input value={c.name} onChange={(e) => patchCategory(c.id, { name: e.target.value })} aria-label="Nome categoria" />
                <label className="check">
                  <input type="checkbox" checked={c.autoSuperflua} onChange={(e) => patchCategory(c.id, { autoSuperflua: e.target.checked })} />
                  superflua
                </label>
              </div>
            ))}
          </div>
        )}

        <PieChart data={byCategory} total={total} selected={filter} onSelect={setFilter} />
      </section>

      {/* Inserimento */}
      <section className="card">
        <h2>Aggiungi spesa</h2>
        <form className="add-form" onSubmit={addExpense}>
          <input
            placeholder="Descrizione (es. Spesa Esselunga)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            placeholder="Importo €"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="check">
            <input
              type="checkbox"
              checked={form.superflua || formAuto}
              disabled={formAuto}
              onChange={(e) => setForm({ ...form, superflua: e.target.checked })}
            />
            Superflua {formAuto && <small>(auto per categoria)</small>}
          </label>
          <button type="submit" className="primary">Aggiungi</button>
        </form>
      </section>

      {/* 2. Lista spese */}
      <section className="card">
        <div className="card-head">
          <h2>Lista spese {filter && <small>· {catById[filter]?.name}</small>}</h2>
          {filter && <button type="button" className="link" onClick={() => setFilter(null)}>Mostra tutte</button>}
        </div>
        {listed.length === 0 ? (
          <p className="empty-msg">Nessuna spesa {filter ? 'in questa categoria' : 'in questo mese'}.</p>
        ) : (
          <ul className="expense-list">
            {listed.map((e) => {
              const c = catById[e.categoryId]
              const auto = !!c?.autoSuperflua
              return (
                <li key={e.id} className="expense">
                  <span className="swatch" style={{ background: `var(--series-${c?.slot ?? 8})` }} />
                  <div className="expense-main">
                    <span className="expense-desc">{e.description}</span>
                    <span className="expense-meta">
                      {new Date(e.date + 'T00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} · {c?.name ?? '—'}
                      {isSuperflua(e) && <span className="badge">superflua</span>}
                    </span>
                  </div>
                  <span className="expense-amount">{formatEur(e.amount)}</span>
                  <div className="expense-actions">
                    <button
                      type="button"
                      className="icon"
                      title={auto ? 'Superflua per categoria' : e.superflua ? 'Togli da superflue' : 'Segna come superflua'}
                      disabled={auto}
                      onClick={() => patchExpense(e.id, { superflua: !e.superflua })}
                    >
                      {isSuperflua(e) ? '★' : '☆'}
                    </button>
                    <button
                      type="button"
                      className={`icon ${pendingDelete === e.id ? 'danger' : ''}`}
                      title={pendingDelete === e.id ? 'Tocca di nuovo per eliminare' : 'Elimina'}
                      onClick={() => removeExpense(e.id)}
                    >
                      {pendingDelete === e.id ? 'Elimina?' : '✕'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* 3. Box spese superflue da controllare */}
      <section className="card superflue">
        <div className="card-head">
          <h2>⚠️ Spese superflue da controllare</h2>
        </div>
        <div className="super-stats">
          <div>
            <span className="stat-label">Totale superfluo</span>
            <span className="stat-value">{formatEur(superflueTotal)}</span>
          </div>
          <div>
            <span className="stat-label">Sul totale del mese</span>
            <span className="stat-value">{total ? ((superflueTotal / total) * 100).toFixed(0) : 0}%</span>
          </div>
          <div>
            <span className="stat-label">Da controllare</span>
            <span className="stat-value">{daControllare.length}</span>
          </div>
        </div>
        {superflue.length === 0 ? (
          <p className="empty-msg">Nessuna spesa superflua questo mese. 👏</p>
        ) : (
          <ul className="expense-list">
            {superflue.map((e) => (
              <li key={e.id} className={`expense ${e.controllata ? 'done' : ''}`}>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={!!e.controllata}
                    onChange={(ev) => patchExpense(e.id, { controllata: ev.target.checked })}
                    aria-label="Controllata"
                  />
                </label>
                <div className="expense-main">
                  <span className="expense-desc">{e.description}</span>
                  <span className="expense-meta">
                    {catById[e.categoryId]?.name} · {e.superflua ? 'segnata a mano' : 'auto per categoria'}
                  </span>
                </div>
                <span className="expense-amount">{formatEur(e.amount)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="hint">Spunta una spesa quando l'hai controllata (es. abbonamento disdetto o confermato).</p>
      </section>
    </div>
  )
}
