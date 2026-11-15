import { useEffect, useMemo, useRef, useState } from 'react'
import PieChart from './PieChart.jsx'
import { CategoryIcon } from './icons.jsx'
import AddWizard from './AddWizard.jsx'
import {
  createStore, DEFAULT_CATEGORIES, formatEur, monthKey, monthLabel, shiftMonth, todayISO,
} from './data.js'


export const PAYMENTS = { carta: { label: 'Carta', icon: '💳' }, portafoglio: { label: 'Portafoglio', icon: '👛' } }
const paymentOf = (e) => (e.payment === 'portafoglio' ? 'portafoglio' : 'carta')

const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']

export default function App() {
  const [state, setState] = useState({ expenses: [], categories: DEFAULT_CATEGORIES, loading: true })
  const store = useRef(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [month, setMonth] = useState(() => monthKey(todayISO()))
  const [filter, setFilter] = useState(null)
  const [payFilter, setPayFilter] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showMonths, setShowMonths] = useState(false)

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

  const walletExpenses = monthExpenses.filter((e) => paymentOf(e) === 'portafoglio')
  const walletTotal = walletExpenses.reduce((s, e) => s + e.amount, 0)
  const walletByCategory = categories.map((c) => ({
    ...c,
    value: walletExpenses.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0),
  }))

  const listed = monthExpenses
    .filter((e) => !filter || e.categoryId === filter)
    .filter((e) => !payFilter || paymentOf(e) === payFilter)
  const superflue = monthExpenses.filter(isSuperflua)
  const superflueTotal = superflue.reduce((s, e) => s + e.amount, 0)
  const daControllare = superflue.filter((e) => !e.controllata)

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


  return (
    <div className="app">
      <header className="top">
        <h1>Money Grabber</h1>
        <button
          type="button"
          className={`gear ${showSettings ? 'on' : ''}`}
          onClick={() => setShowSettings((v) => !v)}
          aria-label={showSettings ? 'Chiudi gestione categorie' : 'Gestisci categorie'}
          aria-expanded={showSettings}
          title={showSettings ? 'Chiudi gestione categorie' : 'Gestisci categorie'}
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      {state.error && <p className="error-msg">⚠ {state.error}. Ricarica la pagina e riprova.</p>}
      {state.loading && <p className="empty-msg">Caricamento delle tue spese…</p>}

      {/* 1. Grafico a torta per macro categorie */}
      <section className="card">
        <div className="card-head month-head">
          <button
            type="button"
            className={`month-title-btn ${showMonths ? 'on' : ''}`}
            onClick={() => setShowMonths((v) => !v)}
            aria-expanded={showMonths}
            aria-controls="month-grid"
          >
            <span className="month-title-text">Spese di <b>{monthLabel(month)}</b></span>
            <svg className="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>
        {showMonths && (
          <div id="month-grid" className="month-panel">
            <div className="year-row">
              <button type="button" onClick={() => setMonth((m) => shiftMonth(m, -12))} aria-label="Anno precedente">‹</button>
              <span>{month.slice(0, 4)}</span>
              <button type="button" onClick={() => setMonth((m) => shiftMonth(m, 12))} aria-label="Anno successivo">›</button>
            </div>
            <div className="month-grid">
              {MONTHS.map((name, i) => {
                const key = `${month.slice(0, 4)}-${String(i + 1).padStart(2, '0')}`
                const isNow = key === monthKey(todayISO())
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${key === month ? 'on' : ''} ${isNow ? 'now' : ''}`}
                    aria-pressed={key === month}
                    onClick={() => { setMonth(key); setShowMonths(false) }}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {showSettings && (
          <div className="settings">
            <p className="hint">Rinomina le categorie e scegli quali sono <b>superflue in automatico</b>.</p>
            {categories.map((c) => (
              <div className="settings-row" key={c.id}>
                <CategoryIcon id={c.id} slot={c.slot} size={26} />
                <input value={c.name} onChange={(e) => patchCategory(c.id, { name: e.target.value })} aria-label="Nome categoria" />
                <label className="check">
                  <input type="checkbox" checked={c.autoSuperflua} onChange={(e) => patchCategory(c.id, { autoSuperflua: e.target.checked })} />
                  superflua
                </label>
              </div>
            ))}
          </div>
        )}

        <PieChart data={byCategory} total={total} selected={filter} onSelect={(id) => { setFilter(id); setPayFilter(null) }} />
        <p className="pay-split">
          <b>Carta</b> {formatEur(total - walletTotal)} · <b>Portafoglio</b> {formatEur(walletTotal)}
        </p>
      </section>

      {/* 1b. Grafico dedicato al portafoglio */}
      <section className="card">
        <div className="card-head">
          <h2>👛 Portafoglio · {monthLabel(month)}</h2>
          {walletExpenses.length > 0 && (
            <button type="button" className="link" onClick={() => { setPayFilter('portafoglio'); setFilter(null) }}>
              Vedi in lista
            </button>
          )}
        </div>
        <PieChart
          data={walletByCategory}
          hideEmpty
          total={walletTotal}
          selected={payFilter === 'portafoglio' ? filter : null}
          onSelect={(id) => { setFilter(id); setPayFilter(id ? 'portafoglio' : null) }}
        />
      </section>

      {/* Inserimento a passaggi */}
      <AddWizard
        categories={categories}
        payments={PAYMENTS}
        onAdd={(e) => { store.current?.addExpense(e); setMonth(monthKey(e.date)) }}
      />

      {/* 2. Lista spese */}
      <section className="card">
        <div className="card-head">
          <h2>
            Lista spese {filter && <small>· {catById[filter]?.name}</small>}
            {payFilter && <small> · {PAYMENTS[payFilter].icon} {PAYMENTS[payFilter].label}</small>}
          </h2>
          {(filter || payFilter) && (
            <button type="button" className="link" onClick={() => { setFilter(null); setPayFilter(null) }}>Mostra tutte</button>
          )}
        </div>
        {listed.length === 0 ? (
          <p className="empty-msg">Nessuna spesa {filter || payFilter ? 'con questo filtro' : 'in questo mese'}.</p>
        ) : (
          <ul className="expense-list">
            {listed.map((e) => {
              const c = catById[e.categoryId]
              const auto = !!c?.autoSuperflua
              return (
                <li key={e.id} className="expense">
                  <span className="icon-chip"><CategoryIcon id={c?.id} slot={c?.slot} size={26} /></span>
                  <div className="expense-main">
                    <span className="expense-desc">{e.description}</span>
                    <span className="expense-meta">
                      {new Date(e.date + 'T00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} · {c?.name ?? '—'} · {PAYMENTS[paymentOf(e)].icon}
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
          <h2>Spese superflue da controllare</h2>
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
                <span className="icon-chip"><CategoryIcon id={e.categoryId} slot={catById[e.categoryId]?.slot} size={26} /></span>
                <div className="expense-main">
                  <span className="expense-desc">{e.description}</span>
                  <span className="expense-meta">
                    {catById[e.categoryId]?.name} · {PAYMENTS[paymentOf(e)].icon} · {e.superflua ? 'segnata a mano' : 'auto per categoria'}
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
