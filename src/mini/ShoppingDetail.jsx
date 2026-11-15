import { useState } from 'react'
import { uid } from '../data.js'
import { ProductIcon } from './productIcons.jsx'

// Schermata di una lista: prodotti come riquadri con icona; tocco = comprato.
// I comprati finiscono in "Utilizzato per ultimo": un tocco li rimette in lista.
const DAY = 24 * 60 * 60 * 1000
const SORTS = [
  { id: 'recent', label: 'Ordine di inserimento' },
  { id: 'az', label: 'Alfabetico A–Z' },
]

const split = (name) => {
  const [first, ...rest] = name.trim().split(/\s+/)
  return [first, rest.join(' ')]
}

export default function ShoppingDetail({ list, items: all, store, onBack, avatars }) {
  const items = all.filter((i) => (i.listId || 'default') === list.id)
  const [text, setText] = useState('')
  const [sort, setSort] = useState('recent')
  const [sortOpen, setSortOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [recentOpen, setRecentOpen] = useState(true)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(list.name)
  const [confirmDel, setConfirmDel] = useState(false)

  const sorter = sort === 'az'
    ? (a, b) => a.name.localeCompare(b.name, 'it')
    : (a, b) => (a.created || 0) - (b.created || 0)
  const todo = items.filter((i) => !i.done).sort(sorter)
  const recent = items.filter((i) => i.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0))
  const now = Date.now()

  const add = (e) => {
    e.preventDefault()
    const n = text.trim()
    if (!n) return
    // se è già tra gli usati di recente lo rimette in lista invece di duplicarlo
    const again = recent.find((i) => i.name.toLowerCase() === n.toLowerCase())
    if (again) store?.patchItem('shop', again.id, { done: false, created: Date.now() })
    else store?.addItem('shop', { id: uid(), listId: list.id, name: n, qty: '', done: false, created: Date.now() })
    setText('')
  }
  const suggestions = text.trim()
    ? recent.filter((i) => i.name.toLowerCase().includes(text.trim().toLowerCase())).slice(0, 4)
    : []

  const Tile = ({ i, used }) => {
    const [title, sub] = split(i.name)
    const isNew = !used && now - (i.created || 0) < DAY
    return (
      <button
        type="button"
        className={`prod-tile ${used ? 'used' : ''}`}
        onClick={() => store?.patchItem('shop', i.id, used ? { done: false, created: Date.now() } : { done: true, doneAt: Date.now() })}
        aria-label={used ? `Rimetti in lista ${i.name}` : `Comprato: ${i.name}`}
      >
        {isNew && <span className="prod-new">NEW</span>}
        <ProductIcon name={i.name} size={used ? 40 : 64} />
        <span className="prod-name">{title}</span>
        {(sub || i.qty) && <span className="prod-sub">{[sub, i.qty].filter(Boolean).join(' · ')}</span>}
      </button>
    )
  }

  return (
    <div className="shop-detail">
      <div className="shop-bar">
        <button type="button" className="shop-back" onClick={onBack}>
          <span aria-hidden="true">‹</span> Le mie liste
        </button>
        {!list.virtual && (
          <div className="shop-menu-wrap">
            <button type="button" className="round-btn" onClick={() => { setMenu((v) => !v); setConfirmDel(false) }} aria-label="Altre azioni" aria-expanded={menu}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5.5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="18.5" r="1.8" /></svg>
            </button>
            {menu && (
              <div className="pop-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => { setRenaming(true); setMenu(false) }}>Rinomina lista</button>
                <button type="button" role="menuitem" className="danger" onClick={() => {
                  if (!confirmDel) { setConfirmDel(true); return }
                  items.forEach((i) => store?.removeItem('shop', i.id))
                  store?.removeItem('shl', list.id)
                  onBack()
                }}>{confirmDel ? 'Tocca di nuovo per eliminare' : 'Elimina lista'}</button>
              </div>
            )}
          </div>
        )}
      </div>

      {renaming ? (
        <form className="shop-rename" onSubmit={(e) => { e.preventDefault(); if (name.trim()) store?.patchItem('shl', list.id, { name: name.trim() }); setRenaming(false) }}>
          <input className="field" autoFocus value={name} onChange={(e) => setName(e.target.value)} aria-label="Nome della lista" />
          <button type="submit" className="primary">Salva</button>
        </form>
      ) : (
        <div className="shop-title">
          <h1>{list.name}</h1>
          {avatars}
        </div>
      )}

      <form className="shop-add" onSubmit={add}>
        <input className="field" placeholder="Aggiungi un prodotto (es. Pane in cassetta)" value={text} onChange={(e) => setText(e.target.value)} aria-label="Prodotto" />
        <button type="submit" className="round-btn accent" disabled={!text.trim()} aria-label="Aggiungi">+</button>
      </form>
      {suggestions.length > 0 && (
        <div className="shop-suggest">
          {suggestions.map((i) => (
            <button key={i.id} type="button" onClick={() => { store?.patchItem('shop', i.id, { done: false, created: Date.now() }); setText('') }}>
              ↺ {i.name}
            </button>
          ))}
        </div>
      )}

      <div className="shop-sort">
        <button type="button" className="sort-btn" onClick={() => setSortOpen((v) => !v)} aria-expanded={sortOpen}>
          <span aria-hidden="true">⇅</span> Ordina lista
        </button>
        {sortOpen && (
          <div className="pop-menu right" role="menu">
            {SORTS.map((s) => (
              <button key={s.id} type="button" role="menuitemradio" aria-checked={sort === s.id} className={sort === s.id ? 'on' : ''} onClick={() => { setSort(s.id); setSortOpen(false) }}>{s.label}</button>
            ))}
          </div>
        )}
      </div>

      {todo.length === 0 ? (
        <p className="shop-empty">Niente da comprare. Aggiungi un prodotto qui sopra.</p>
      ) : (
        <div className="prod-grid">{todo.map((i) => <Tile key={i.id} i={i} />)}</div>
      )}

      {recent.length > 0 && (
        <section className="shop-recent">
          <div className="shop-recent-head">
            <button type="button" className="recent-toggle" onClick={() => setRecentOpen((v) => !v)} aria-expanded={recentOpen}>
              <span className={`chev-r ${recentOpen ? 'open' : ''}`} aria-hidden="true">›</span> Utilizzato per ultimo
            </button>
            <button type="button" className="round-btn" onClick={() => recent.forEach((i) => store?.removeItem('shop', i.id))} aria-label="Svuota utilizzati per ultimo" title="Svuota">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" /></svg>
            </button>
          </div>
          {recentOpen && <div className="prod-grid small">{recent.map((i) => <Tile key={i.id} i={i} used />)}</div>}
        </section>
      )}
    </div>
  )
}
