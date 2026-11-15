import { useState } from 'react'
import { uid } from '../data.js'

// 🛒 Lista della spesa: aggiungi, spunta quando è nel carrello, svuota i presi.
export default function ShoppingList({ items: all, listId, store }) {
  const items = all.filter((i) => (i.listId || 'default') === listId)
  const [text, setText] = useState('')
  const [qty, setQty] = useState('')
  const todo = items.filter((i) => !i.done).sort((a, b) => (a.created || 0) - (b.created || 0))
  const done = items.filter((i) => i.done)

  const add = (e) => {
    e.preventDefault()
    const name = text.trim()
    if (!name) return
    store?.addItem('shop', { id: uid(), listId, name, qty: qty.trim(), done: false, created: Date.now() })
    setText(''); setQty('')
  }

  const Row = ({ i }) => (
    <li className={`mini-row ${i.done ? 'done' : ''}`}>
      <label className="check">
        <input type="checkbox" checked={!!i.done} onChange={(e) => store?.patchItem('shop', i.id, { done: e.target.checked })} aria-label={`Preso: ${i.name}`} />
      </label>
      <span className="mini-main">{i.name}{i.qty && <small> · {i.qty}</small>}</span>
      <button type="button" className="icon" onClick={() => store?.removeItem('shop', i.id)} aria-label={`Elimina ${i.name}`}>✕</button>
    </li>
  )

  return (
    <>
      <section className="card mini-card">
        <h2 className="mini-title">Da comprare <span className="count">{todo.length}</span></h2>
        <form className="mini-add" onSubmit={add}>
          <input className="field grow" placeholder="es. Latte" value={text} onChange={(e) => setText(e.target.value)} aria-label="Prodotto" />
          <input className="field qty" placeholder="Qtà" value={qty} onChange={(e) => setQty(e.target.value)} aria-label="Quantità" />
          <button type="submit" className="primary" disabled={!text.trim()}>Aggiungi</button>
        </form>
        {todo.length === 0 ? <p className="empty-msg">La lista è vuota. Aggiungi il primo prodotto qui sopra.</p> : (
          <ul className="mini-list">{todo.map((i) => <Row key={i.id} i={i} />)}</ul>
        )}
      </section>
      {done.length > 0 && (
        <section className="card mini-card">
          <div className="card-head">
            <h2 className="mini-title">Nel carrello <span className="count">{done.length}</span></h2>
            <button type="button" className="link" onClick={() => done.forEach((i) => store?.removeItem('shop', i.id))}>Svuota</button>
          </div>
          <ul className="mini-list">{done.map((i) => <Row key={i.id} i={i} />)}</ul>
        </section>
      )}
    </>
  )
}
