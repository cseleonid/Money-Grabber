import { useEffect, useRef, useState } from 'react'
import { CategoryIcon, PaymentIcon } from './icons.jsx'
import { formatEur, todayISO, uid } from './data.js'

// Inserimento spesa a passaggi:
// 1 Carta/Portafoglio → 2 Categoria → 3 Importo → 4 Data → 5 Riepilogo e conferma
const STEPS = ['Come hai pagato?', 'Categoria', 'Importo', 'Data', 'Riepilogo']
const TOTAL = STEPS.length

function isoShift(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const fmtDate = (iso) =>
  new Date(iso + 'T00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })

export default function AddWizard({ categories, payments, onAdd }) {
  const blank = () => ({ payment: null, categoryId: null, amount: '', date: todayISO(), description: '', superflua: false })
  const [step, setStep] = useState(1)
  const [d, setD] = useState(blank)
  const [done, setDone] = useState(null)
  const amountRef = useRef(null)

  useEffect(() => {
    if (step === 3) amountRef.current?.focus()
  }, [step])

  const cat = categories.find((c) => c.id === d.categoryId)
  const amount = parseFloat(String(d.amount).replace(',', '.'))
  const amountOk = amount > 0
  const auto = !!cat?.autoSuperflua

  // passaggio massimo raggiungibile: avanti solo se i passaggi precedenti sono completi
  const ready = [true, !!d.payment, !!d.categoryId, amountOk, !!d.date]
  const maxStep = (() => { let m = 1; while (m < TOTAL && ready[m]) m++; return m })()
  const goTo = (n) => { if (n >= 1 && n <= maxStep) setStep(n) }

  // swipe orizzontale: destra → indietro, sinistra → avanti (se consentito)
  const touch = useRef(null)
  const onTouchStart = (e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY } }
  const onTouchEnd = (e) => {
    if (!touch.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touch.current.x, dy = t.clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0) tryNext(); else goTo(step - 1)
  }
  const [nudge, setNudge] = useState(false)
  useEffect(() => { if (!nudge) return; const t = setTimeout(() => setNudge(false), 400); return () => clearTimeout(t) }, [nudge])
  const tryNext = () => { if (step + 1 <= maxStep) setStep(step + 1); else setNudge(true) }

  const choose = (patch, next) => {
    setD((x) => ({ ...x, ...patch }))
    setStep(next)
  }

  const confirm = () => {
    if (!d.payment || !cat || !amountOk) return
    const expense = {
      id: uid(),
      description: d.description.trim() || cat.name,
      amount: Math.round(amount * 100) / 100,
      date: d.date,
      categoryId: d.categoryId,
      payment: d.payment,
      superflua: d.superflua,
      controllata: false,
    }
    onAdd(expense)
    setDone(expense)
    setD(blank())
    setStep(1)
  }

  return (
    <section className={`card wizard ${nudge ? 'nudge' : ''}`} aria-labelledby="wizard-title" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <span className="wizard-step" aria-live="polite">Passaggio {step} di {TOTAL}</span>
      <div className="wizard-dots" role="tablist" aria-label="Passaggi">
        {STEPS.map((label, i) => {
          const n = i + 1
          return (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={n === step}
              aria-label={`Passaggio ${n}: ${label}`}
              disabled={n > maxStep}
              className={n === step ? 'cur' : n < step ? 'past' : ''}
              onClick={() => goTo(n)}
            />
          )
        })}
      </div>
      <h2 id="wizard-title">{step === 1 ? 'Aggiungi spesa' : STEPS[step - 1]}</h2>

      {done && step === 1 && (
        <p className="wizard-done" role="status">
          Aggiunta: <b>{done.description}</b> · {formatEur(done.amount)}
        </p>
      )}

      {step === 1 && (
        <>
          <p className="hint wizard-q">{STEPS[0]}</p>
          <div className="choice-grid two">
            {Object.entries(payments).map(([k, p]) => (
              <button key={k} type="button" className={`choice big ${d.payment === k ? 'on' : ''}`} onClick={() => { setDone(null); choose({ payment: k }, 2) }}>
                <PaymentIcon id={k} size={34} />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <div className="choice-grid">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`choice ${d.categoryId === c.id ? 'on' : ''}`}
              onClick={() => choose({ categoryId: c.id, superflua: false }, 3)}
            >
              <CategoryIcon id={c.id} slot={c.slot} size={32} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <form
          className="wizard-form"
          onSubmit={(e) => { e.preventDefault(); if (amountOk) setStep(4) }}
        >
          <label className="amount-field" htmlFor="wiz-amount">
            <span className="cur">€</span>
            <input
              id="wiz-amount"
              ref={amountRef}
              inputMode="decimal"
              placeholder="0,00"
              value={d.amount}
              onChange={(e) => setD({ ...d, amount: e.target.value.replace(/[^0-9.,]/g, '') })}
              aria-label="Importo in euro"
            />
          </label>
          <button type="submit" className="primary" disabled={!amountOk}>Avanti</button>
        </form>
      )}

      {step === 4 && (
        <div className="wizard-form">
          <div className="chips">
            {[['Oggi', 0], ['Ieri', -1], ['2 giorni fa', -2]].map(([label, n]) => (
              <button
                key={label}
                type="button"
                className={`chip ${d.date === isoShift(n) ? 'on' : ''}`}
                onClick={() => choose({ date: isoShift(n) }, 5)}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="field-label" htmlFor="wiz-date">Oppure scegli una data</label>
          <input id="wiz-date" type="date" className="field" value={d.date} onChange={(e) => e.target.value && setD({ ...d, date: e.target.value })} />
          <button type="button" className="primary" onClick={() => setStep(5)}>Avanti</button>
        </div>
      )}

      {step === 5 && cat && (
        <div className="wizard-form">
          <dl className="summary">
            <div><dt>Pagamento</dt><dd><PaymentIcon id={d.payment} size={20} /> {payments[d.payment].label}</dd></div>
            <div><dt>Categoria</dt><dd><CategoryIcon id={cat.id} slot={cat.slot} size={20} /> {cat.name}</dd></div>
            <div><dt>Importo</dt><dd className="num">{formatEur(amount)}</dd></div>
            <div><dt>Data</dt><dd>{fmtDate(d.date)}</dd></div>
          </dl>
          <label className="field-label" htmlFor="wiz-desc">Nota (facoltativa)</label>
          <input
            id="wiz-desc"
            className="field"
            placeholder={`es. ${cat.name === 'Alimentari' ? 'Spesa Esselunga' : cat.name}`}
            value={d.description}
            onChange={(e) => setD({ ...d, description: e.target.value })}
          />
          <label className="check">
            <input
              type="checkbox"
              checked={d.superflua || auto}
              disabled={auto}
              onChange={(e) => setD({ ...d, superflua: e.target.checked })}
            />
            Superflua {auto && <small>(auto per categoria)</small>}
          </label>
          <button type="button" className="primary" onClick={confirm}>Aggiungi spesa</button>
        </div>
      )}
    </section>
  )
}
