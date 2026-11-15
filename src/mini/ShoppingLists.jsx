import { useState } from 'react'
import { uid } from '../data.js'
import ShoppingDetail from './ShoppingDetail.jsx'
import ShoppingSettings from './ShoppingSettings.jsx'

// 🛒 "Le mie liste": ogni lista della spesa è una scheda colorata con titolo,
// numero di articoli da comprare, persone della lista e freccia per aprirla.
export const LIST_COLORS = ['pesca', 'lavanda', 'menta', 'cielo', 'sole']

// Illustrazioni a linea (bianche, decorative) disegnate per l'app
const DECO = {
  carrello: <><path d="M3 4.5h2.2l2.2 10.2h10.4l1.9-7.4H6.3" /><circle cx="9" cy="19" r="1.3" /><circle cx="16.5" cy="19" r="1.3" /></>,
  mela: <><path d="M12 7.5c-3-2.2-7.5-.2-7.5 4.6S8 21.2 12 19.3c4 1.9 7.5-2.4 7.5-7.2S15 5.3 12 7.5Z" /><path d="M12 7.5c0-2.2 1-3.7 3-4.4" /></>,
  bottiglia: <path d="M10 2.8h4v3.4l2 3.1v10.9a1.6 1.6 0 0 1-1.6 1.6H9.6A1.6 1.6 0 0 1 8 20.2V9.3l2-3.1Z M8 13h8" />,
  sacchetto: <><path d="M5 8h14l-1.2 12.5H6.2Z" /><path d="M9 8V6.2a3 3 0 0 1 6 0V8" /></>,
  carota: <><path d="M4.5 19.5 14.8 9.2a3 3 0 0 0-4-4L4.5 19.5Z" /><path d="m14.8 9.2 4.2-3.7M13 7l2.6-3.8M16.8 11.2l3.7-2.4" /></>,
}
const DECO_SETS = [['mela', 'bottiglia', 'carota'], ['sacchetto', 'mela', 'carrello'], ['carota', 'sacchetto', 'bottiglia'], ['bottiglia', 'carrello', 'mela'], ['carrello', 'carota', 'sacchetto']]

