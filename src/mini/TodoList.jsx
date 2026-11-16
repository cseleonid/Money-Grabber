import { useState } from 'react'
import { todayISO, uid } from '../data.js'

// ✅ To Do List: attività con scadenza facoltativa, filtro Da fare / Fatte.
const fmt = (iso) => new Date(iso + 'T00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })

export default function TodoList({ items, store }) {
  const [text, setText] = useState('')
  const [due, setDue] = useState('')
  const [tab, setTab] = useState('open')
  const today = todayISO()
  const open = items.filter((t) => !t.done).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999') || (a.created || 0) - (b.created || 0))
  const closed = items.filter((t) => t.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0))
  const shown = tab === 'open' ? open : closed

  const add = (e) => {
    e.preventDefault()
    const title = text.trim()
    if (!title) return
    store?.addItem('todo', { id: uid(), title, due: due || null, done: false, created: Date.now() })
    setText(''); setDue('')
  }

  return (
    <section className="card mini-card">
      <form className="mini-add" onSubmit={add}>
        <input className="field grow" placeholder="Nuova attività" value={text} onChange={(e) => setText(e.target.value)} aria-label="Attività" />
        <input className="field date" type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Scadenza (facoltativa)" />
        <button type="submit" className="round-btn accent" disabled={!text.trim()} aria-label="Aggiungi">+</button>
      </form>
      <div className="seg" role="tablist" aria-label="Filtro attività">
        <button type="button" role="tab" aria-selected={tab === 'open'} className={tab === 'open' ? 'on' : ''} onClick={() => setTab('open')}>Da fare · {open.length}</button>
        <button type="button" role="tab" aria-selected={tab === 'done'} className={tab === 'done' ? 'on' : ''} onClick={() => setTab('done')}>Fatte · {closed.length}</button>
      </div>
      {shown.length === 0 ? (
        <p className="empty-msg">{tab === 'open' ? 'Niente da fare. Aggiungi un\'attività qui sopra.' : 'Nessuna attività completata.'}</p>
      ) : (
        <ul className="mini-list">
          {shown.map((t) => {
            const late = !t.done && t.due && t.due < today
            return (
              <li key={t.id} className={`mini-row ${t.done ? 'done' : ''}`}>
                <label className="check">
                  <input type="checkbox" checked={!!t.done} onChange={(e) => store?.patchItem('todo', t.id, { done: e.target.checked, doneAt: e.target.checked ? Date.now() : null })} aria-label={`Fatta: ${t.title}`} />
                </label>
                <span className="mini-main">
                  {t.title}
                  {t.due && <small className={late ? 'late' : ''}> · {t.due === today ? 'oggi' : fmt(t.due)}{late ? ' (scaduta)' : ''}</small>}
                </span>
                <button type="button" className="icon" onClick={() => store?.removeItem('todo', t.id)} aria-label={`Elimina ${t.title}`}>✕</button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
