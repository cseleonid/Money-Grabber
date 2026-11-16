import { useRef, useState } from 'react'

// Riquadri riordinabili. Ogni riquadro ha una barretta in alto:
// - tocco breve  → il riquadro si seleziona e compaiono Su / Giù / Nascondi / Fatto
// - trascina     → sposti il riquadro direttamente sopra o sotto gli altri
export const BOXES = [
  { id: 'grafico', name: 'Grafico spese' },
  { id: 'lista', name: 'Spese e aggiungi spesa' },
  { id: 'superflue', name: 'Spese superflue' },
]

export function normalizeLayout(layout) {
  const ids = BOXES.map((b) => b.id)
  const hidden = (layout?.hidden || []).filter((id) => ids.includes(id))
  const order = (layout?.order || []).filter((id) => ids.includes(id))
  ids.forEach((id) => { if (!order.includes(id)) order.push(id) })
  return { order, hidden }
}

export default function MovableBoxes({ layout, onChange, blocks }) {
  const { order, hidden } = normalizeLayout(layout)
  const visible = order.filter((id) => !hidden.includes(id))
  const [selected, setSelected] = useState(null)
  const [drag, setDrag] = useState(null) // { id, dy, over }
  const [adding, setAdding] = useState(false)
  const refs = useRef({})
  const ptr = useRef(null)

  const save = (nextVisibleOrder, nextHidden = hidden) => {
    // mantiene in coda i nascosti nella loro posizione relativa
    const rest = order.filter((id) => !nextVisibleOrder.includes(id))
    onChange({ order: [...nextVisibleOrder, ...rest], hidden: nextHidden })
  }
  const move = (id, delta) => {
    const i = visible.indexOf(id), j = i + delta
    if (j < 0 || j >= visible.length) return
    const next = visible.slice(); [next[i], next[j]] = [next[j], next[i]]
    save(next)
  }
  const hide = (id) => { setSelected(null); save(visible.filter((x) => x !== id), [...hidden, id]) }
  const show = (id) => { setAdding(false); save([...visible, id], hidden.filter((x) => x !== id)) }

  // trascinamento con il dito / mouse sulla barretta
  const onDown = (id) => (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const r = refs.current[id]?.getBoundingClientRect()
    ptr.current = { id, y0: e.clientY, sy0: window.scrollY, moved: false, h: (r?.height || 0) + 16 }
  }
  const onMove = (e) => {
    const p = ptr.current
    if (!p) return
    // scorrimento automatico vicino ai bordi dello schermo
    if (p.moved) {
      if (e.clientY < 70) window.scrollBy(0, -18)
      else if (e.clientY > window.innerHeight - 70) window.scrollBy(0, 18)
    }
    const dy = e.clientY - p.y0 + (window.scrollY - p.sy0)
    if (!p.moved && Math.abs(dy) < 6) return
    p.moved = true
    // posizione d'arrivo: confronta il puntatore con il centro degli altri riquadri
    let over = 0
    visible.forEach((vid) => {
      if (vid === p.id) return
      const r = refs.current[vid]?.getBoundingClientRect()
      if (r && e.clientY > r.top + r.height / 2) over++
    })
    setDrag({ id: p.id, dy, over, h: p.h })
  }
  const onUp = () => {
    const p = ptr.current
    ptr.current = null
    if (!p) return
    if (!p.moved) { setSelected((s) => (s === p.id ? null : p.id)); return }
    if (drag) {
      const next = visible.filter((x) => x !== drag.id)
      next.splice(drag.over, 0, drag.id)
      save(next)
    }
    setDrag(null)
  }

  return (
    <>
      {visible.map((id, i) => {
        const isSel = selected === id
        const isDrag = drag?.id === id
        // gli altri riquadri si spostano per fare posto a quello trascinato
        let shift = 0
        if (drag && !isDrag) {
          const i0 = visible.indexOf(drag.id)
          if (i > i0 && i <= drag.over) shift = -drag.h
          if (i < i0 && i >= drag.over) shift = drag.h
        }
        return (
          <div
            key={id}
            ref={(el) => { refs.current[id] = el }}
            className={`movable ${isSel ? 'selected' : ''} ${isDrag ? 'dragging' : ''}`}
            style={isDrag ? { transform: `translateY(${drag.dy}px)` } : shift ? { transform: `translateY(${shift}px)` } : undefined}
          >
            <button
              type="button"
              className="grip"
              aria-label={`Sposta ${BOXES.find((b) => b.id === id).name}`}
              aria-pressed={isSel}
              onPointerDown={onDown(id)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={() => { ptr.current = null; setDrag(null) }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') { e.preventDefault(); move(id, -1) }
                if (e.key === 'ArrowDown') { e.preventDefault(); move(id, 1) }
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(isSel ? null : id) }
              }}
            >
              <span />
            </button>
            {isSel && (
              <div className="move-bar" role="toolbar" aria-label="Sposta riquadro">
                <button type="button" onClick={() => move(id, -1)} disabled={i === 0} aria-label="Sposta su">↑ Su</button>
                <button type="button" onClick={() => move(id, 1)} disabled={i === visible.length - 1} aria-label="Sposta giù">↓ Giù</button>
                <button type="button" onClick={() => hide(id)}>Nascondi</button>
                <button type="button" className="ok" onClick={() => setSelected(null)}>Fatto</button>
              </div>
            )}
            {blocks[id]}
          </div>
        )
      })}

      {hidden.length > 0 && (
        <div className="add-box">
          {adding ? (
            <div className="add-box-list">
              {hidden.map((id) => (
                <button key={id} type="button" onClick={() => show(id)}>+ {BOXES.find((b) => b.id === id).name}</button>
              ))}
              <button type="button" className="btn-secondary" onClick={() => setAdding(false)}>Annulla</button>
            </div>
          ) : (
            <button type="button" className="add-box-btn" onClick={() => setAdding(true)}>+ Aggiungi riquadro</button>
          )}
        </div>
      )}
    </>
  )
}
