import Sheet, { I, Ico, Section } from './Sheet.jsx'
import { CategoryIcon } from './icons.jsx'
import { BOXES, normalizeLayout } from './Movable.jsx'

const BOX_ICONS = {
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
  return (
    <Sheet scope="screen" label="Personale" title="Questa schermata" onClose={onClose}>
      <Section icon={I.tag} title="Categorie · ↑↓ per l'ordine, pallino = superflua">
        <div className="cat-rows">
          {categories.map((c, i) => (
            <div className="cat-row" key={c.id}>
              <div className="cat-move">
                <button type="button" className="icon" disabled={i === 0} onClick={() => moveCategory(c.id, -1)} aria-label={`Sposta su ${c.name}`}>↑</button>
                <button type="button" className="icon" disabled={i === categories.length - 1} onClick={() => moveCategory(c.id, 1)} aria-label={`Sposta giù ${c.name}`}>↓</button>
              </div>
              <CategoryIcon id={c.id} slot={c.slot} size={26} />
              <input className="field" value={c.name} onChange={(e) => patchCategory(c.id, { name: e.target.value })} aria-label={`Nome categoria ${c.name}`} />
              <label className="check" title="Superflua in automatico">
                <input type="checkbox" checked={c.autoSuperflua} onChange={(e) => patchCategory(c.id, { autoSuperflua: e.target.checked })} aria-label={`${c.name} superflua in automatico`} />
              </label>
            </div>
          ))}
        </div>
      </Section>
      <Section icon={I.grid} title="Riquadri · ↑↓ per l'ordine, interruttore per mostrarli">
        <div className="cat-rows">
          {order.map((id, i) => {
            const on = !hidden.includes(id)
            const box = BOXES.find((b) => b.id === id)
            return (
              <div className={`cat-row box-row ${on ? '' : 'off'}`} key={id}>
                <div className="cat-move">
                  <button type="button" className="icon" disabled={i === 0} onClick={() => moveBox(id, -1)} aria-label={`Sposta su ${box.name}`}>↑</button>
                  <button type="button" className="icon" disabled={i === order.length - 1} onClick={() => moveBox(id, 1)} aria-label={`Sposta giù ${box.name}`}>↓</button>
                </div>
                <span className="box-ico"><Ico d={BOX_ICONS[id]} size={22} /></span>
                <span className="box-name">{box.name}</span>
                <input type="checkbox" role="switch" className="sw" checked={on} onChange={() => toggleBox(id)} aria-label={`Mostra ${box.name}`} />
              </div>
            )
          })}
        </div>
      </Section>
    </Sheet>
  )
}
