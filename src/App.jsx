import { useEffect, useMemo, useRef, useState } from 'react'
import PieChart from './PieChart.jsx'
import { CategoryIcon, PaymentIcon, SectionIcon, OctoIcon } from './icons.jsx'
import AddWizard from './AddWizard.jsx'
import MovableBoxes from './Movable.jsx'
import { SECTIONS, sectionFromHash } from './sections.js'
import { applyTheme, getPrefs } from './prefs.js'
import CalendarView from './mini/CalendarView.jsx'
import ShoppingLists from './mini/ShoppingLists.jsx'
import TodoList from './mini/TodoList.jsx'
import SharedExpenses from './mini/SharedExpenses.jsx'
import {
  createStore, DEFAULT_CATEGORIES, formatEur, monthKey, monthLabel, shiftMonth, todayISO,
} from './data.js'


export const PAYMENTS = { carta: { label: 'Carta', icon: '💳' }, portafoglio: { label: 'Portafoglio', icon: '👛' } }
const paymentOf = (e) => (e.payment === 'portafoglio' ? 'portafoglio' : 'carta')

const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']

export default function App() {
  const [state, setState] = useState({ expenses: [], categories: DEFAULT_CATEGORIES, loading: true })
  const store = useRef(null)
  // forza un nuovo render quando il salvataggio è pronto (serve ai mini-siti aperti da link diretto)
  const [, setStoreReady] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [month, setMonth] = useState(() => monthKey(todayISO()))
  const [filter, setFilter] = useState(null)
  const [payFilter, setPayFilter] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showMonths, setShowMonths] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  // sezione corrente (mini-sito) dal pallino 🐙, sincronizzata con #hash
  const [section, setSection] = useState(sectionFromHash)
  const [octoOpen, setOctoOpen] = useState(false)
  useEffect(() => { applyTheme(getPrefs().theme) }, [])
  const octoRef = useRef(null)
  useEffect(() => {
    const onHash = () => setSection(sectionFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.section = section
    window.scrollTo?.({ top: 0 })
  }, [section])
  useEffect(() => {
    if (!octoOpen) return
    const close = (e) => { if (octoRef.current && !octoRef.current.contains(e.target)) setOctoOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setOctoOpen(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc) }
  }, [octoOpen])
  const openSection = (id) => {
    setSection(id)
    setOctoOpen(false)
    try { history.replaceState(null, '', id === 'personale' ? location.pathname + location.search : '#' + id) } catch { location.hash = id }
  }
  const current = SECTIONS.find((x) => x.id === section)

  // pallino trascinabile: posizione ricordata su questo dispositivo
  const [octoPos, setOctoPos] = useState(() => { try { return JSON.parse(localStorage.getItem('mg:octo')) } catch { return null } })
  const [octoDragging, setOctoDragging] = useState(false)
  const octoDrag = useRef(null)
  const clampPos = (r, b) => ({
    r: Math.min(Math.max(8, r), window.innerWidth - 68),
    b: Math.min(Math.max(8, b), window.innerHeight - 68),
  })
  const octoDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const rect = e.currentTarget.getBoundingClientRect()
    octoDrag.current = { x0: e.clientX, y0: e.clientY, r0: window.innerWidth - rect.right, b0: window.innerHeight - rect.bottom, moved: false }
  }
  const octoMove = (e) => {
    const d = octoDrag.current
    if (!d) return
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0
    if (!d.moved && Math.hypot(dx, dy) < 6) return
    if (!d.moved) { d.moved = true; setOctoDragging(true); setOctoOpen(false) }
    setOctoPos(clampPos(d.r0 - dx, d.b0 - dy))
  }
  const octoUp = () => {
    const d = octoDrag.current
    if (!d) return
    setOctoDragging(false)
    if (d.moved) {
      setOctoPos((pos) => { try { localStorage.setItem('mg:octo', JSON.stringify(pos)) } catch { /* ok */ } return pos })
      setTimeout(() => { octoDrag.current = null }, 0)
    } else octoDrag.current = null
  }
  useEffect(() => {
    const onResize = () => setOctoPos((p) => (p ? clampPos(p.r, p.b) : p))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  // il menu si apre dal lato dove c'è spazio
  const octoPlace = {
    up: !octoPos || octoPos.b < window.innerHeight / 2,
    right: !octoPos || octoPos.r < window.innerWidth / 2,
  }
  useEffect(() => {
    if (!menuOpen) return
    const esc = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [menuOpen])
  const monthDdRef = useRef(null)
  useEffect(() => {
    if (!showMonths) return
    const close = (e) => { if (monthDdRef.current && !monthDdRef.current.contains(e.target)) setShowMonths(false) }
    const esc = (e) => { if (e.key === 'Escape') setShowMonths(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc) }
  }, [showMonths])

  useEffect(() => {
    let alive = true
    createStore((s) => alive && setState(s)).then((st) => { if (alive) { store.current = st; setStoreReady(true) } })
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
      {section === 'personale' && <button type="button" className="side-tab" onClick={() => setMenuOpen(true)} aria-label="Apri menu" aria-expanded={menuOpen} aria-controls="side-menu">
        <span>tester</span>
      </button>}
      {menuOpen && <div className="side-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <aside id="side-menu" className={`side ${menuOpen ? 'open' : ''}`} aria-label="Menu">
        <div className="side-head">
          <h1>Money Grabber</h1>
          <button type="button" className="side-close" onClick={() => setMenuOpen(false)} aria-label="Chiudi menu">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <nav className="side-nav">
          <button
            type="button"
            className={`side-item ${showSettings ? 'on' : ''}`}
            aria-expanded={showSettings}
            onClick={() => {
              setShowSettings((v) => !v)
              setMenuOpen(false)
              setTimeout(() => document.querySelector('.settings')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
            }}
          >
            <span className="gear"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg></span>
            Gestisci categorie
          </button>
        </nav>
      </aside>
      <div className="main">
        {section !== 'personale' && section !== 'spesa' && (
          <header className="section-head">
            <span className="section-emoji" aria-hidden="true"><SectionIcon id={current.id} size={30} /></span>
            <div>
              <h1>{current.name}</h1>
              <p>{current.hint}</p>
            </div>
          </header>
        )}
        {section === 'calendario' && <CalendarView items={state.lists?.cal || []} store={store.current} />}
        {section === 'spesa' && <ShoppingLists lists={state.lists?.shl || []} items={state.lists?.shop || []} store={store.current} />}
        {section === 'todo' && <TodoList items={state.lists?.todo || []} store={store.current} />}
        {section === 'condivise' && <SharedExpenses people={state.lists?.ppl || []} expenses={state.lists?.shx || []} store={store.current} />}
        {section === 'personale' && (<>

      {state.error && <p className="error-msg">⚠ {state.error}. Ricarica la pagina e riprova.</p>}
      {state.loading && <p className="empty-msg">Caricamento delle tue spese…</p>}

        <MovableBoxes
          layout={state.layout}
          onChange={(l) => store.current?.setLayout(l)}
          blocks={{
            grafico: (<>
      <section className="card">
        <div className="card-head month-head">
          <span className="month-prefix">Spese di</span>
          <div className="month-dd" ref={monthDdRef}>
            <button
              type="button"
              className={`month-title-btn ${showMonths ? 'on' : ''}`}
              onClick={() => setShowMonths((v) => !v)}
              aria-haspopup="true"
              aria-expanded={showMonths}
              aria-controls="month-grid"
            >
              <span className="month-title-text"><b>{monthLabel(month)}</b></span>
            </button>
            {showMonths && (
              <div id="month-grid" className="month-panel month-dropdown" role="dialog" aria-label="Scegli il mese">
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
          </div>
        </div>

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
          <span className="ps-item"><b>Carta</b> {formatEur(total - walletTotal)}</span><span className="ps-sep" aria-hidden="true">·</span><span className="ps-item"><b>Portafoglio</b> {formatEur(walletTotal)}</span>
        </p>
      </section>
            </>),
            portafoglio: (<>
      <section className="card wallet-card">
        <div className="card-head">
          <h2 className="with-icon"><PaymentIcon id="portafoglio" size={24} /> Portafoglio · {monthLabel(month)}</h2>
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
            </>),
            aggiungi: (<>
      <AddWizard
        categories={categories}
        payments={PAYMENTS}
        onAdd={(e) => { store.current?.addExpense(e); setMonth(monthKey(e.date)) }}
      />
            </>),
            lista: (<>
      <section className="card">
        <div className="card-head">
          <h2>
            Lista spese {filter && <small>· {catById[filter]?.name}</small>}
            {payFilter && <small> · {PAYMENTS[payFilter].label}</small>}
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
                      {e.noDate ? 'senza data' : new Date(e.date + 'T00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} · {c?.name ?? '—'} · <PaymentIcon id={paymentOf(e)} size={14} />
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
            </>),
            superflue: (<>
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
          <p className="empty-msg">Nessuna spesa superflua questo mese.</p>
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
                    {catById[e.categoryId]?.name} · <PaymentIcon id={paymentOf(e)} size={14} /> · {e.superflua ? 'segnata a mano' : 'auto per categoria'}
                  </span>
                </div>
                <span className="expense-amount">{formatEur(e.amount)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="hint">Spunta una spesa quando l'hai controllata (es. abbonamento disdetto o confermato).</p>
      </section>
            </>),
          }}
        />
        </>)}
      </div>

      {/* pallino 🐙 con i mini-siti */}
      <div
        className={`octo ${octoOpen ? 'open' : ''} ${octoPlace.up ? '' : 'below'} ${octoPlace.right ? '' : 'left'} ${octoDragging ? 'dragging' : ''}`}
        ref={octoRef}
        style={octoPos ? {
          ...(octoPlace.right ? { right: octoPos.r } : { left: window.innerWidth - octoPos.r - 60 }),
          ...(octoPlace.up ? { bottom: octoPos.b } : { top: window.innerHeight - octoPos.b - 60 }),
        } : undefined}
      >
        {octoOpen && (
          <nav className="octo-menu" aria-label="Sezioni">
            {SECTIONS.map((x) => (
              <button
                key={x.id}
                type="button"
                className={`octo-item sec-${x.id} ${x.id === section ? 'on' : ''}`}
                aria-current={x.id === section ? 'page' : undefined}
                onClick={() => openSection(x.id)}
              >
                <span className="octo-emoji" aria-hidden="true"><SectionIcon id={x.id} size={24} /></span>
                <span className="octo-name">{x.name}</span>
              </button>
            ))}
          </nav>
        )}
        <button
          type="button"
          className="octo-btn"
          onClick={() => { if (octoDrag.current?.moved) return; setOctoOpen((v) => !v) }}
          onPointerDown={octoDown}
          onPointerMove={octoMove}
          onPointerUp={octoUp}
          onPointerCancel={octoUp}
          aria-label="Apri le sezioni (trascina per spostare)"
          aria-expanded={octoOpen}
        >
          <OctoIcon size={30} />
        </button>
      </div>
    </div>
  )
}
