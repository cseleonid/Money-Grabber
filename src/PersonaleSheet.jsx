import { useRef, useState } from 'react'
import Sheet, { I, Ico, Section } from './Sheet.jsx'
import { CategoryIcon } from './icons.jsx'
import { BOXES, normalizeLayout } from './Movable.jsx'

const BOX_ICONS = {
  aggiungi: <><circle cx="12" cy="12" r="8.5" /><path d="M12 8v8M8 12h8" /></>,
  grafico: <><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12Z" /><path d="M15 3.8A8.5 8.5 0 0 1 20.2 9H15Z" /></>,
  superflue: <path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8Z" />,
}

// Impostazioni della schermata Personale: categorie e riquadri visibili.
export default function PersonaleSheet({ categories, patchCategory, moveCategory, layout, setLayout, onClose }) {
  const { order, hidden } = normalizeLayout(layout)
  const moveBox = (id, d) => {
    const i = order.indexOf(id), j = i + d
    if (j < 0 || j >= order.length) return
    const next = order.slice(); [next[i], next[j]] = [next[j], next[i]]
    setLayout({ order: next, hidden })
  }
  const toggleBox = (id) => setLayout({ order, hidden: hidden.includes(id) ? hidden.filter((x) => x !== id) : [...hidden, id] })
  // trascina la maniglia ≡ per spostare una categoria su o giù
  const rows = useRef({})
  const ptr = useRef(null)
  const [drag, setDrag] = useState(null) // { id, dy, to }
  const onDown = (id) => (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const r = rows.current[id]?.getBoundingClientRect()
    ptr.current = { id, y0: e.clientY, h: (r?.height || 60) + 12 }
  }
  const onMove = (e) => {
    const p = ptr.current
    if (!p) return
    const dy = e.clientY - p.y0
    let to = 0
    categories.forEach((c) => {
      if (c.id === p.id) return
      const r = rows.current[c.id]?.getBoundingClientRect()
      if (r && e.clientY > r.top + r.height / 2) to++
    })
    setDrag({ id: p.id, dy, to, h: p.h })
  }
  const onUp = () => {
    const p = ptr.current
    ptr.current = null
    if (p && drag) {
      const from = categories.findIndex((c) => c.id === p.id)
      if (drag.to !== from) moveCategory(p.id, drag.to - from)
    }
    setDrag(null)
  }
  const from = drag ? categories.findIndex((c) => c.id === drag.id) : -1

  return (
    <Sheet scope="screen" title="Questa schermata" onClose={onClose}>
      <Section icon={I.tag} title="Categorie">
        <div className="cat-rows">
          {categories.map((c, i) => (
            <div className={`cat-row ${drag?.id === c.id ? 'dragging' : ''}`} key={c.id} ref={(el) => { rows.current[c.id] = el }}
              style={drag?.id === c.id ? { transform: `translateY(${drag.dy}px)` }
                : drag && i > from && i <= drag.to ? { transform: `translateY(${-drag.h}px)` }
                : drag && i < from && i >= drag.to ? { transform: `translateY(${drag.h}px)` } : undefined}>
              <CategoryIcon id={c.id} slot={c.slot} size={26} />
              <input className="field" value={c.name} onChange={(e) => patchCategory(c.id, { name: e.target.value })} aria-label={`Nome categoria ${c.name}`} />
              <button type="button" className="drag-handle" aria-label={`Trascina per spostare ${c.name} (frecce su e giù da tastiera)`}
                onPointerDown={onDown(c.id)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { ptr.current = null; setDrag(null) }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') { e.preventDefault(); moveCategory(c.id, -1) }
                  if (e.key === 'ArrowDown') { e.preventDefault(); moveCategory(c.id, 1) }
                }}>
                <Ico d={<path d="M5 8h14M5 12h14M5 16h14" />} size={22} />
              </button>
            </div>
          ))}
        </div>
      </Section>
      <Section icon={I.grid} title="Riquadri">
        <div className="cat-rows">
          {order.map((id, i) => {
            const on = !hidden.includes(id)
            const box = BOXES.find((b) => b.id === id)
            return (
              <div className={`cat-row box-row ${on ? '' : 'off'}`} key={id}>
                <span className="box-ico"><Ico d={BOX_ICONS[id]} size={22} /></span>
                <span className="box-name">{box.name}</span>
                <label className="sw-labeled">
                  <input type="checkbox" role="switch" className="sw" checked={on} onChange={() => toggleBox(id)} aria-label={`Mostra ${box.name}`} />
                  <span>Visibile</span>
                </label>
                <div className="cat-move">
                  <button type="button" className="icon" disabled={i === 0} onClick={() => moveBox(id, -1)} aria-label={`Sposta su ${box.name}`}>↑</button>
                  <button type="button" className="icon" disabled={i === order.length - 1} onClick={() => moveBox(id, 1)} aria-label={`Sposta giù ${box.name}`}>↓</button>
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </Sheet>
  )
}