const Deco = ({ name, className }) => (
  <svg className={`deco ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {DECO[name]}
  </svg>
)

const initials = (n) => n.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
const AV_COLORS = ['#2a78d6', '#1baf7a', '#eb6834', '#6250d6', '#e34948', '#eda100']
const avColor = (n) => AV_COLORS[[...n].reduce((h, c) => h + c.charCodeAt(0), 0) % AV_COLORS.length]

export default function ShoppingLists({ lists, items, store }) {
  const [openId, setOpenId] = useState(null)
  const [settings, setSettings] = useState(null) // null | 'menu' | { list: id }
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(LIST_COLORS[0])
  const [addingTo, setAddingTo] = useState(null)
  const [person, setPerson] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  // le voci create prima delle liste finiscono in "La mia spesa"
  const orphan = items.some((i) => !i.listId || i.listId === 'default')
  const all = [
    ...(orphan || lists.length === 0 ? [{ id: 'default', name: 'La mia spesa', color: 'pesca', members: [], virtual: true }] : []),
    ...lists.slice().sort((a, b) => (a.created || 0) - (b.created || 0)),
  ]
  const countOf = (id) => items.filter((i) => (i.listId || 'default') === id && !i.done).length

  const create = (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    store?.addItem('shl', { id: uid(), name, color: newColor, members: [], created: Date.now() })
    setNewName(''); setCreating(false)
  }
  const addPerson = (l) => (e) => {
    e.preventDefault()
    const n = person.trim()
    if (!n || l.virtual) return
    store?.patchItem('shl', l.id, { members: [...(l.members || []), n] })
    setPerson(''); setAddingTo(null)
  }
  const removeList = (l) => {
    if (confirmDel !== l.id) { setConfirmDel(l.id); return }
    items.filter((i) => (i.listId || 'default') === l.id).forEach((i) => store?.removeItem('shop', i.id))
    if (!l.virtual) store?.removeItem('shl', l.id)
    setConfirmDel(null)
  }

  const open = all.find((l) => l.id === openId)
  const decoFor = (l) => {
    const set = DECO_SETS[(LIST_COLORS.indexOf(l?.color) + 5) % DECO_SETS.length] || DECO_SETS[0]
    return <><Deco name={set[0]} className="d1" /><Deco name={set[1]} className="d2" /><Deco name={set[2]} className="d3" /></>
  }
  if (settings) {
    const l = settings.list ? lists.find((x) => x.id === settings.list) : null
    return (
      <ShoppingSettings
        start={settings}
        lists={lists}
        items={items}
        store={store}
        deco={decoFor(l)}
        onClose={() => setSettings(null)}
        onDeleted={() => { setSettings(null); setOpenId(null) }}
      />
    )
  }
  if (open) {
    const members = open.members || []
    return (
      <ShoppingDetail
        key={open.id}
        list={open}
        items={items}
        store={store}
        onBack={() => setOpenId(null)}
        onSettings={open.virtual ? undefined : () => setSettings({ list: open.id })}
        avatars={members.length > 0 && (
          <div className="shop-avatars">
            {members.slice(0, 3).map((m, i) => <span key={i} className="avatar sm" style={{ background: avColor(m) }} title={m}>{initials(m)}</span>)}
            {members.length > 3 && <span className="avatar sm more">+{members.length - 3}</span>}
          </div>
        )}
      />
    )
  }

  return (
    <>
      <div className="lists-top">
        <h1>Le mie liste</h1>
        <button type="button" className="round-btn lists-gear" onClick={() => setSettings('menu')} aria-label="Impostazioni">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></svg>
        </button>
        <button type="button" className="lists-edit" onClick={() => { setEditing((v) => !v); setConfirmDel(null) }}>
          {editing ? 'FATTO' : 'MODIFICA'}
        </button>
      </div>

      {all.map((l, idx) => {
        const n = countOf(l.id)
        const set = DECO_SETS[(LIST_COLORS.indexOf(l.color) + 5) % DECO_SETS.length] || DECO_SETS[idx % DECO_SETS.length]
        const members = l.members || []
        return (
          <article key={l.id} className={`list-card lc-${l.color || 'pesca'}`}>
            <button type="button" className="list-hit" onClick={() => !editing && setOpenId(l.id)} aria-label={`Apri ${l.name}`} disabled={editing} />
            <Deco name={set[0]} className="d1" />
            <Deco name={set[1]} className="d2" />
            <Deco name={set[2]} className="d3" />
            <h2 className="list-name">{l.name}</h2>
            {n > 0 && <span className="pill">{n} {n === 1 ? 'articolo' : 'articoli'}</span>}
            <div className="list-people">
              {members.slice(0, 4).map((m, i) => (
                <span key={i} className="avatar" style={{ background: avColor(m) }} title={m}>{initials(m)}</span>
              ))}
              {members.length > 4 && <span className="avatar more">+{members.length - 4}</span>}
              {!l.virtual && (
                <button type="button" className="avatar add" onClick={() => { setAddingTo(addingTo === l.id ? null : l.id); setPerson('') }} aria-label={`Aggiungi persona a ${l.name}`}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="13" cy="8" r="3.5" /><path d="M6.5 20a6.5 6.5 0 0 1 13 0M3 11h5M5.5 8.5v5" /></svg>
                </button>
              )}
            </div>
            {addingTo === l.id && (
              <form className="list-person-form" onSubmit={addPerson(l)}>
                <input className="field" autoFocus placeholder="Nome" value={person} onChange={(e) => setPerson(e.target.value)} aria-label="Nome persona" />
                <button type="submit" className="primary" disabled={!person.trim()}>Aggiungi</button>
              </form>
            )}
            {!editing ? (
              <span className="list-chev" aria-hidden="true">›</span>
            ) : (
              <button type="button" className={`list-del ${confirmDel === l.id ? 'armed' : ''}`} onClick={() => removeList(l)}>
                {confirmDel === l.id ? 'Elimina?' : '✕'}
              </button>
            )}
          </article>
        )
      })}

      {creating ? (
        <form className="card list-create-form" onSubmit={create}>
          <input className="field" autoFocus placeholder="Nome della lista (es. Spesa di casa)" value={newName} onChange={(e) => setNewName(e.target.value)} aria-label="Nome della lista" />
          <div className="color-pick" role="radiogroup" aria-label="Colore">
            {LIST_COLORS.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={newColor === c} aria-label={c} className={`swatch-btn lc-${c} ${newColor === c ? 'on' : ''}`} onClick={() => setNewColor(c)} />
            ))}
          </div>
          <div className="row-btns">
            <button type="button" className="link" onClick={() => setCreating(false)}>Annulla</button>
            <button type="submit" className="primary" disabled={!newName.trim()}>Crea</button>
          </div>
        </form>
      ) : (
        <button type="button" className="list-create" onClick={() => setCreating(true)}>
          <span className="plus" aria-hidden="true">+</span> Crea lista
        </button>
      )}
    </>
  )
}
