import { useState } from 'react'
import { monthKey, monthLabel, shiftMonth, todayISO, uid } from '../data.js'

// 📅 Calendario: griglia del mese (lunedì per primo), pallino nei giorni con eventi,
// tocca un giorno per vedere e aggiungere i suoi eventi.
const WD = ['L', 'M', 'M', 'G', 'V', 'S', 'D']
const pad = (n) => String(n).padStart(2, '0')

export default function CalendarView({ items, store }) {
  const today = todayISO()
  const [month, setMonth] = useState(monthKey(today))
  const [day, setDay] = useState(today)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')

  const [y, m] = month.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const lead = (first.getDay() + 6) % 7
  const days = new Date(y, m, 0).getDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${month}-${pad(i + 1)}`)]
  while (cells.length % 7) cells.push(null)

  const byDay = items.reduce((acc, e) => ((acc[e.date] ||= []).push(e), acc), {})
  const dayEvents = (byDay[day] || []).slice().sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))

  const add = (e) => {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    store?.addItem('cal', { id: uid(), title: t, date: day, time: time || null, created: Date.now() })
    setTitle(''); setTime('')
  }

  const go = (delta) => { const k = shiftMonth(month, delta); setMonth(k); setDay(k === monthKey(today) ? today : `${k}-01`) }

  return (
    <>
      <section className="card mini-card">
        <div className="cal-head">
          <button type="button" className="icon big" onClick={() => go(-1)} aria-label="Mese precedente">‹</button>
          <h2 className="mini-title center">{monthLabel(month)}</h2>
          <button type="button" className="icon big" onClick={() => go(1)} aria-label="Mese successivo">›</button>
        </div>
        <div className="cal-grid" role="grid" aria-label={monthLabel(month)}>
          {WD.map((w, i) => <span key={i} className="cal-wd" aria-hidden="true">{w}</span>)}
          {cells.map((c, i) => c ? (
            <button
              key={c}
              type="button"
              className={`cal-day ${c === day ? 'on' : ''} ${c === today ? 'today' : ''}`}
              onClick={() => setDay(c)}
              aria-pressed={c === day}
              aria-label={`${Number(c.slice(8))}${byDay[c] ? `, ${byDay[c].length} eventi` : ''}`}
            >
              {Number(c.slice(8))}
              {byDay[c] && <span className="cal-dot" aria-hidden="true" />}
            </button>
          ) : <span key={'e' + i} />)}
        </div>
      </section>

      <section className="card mini-card">
        <h2 className="mini-title">
          {new Date(day + 'T00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h2>
        <form className="mini-add" onSubmit={add}>
          <input className="field grow" placeholder="Nuovo evento" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Evento" />
          <input className="field time" type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Ora (facoltativa)" />
          <button type="submit" className="round-btn accent" disabled={!title.trim()} aria-label="Aggiungi">+</button>
        </form>
        {dayEvents.length === 0 ? <p className="empty-msg">Nessun evento in questo giorno.</p> : (
          <ul className="mini-list">
            {dayEvents.map((e) => (
              <li key={e.id} className="mini-row">
                <span className="cal-time">{e.time || 'tutto il giorno'}</span>
                <span className="mini-main">{e.title}</span>
                <button type="button" className="icon" onClick={() => store?.removeItem('cal', e.id)} aria-label={`Elimina ${e.title}`}>✕</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
