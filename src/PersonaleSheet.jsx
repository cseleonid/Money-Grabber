import Sheet, { I, Ico, Section } from './Sheet.jsx'
import { CategoryIcon } from './icons.jsx'
import { BOXES, normalizeLayout } from './Movable.jsx'

// Impostazioni della schermata Personale: categorie e riquadri visibili.
export default function PersonaleSheet({ categories, patchCategory, moveCategory, layout, setLayout, onClose }) {
  const { order, hidden } = normalizeLayout(layout)
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
      <Section icon={I.grid} title="Riquadri visibili">
        <div className="box-toggles">
          {order.map((id) => {
            const on = !hidden.includes(id)
            return (
              <button key={id} type="button" className={`box-toggle ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggleBox(id)}>
                <Ico d={on ? I.check : I.close} size={18} />
                {BOXES.find((b) => b.id === id).name}
              </button>
            )
          })}
        </div>
      </Section>
    </Sheet>
  )
}
