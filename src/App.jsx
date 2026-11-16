import { useEffect, useMemo, useRef, useState } from 'react'
import PieChart from './PieChart.jsx'
import { CategoryIcon, PaymentIcon, SectionIcon, OctoIcon } from './icons.jsx'
import AddWizard from './AddWizard.jsx'
import MovableBoxes from './Movable.jsx'
import { SECTIONS, sectionFromHash } from './sections.js'
import { applyTheme, getPrefs } from './prefs.js'
import AppSheet from './AppSheet.jsx'
import { Ico, I, PageHeader } from './Sheet.jsx'
import PersonaleSheet from './PersonaleSheet.jsx'
import CategoryPage from './CategoryPage.jsx'
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
  const [appSheet, setAppSheet] = useState(false)
  const [persSheet, setPersSheet] = useState(false)
  const [catPage, setCatPage] = useState(null) // categoria aperta in Personale
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

  // vista del grafico: tutte le spese del mese, solo carta o solo portafoglio (stesso filtro della lista)
  const viewExpenses = payFilter ? monthExpenses.filter((e) => paymentOf(e) === payFilter) : monthExpenses
  const viewTotal = viewExpenses.reduce((s, e) => s + e.amount, 0)
  const viewByCategory = categories.map((c) => ({
    ...c,
    value: viewExpenses.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0),
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
  const moveCategory = (id, delta) => {
    const i = categories.findIndex((c) => c.id === id), j = i + delta
    if (i < 0 || j < 0 || j >= categories.length) return
    const next = categories.slice(); [next[i], next[j]] = [next[j], next[i]]
    store.current?.setCategories(next)
  }
  const patchCategory = (id, patch) =>
    store.current?.setCategories(categories.map((c) => (c.id === id ? { ...c, ...patch } : c)))


  return (
    <div className="app">
      <div className="main">
        {section === 'personale' && !catPage && (
          <PageHeader title="Personale">
            <button type="button" className="round-btn scope-screen-btn" onClick={() => setPersSheet(true)} aria-label="Impostazioni di questa schermata">
              <Ico d={I.sliders} />
            </button>
          </PageHeader>
        )}
        {['calendario', 'todo', 'condivise'].includes(section) && <PageHeader title={current.name} />}
        {section === 'calendario' && <CalendarView items={state.lists?.cal || []} store={store.current} />}
        {section === 'spesa' && <ShoppingLists lists={state.lists?.shl || []} items={state.lists?.shop || []} store={store.current} />}
        {section === 'todo' && <TodoList items={state.lists?.todo || []} store={store.current} />}
        {section === 'condivise' && <SharedExpenses people={state.lists?.ppl || []} expenses={state.lists?.shx || []} store={store.current} />}
        {section === 'personale' && catPage && catById[catPage] && (
          <CategoryPage
            category={catById[catPage]}
            expenses={monthExpenses.filter((e) => e.categoryId === catPage)}
            monthTotal={total}
            monthName={monthLabel(month)}
            onBack={() => { setCatPage(null); window.scrollTo?.({ top: 0 }) }}
            onToggleSuperflua={(e) => patchExpense(e.id, { superflua: !e.superflua })}
            onRemove={removeExpense}
            isSuperflua={isSuperflua}
            paymentOf={paymentOf}
            pendingDelete={pendingDelete}
          />
        )}
        {section === 'personale' && !catPage && (<>

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


        <div className="pay-seg" role="radiogroup" aria-label="Quali spese mostrare">
          {[[null, 'Tutte', null], ['carta', 'Carta', 'carta'], ['portafoglio', 'Portafoglio', 'portafoglio']].map(([id, label, icon]) => (
            <button key={label} type="button" role="radio" aria-checked={payFilter === id} className={payFilter === id ? 'on' : ''} onClick={() => { setPayFilter(id); setFilter(null) }}>
              {icon && <PaymentIcon id={icon} size={18} />}{label}
            </button>
          ))}
        </div>
        <PieChart
          data={viewByCategory}
          total={viewTotal}
          centerLabel={payFilter === 'carta' ? 'Con carta' : payFilter === 'portafoglio' ? 'Dal portafoglio' : 'Totale del mese'}
          selected={filter}
          onSelect={(id) => setFilter(id)}
          onOpen={(id) => { setCatPage(id); window.scrollTo?.({ top: 0 }) }}
        />
        {total > 0 && (
          <div className="split-bar" aria-label="Come hai pagato le spese del mese">
            <div className="split-track">
              {[['carta', total - walletTotal], ['portafoglio', walletTotal]].filter(([, v]) => v > 0).map(([id, v]) => (
                <button key={id} type="button" className={`split-seg ${id} ${payFilter === id ? 'on' : ''} ${payFilter && payFilter !== id ? 'dim' : ''}`}
                  style={{ flexGrow: v }} onClick={() => { setPayFilter(payFilter === id ? null : id); setFilter(null) }}
                  aria-label={`${PAYMENTS[id].label}: ${formatEur(v)}, ${Math.round((v / total) * 100)}% del mese`} />
              ))}
            </div>
            <div className="split-legend">
              {[['carta', total - walletTotal], ['portafoglio', walletTotal]].map(([id, v]) => (
                <span key={id} className={`split-item ${id}`}>
                  <i aria-hidden="true" /><b>{PAYMENTS[id].label}</b> {formatEur(v)} <small>{Math.round((v / total) * 100)}%</small>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="in-card-sec">
        <div className="card-head sub-head">
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
        </div>
        <div className="add-inner-box">
        <AddWizard
          embedded
          history={expenses}
          categories={categories}
          payments={PAYMENTS}
          onAdd={(e) => { store.current?.addExpense(e); setMonth(monthKey(e.date)) }}
        />
        </div>
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
            <button type="button" className="octo-item octo-settings" onClick={() => { setOctoOpen(false); setAppSheet(true) }}>
              <span className="octo-emoji" aria-hidden="true"><Ico d={I.gear} size={22} /></span>
              <span className="octo-name">Impostazioni</span>
            </button>
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
      {persSheet && (
        <PersonaleSheet categories={categories} patchCategory={patchCategory} moveCategory={moveCategory} layout={state.layout}
          setLayout={(l) => store.current?.setLayout(l)} onClose={() => setPersSheet(false)} />
      )}
      {appSheet && <AppSheet onClose={() => setAppSheet(false)} />}
    </div>
  )
}
