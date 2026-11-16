import { useState } from 'react'
import { uid } from '../data.js'
import ShoppingDetail from './ShoppingDetail.jsx'
import { ListsSheet, ListSheet } from './ShoppingSheets.jsx'
import { Ico, I } from '../Sheet.jsx'

// 🛒 "Le mie liste": ogni lista della spesa è una scheda colorata con titolo,
// numero di articoli da comprare, persone della lista e freccia per aprirla.
import { THEMES, themeOf, ThemeBadge, ThemePicker } from './listThemes.jsx'

const initials = (n) => n.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
const AV_COLORS = ['#2a78d6', '#1baf7a', '#eb6834', '#6250d6', '#e34948', '#eda100']
const avColor = (n) => AV_COLORS[[...n].reduce((h, c) => h + c.charCodeAt(0), 0) % AV_COLORS.length]

export default function ShoppingLists({ lists, items, store }) {
  const [openId, setOpenId] = useState(null)
  const [sheet, setSheet] = useState(null) // null | 'lists' | 'list'
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTheme, setNewTheme] = useState(THEMES[0].id)
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
    store?.addItem('shl', { id: uid(), name, theme: newTheme, color: THEMES.find((t) => t.id === newTheme).color, members: [], created: Date.now() })
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
  if (open) {
    const members = open.members || []
    return (
      <>
      <ShoppingDetail
        key={open.id}
        list={open}
        items={items}
        store={store}
        onBack={() => setOpenId(null)}
        onSettings={open.virtual ? undefined : () => setSheet('list')}
        avatars={members.length > 0 && (
          <div className="shop-avatars">
            {members.slice(0, 3).map((m, i) => <span key={i} className="avatar sm" style={{ background: avColor(m) }} title={m}>{initials(m)}</span>)}
            {members.length > 3 && <span className="avatar sm more">+{members.length - 3}</span>}
          </div>
        )}
      />
      {sheet === 'list' && (
        <ListSheet list={open} items={items} store={store} initials={initials} avColor={avColor}
          onClose={() => setSheet(null)} onDeleted={() => { setSheet(null); setOpenId(null) }} />
      )}
      </>
    )
  }

  return (
    <>
      <div className="lists-top">
        <h1>Le mie liste</h1>
        <button type="button" className="round-btn scope-screen-btn" onClick={() => setSheet('lists')} aria-label="Impostazioni di questa schermata">
          <Ico d={I.sliders} />
        </button>
        <button type="button" className={`round-btn ${editing ? 'accent' : ''}`} onClick={() => { setEditing((v) => !v); setConfirmDel(null) }} aria-label={editing ? 'Fine modifica' : 'Modifica liste'} aria-pressed={editing}>
          <Ico d={editing ? I.check : I.pencil} />
        </button>
      </div>

      {all.map((l, idx) => {
        const n = countOf(l.id)
        const theme = themeOf(l)
        const members = l.members || []
        return (
          <article key={l.id} className={`list-card lc-${theme.color}`}>
            <button type="button" className="list-hit" onClick={() => !editing && setOpenId(l.id)} aria-label={`Apri ${l.name}`} disabled={editing} />
            <ThemeBadge theme={theme} />
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
                <button type="submit" className="round-btn accent" disabled={!person.trim()} aria-label="Aggiungi">+</button>
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
          <ThemePicker value={newTheme} onChange={setNewTheme} />
          <div className="row-btns">
            <button type="button" className="btn-secondary" onClick={() => setCreating(false)}>Annulla</button>
            <button type="submit" className="primary" disabled={!newName.trim()}>Crea</button>
          </div>
        </form>
      ) : (
        <button type="button" className="list-create" onClick={() => setCreating(true)}>
          <span className="plus" aria-hidden="true">+</span> Crea lista
        </button>
      )}
      {sheet === 'lists' && <ListsSheet onClose={() => setSheet(null)} />}
    </>
  )
}
