import { CategoryIcon, PaymentIcon } from './icons.jsx'
import { formatEur } from './data.js'
import { Ico, I } from './Sheet.jsx'
import { useLongPressReveal } from './longPress.js'

// Pagina di una categoria: tutte le sue spese del mese, con totale e quota sul mese.
export default function CategoryPage({ category, expenses, monthTotal, monthName, onBack, onToggleSuperflua, onRemove, isSuperflua, paymentOf, pendingDelete }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const lp = useLongPressReveal()
  const pct = monthTotal ? Math.round((total / monthTotal) * 100) : 0
  const sorted = expenses.slice().sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="cat-page">
      <div className="shop-bar">
        <button type="button" className="shop-back" onClick={onBack}><span aria-hidden="true">‹</span> Le mie spese</button>
      </div>
      <header className="cat-hero" style={{ '--c': `var(--series-${category.slot})` }}>
        <span className="cat-hero-icon"><CategoryIcon id={category.id} slot={category.slot} size={44} /></span>
        <h1>{category.name}</h1>
        <p className="cat-hero-month">{monthName}</p>
        <p className="cat-hero-total">{formatEur(total)}</p>
        <p className="cat-hero-pct">{pct}% delle spese del mese · {expenses.length} {expenses.length === 1 ? 'spesa' : 'spese'}</p>
      </header>
      <section className="card">
        {sorted.length === 0 ? (
          <p className="empty-msg">Nessuna spesa in questa categoria questo mese.</p>
        ) : (
          <ul className="expense-list">
            {sorted.map((e) => (
              <li key={e.id} className={`expense ${lp.revealed === e.id ? 'revealed' : ''}`} {...lp.bind(e.id)}>
                <div className="expense-main">
                  <span className="expense-desc">{e.description}</span>
                  <span className="expense-meta">
                    {e.noDate ? 'senza data' : new Date(e.date + 'T00:00').toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' })}
                    {' · '}<PaymentIcon id={paymentOf(e)} size={14} />
                    {isSuperflua(e) && <span className="badge">superflua</span>}
                  </span>
                </div>
                <span className="expense-amount">{formatEur(e.amount)}</span>
                <div className="expense-actions">
                  <button type="button" className="icon" onClick={() => onToggleSuperflua(e)} aria-label={isSuperflua(e) ? 'Togli da superflue' : 'Segna come superflua'}>
                    {isSuperflua(e) ? '★' : '☆'}
                  </button>
                  {lp.revealed === e.id && (
                    <button type="button" className={`icon del-btn ${pendingDelete === e.id ? 'danger' : ''}`} onClick={() => { onRemove(e.id); if (pendingDelete === e.id) lp.hide() }} aria-label="Elimina" autoFocus>
                      {pendingDelete === e.id ? 'Elimina?' : <Ico d={I.trash} size={18} />}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {sorted.length > 0 && <p className="hint lp-hint">Tieni premuta una spesa per eliminarla</p>}
      </section>
    </div>
  )
}
