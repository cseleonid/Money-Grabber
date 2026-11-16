import { useState } from 'react'
import Sheet, { I, Ico, IconChoice, IconToggle, Section } from '../Sheet.jsx'
import { usePrefs } from '../prefs.js'
import { THEMES, themeOf, ThemePicker } from './listThemes.jsx'

export const SORTS = [
  { id: 'recent', label: 'Inserimento', icon: I.clock },
  { id: 'az', label: 'A–Z', icon: I.az },
  { id: 'reparto', label: 'Reparto', icon: I.shelves },
]
const VIEWS = [
  { id: 'lista', label: 'Lista', icon: I.rows },
  { id: 'riquadri', label: 'Riquadri', icon: I.grid },
]

// Vista e raggruppamento: valgono per tutte le liste (su questo dispositivo)
function ViewControls() {
  const [prefs, setPrefs] = usePrefs()
  return (
    <>
      <IconChoice label="Vista" options={VIEWS} value={prefs.view} onChange={(view) => setPrefs({ view })} />
      <IconToggle icon={I.layers} label="Raggruppa per reparto" checked={prefs.group} onChange={(group) => setPrefs({ group })} />
    </>
  )
}

// ⚙ della schermata "Le mie liste"
export function ListsSheet({ onClose }) {
  return (
    <Sheet scope="screen" label="Le mie liste" title="Come vedere le liste" onClose={onClose}>
      <ViewControls />
    </Sheet>
  )
}

// ⚙ di una singola lista
export function ListSheet({ list, items, store, onClose, onDeleted, initials, avColor }) {
  const theme = themeOf(list)
  const [name, setName] = useState(list.name)
  const [person, setPerson] = useState('')
  const [confirm, setConfirm] = useState(false)
  const members = list.members || []
  const patch = (p) => store?.patchItem('shl', list.id, p)

  return (
    <Sheet scope="list" label={list.name} title="Questa lista" color={theme.color} onClose={() => { if (name.trim() && name.trim() !== list.name) patch({ name: name.trim() }); onClose() }}>
      <Section icon={I.pencil} title="Nome">
        <input className="field sheet-field" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && name.trim() !== list.name && patch({ name: name.trim() })} aria-label="Nome della lista" />
      </Section>
      <Section icon={I.tag} title="Tema">
        <ThemePicker value={theme.id} onChange={(id) => patch({ theme: id, color: THEMES.find((t) => t.id === id).color })} />
      </Section>
      <Section icon={I.az} title="Ordine">
        <IconChoice label="Ordine" options={SORTS} value={list.sort || 'recent'} onChange={(sort) => patch({ sort })} />
      </Section>
      <Section icon={I.grid} title="Vista (tutte le liste)">
        <ViewControls />
      </Section>
      <Section icon={I.people} title="Persone">
        <div className="sheet-people">
          {members.map((m, i) => (
            <button key={i} type="button" className="avatar" style={{ background: avColor(m) }} title={`Rimuovi ${m}`} aria-label={`Rimuovi ${m}`}
              onClick={() => patch({ members: members.filter((_, k) => k !== i) })}>
              {initials(m)}<span className="av-x" aria-hidden="true">×</span>
            </button>
          ))}
          <form className="sheet-add-person" onSubmit={(e) => { e.preventDefault(); const n = person.trim(); if (n) { patch({ members: [...members, n] }); setPerson('') } }}>
            <input className="field" placeholder="Nome" value={person} onChange={(e) => setPerson(e.target.value)} aria-label="Aggiungi persona" />
            <button type="submit" className="round-btn accent" disabled={!person.trim()} aria-label="Aggiungi persona">+</button>
          </form>
        </div>
      </Section>
      <button type="button" className={`sheet-danger ${confirm ? 'armed' : ''}`} onClick={() => {
        if (!confirm) { setConfirm(true); return }
        items.filter((i) => i.listId === list.id).forEach((i) => store?.removeItem('shop', i.id))
        store?.removeItem('shl', list.id)
        onDeleted()
      }}>
        <Ico d={I.trash} size={20} /> {confirm ? 'Tocca di nuovo per eliminare' : 'Elimina lista'}
      </button>
    </Sheet>
  )
}
