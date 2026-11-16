import { useState } from 'react'
import { formatEur, todayISO, uid } from '../data.js'

// 🤝 Spese condivise: persone, spese pagate da qualcuno e divise in parti uguali,
// saldo di ognuno e chi deve dare quanto a chi (con il minor numero di passaggi).
function settle(balances) {
  const cred = balances.filter((b) => b.bal > 0.005).map((b) => ({ ...b })).sort((a, b) => b.bal - a.bal)
  const debt = balances.filter((b) => b.bal < -0.005).map((b) => ({ ...b, bal: -b.bal })).sort((a, b) => b.bal - a.bal)
  const out = []
  let i = 0, j = 0
  while (i < debt.length && j < cred.length) {
    const x = Math.min(debt[i].bal, cred[j].bal)
    out.push({ from: debt[i].name, to: cred[j].name, amount: Math.round(x * 100) / 100 })
    debt[i].bal -= x; cred[j].bal -= x
    if (debt[i].bal < 0.005) i++
    if (cred[j].bal < 0.005) j++
  }
  return out
}

export default function SharedExpenses({ people, expenses, store }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [payer, setPayer] = useState('')
  const value = parseFloat(String(amount).replace(',', '.'))
  const ids = new Set(people.map((p) => p.id))
  const valid = expenses.filter((e) => ids.has(e.payer))
  const payerId = payer && ids.has(payer) ? payer : people[0]?.id

  const balances = people.map((p) => {
    const paid = valid.filter((e) => e.payer === p.id).reduce((s, e) => s + e.amount, 0)
    const share = valid.reduce((s, e) => s + e.amount / Math.max(1, people.length), 0)
    return { id: p.id, name: p.name, bal: paid - share }
  })
  const moves = settle(balances)
  const total = valid.reduce((s, e) => s + e.amount, 0)

  const addPerson = (e) => {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    store?.addItem('ppl', { id: uid(), name: n, created: Date.now() })
    setName('')
  }
  const addExpense = (e) => {
    e.preventDefault()
    if (!desc.trim() || !(value > 0) || !payerId) return
    store?.addItem('shx', { id: uid(), desc: desc.trim(), amount: Math.round(value * 100) / 100, payer: payerId, date: todayISO(), created: Date.now() })
    setDesc(''); setAmount('')
  }
  const nameOf = (id) => people.find((p) => p.id === id)?.name ?? '—'

  return (
    <>
      <section className="card mini-card">
        <h2 className="mini-title">Persone <span className="count">{people.length}</span></h2>
        <form className="mini-add" onSubmit={addPerson}>
          <input className="field grow" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} aria-label="Nome persona" />
          <button type="submit" className="round-btn accent" disabled={!name.trim()} aria-label="Aggiungi">+</button>
        </form>
        {people.length === 0 ? <p className="empty-msg">Aggiungi le persone con cui dividi le spese.</p> : (
          <ul className="chips-list">
            {people.map((p) => (
              <li key={p.id} className="person">
                {p.name}
                <button type="button" className="icon sm" onClick={() => store?.removeItem('ppl', p.id)} aria-label={`Rimuovi ${p.name}`}>✕</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {people.length >= 2 && (
        <section className="card mini-card">
          <h2 className="mini-title">Nuova spesa</h2>
          <form className="mini-add wrap" onSubmit={addExpense}>
            <input className="field grow" placeholder="es. Cena pizzeria" value={desc} onChange={(e) => setDesc(e.target.value)} aria-label="Descrizione" />
            <input className="field qty" inputMode="decimal" placeholder="€" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))} aria-label="Importo" />
            <label className="field-inline">
              Pagato da
              <select className="field" value={payerId} onChange={(e) => setPayer(e.target.value)}>
                {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <button type="submit" className="round-btn accent" disabled={!desc.trim() || !(value > 0)} aria-label="Aggiungi">+</button>
          </form>
          <p className="hint">Divisa in parti uguali tra tutte le {people.length} persone.</p>
        </section>
      )}

      {people.length >= 2 && (
        <section className="card mini-card">
          <h2 className="mini-title">Saldi <span className="count">{formatEur(total)}</span></h2>
          <ul className="mini-list">
            {balances.map((b) => (
              <li key={b.id} className="mini-row">
                <span className="mini-main">{b.name}</span>
                <span className={`bal ${b.bal > 0.005 ? 'pos' : b.bal < -0.005 ? 'neg' : ''}`}>
                  {b.bal > 0.005 ? '+' : ''}{formatEur(Math.round(b.bal * 100) / 100)}
                </span>
              </li>
            ))}
          </ul>
          {moves.length > 0 ? (
            <div className="settle">
              <h3>Per pareggiare</h3>
              <ul>{moves.map((m, i) => <li key={i}><b>{m.from}</b> dà <b>{formatEur(m.amount)}</b> a <b>{m.to}</b></li>)}</ul>
            </div>
          ) : valid.length > 0 && <p className="hint">Siete in pari.</p>}
        </section>
      )}

      {valid.length > 0 && (
        <section className="card mini-card">
          <h2 className="mini-title">Spese <span className="count">{valid.length}</span></h2>
          <ul className="mini-list">
            {valid.slice().sort((a, b) => (b.created || 0) - (a.created || 0)).map((e) => (
              <li key={e.id} className="mini-row">
                <span className="mini-main">{e.desc}<small> · pagato da {nameOf(e.payer)}</small></span>
                <span className="expense-amount">{formatEur(e.amount)}</span>
                <button type="button" className="icon" onClick={() => store?.removeItem('shx', e.id)} aria-label={`Elimina ${e.desc}`}>✕</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
