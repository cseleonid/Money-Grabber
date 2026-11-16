import { useState } from 'react'
import { getPrefs, setPrefs } from '../prefs.js'

// Impostazioni della Lista della spesa:
// menu → Visualizzazione lista · Tema · Impostazioni lista (scelta lista → Personalizza lista)
import { THEMES, themeOf, ThemeBadge, ThemePicker } from './listThemes.jsx'
export const SORTS = [
  { id: 'recent', label: 'Ordine di inserimento', hint: 'Prima i prodotti aggiunti per primi' },
  { id: 'az', label: 'Alfabetico A–Z', hint: 'In ordine di nome' },
  { id: 'reparto', label: 'Per reparto', hint: 'Frutta, verdura, pane… come tra gli scaffali' },
]

const Svg = ({ children, size = 26 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
const ICON = {
  view: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  theme: <><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 0 0 16Z" fill="currentColor" /></>,
  list: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r=".8" fill="currentColor" /><circle cx="4" cy="12" r=".8" fill="currentColor" /><circle cx="4" cy="18" r=".8" fill="currentColor" /></>,
  order: <path d="M7 4v16M7 4 4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3" />,
  members: <><circle cx="9" cy="8.5" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="16.5" cy="9.5" r="2.4" /><path d="M15.6 13.9A4.5 4.5 0 0 1 20.5 19" /></>,
  pen: <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z" />,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></>,
}

const Header = ({ title, onBack }) => (
  <div className="set-head">
    <button type="button" className="set-back" onClick={onBack} aria-label="Indietro">‹</button>
    <h1>{title}</h1>
  </div>
)

const Radio = ({ on }) => <span className={`radio ${on ? 'on' : ''}`} aria-hidden="true">{on && '✓'}</span>

const PhonePreview = ({ mode }) => (
  <span className={`phone-prev ${mode}`} aria-hidden="true">
    <span className="pp-line" /><span className="pp-row red"><i /><i /><i /></span>
    <span className="pp-line short" /><span className="pp-row green"><i /><i /><i /></span>
    <span className="pp-bar" />
  </span>
)

export default function ShoppingSettings({ start, lists, items, store, onClose, onDeleted }) {
  // start: 'menu' oppure { list: id } per aprire direttamente le impostazioni di una lista
  const [screen, setScreen] = useState(start)
  // attenzione: le stringhe hanno .sub (metodo storico di JS), quindi si controlla che sia un oggetto
  const obj = typeof screen === 'object' && screen ? screen : null
  const [prefs, setP] = useState(getPrefs)
  const upd = (patch) => setP(setPrefs(patch))
  const [member, setMember] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)

  const back = () => {
    if (screen === 'menu' || (typeof start === 'object' && obj?.list && !obj.sub)) return onClose()
    if (obj?.sub) return setScreen({ list: obj.list })
    if (obj?.list) return setScreen('pick')
    setScreen('menu')
  }
  const list = obj?.list ? lists.find((l) => l.id === obj.list) : null

  if (screen === 'menu') {
    return (
      <div className="set-page">
        <Header title="Impostazioni" onBack={onClose} />
        <div className="set-menu">
          <button type="button" onClick={() => setScreen('view')}><Svg>{ICON.view}</Svg> Visualizzazione lista</button>
          <button type="button" onClick={() => setScreen('theme')}><Svg>{ICON.theme}</Svg> Tema</button>
          <button type="button" onClick={() => setScreen('pick')}><Svg>{ICON.list}</Svg> Impostazioni lista</button>
        </div>
      </div>
    )
  }

  if (screen === 'view') {
    return (
      <div className="set-page">
        <Header title="Visualizzazione lista" onBack={back} />
        <div className="view-pick" role="radiogroup" aria-label="Visualizzazione">
          {[['lista', 'Lista'], ['riquadri', 'Riquadri']].map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={prefs.view === id} className="view-opt" onClick={() => upd({ view: id })}>
              <span className={`view-art ${id}`} aria-hidden="true">{id === 'lista' ? [0, 1, 2, 3, 4].map((k) => <i key={k} />) : [0, 1, 2, 3, 4, 5].map((k) => <i key={k} />)}</span>
              <span className="view-label">{label}</span>
              <Radio on={prefs.view === id} />
            </button>
          ))}
        </div>
        <label className="set-toggle">
          <span>
            <b>Raggruppa gli articoli della tua lista</b>
            <small>Raggruppa per reparto gli articoli della lista (frutta, verdura, pane…).</small>
          </span>
          <input type="checkbox" role="switch" checked={prefs.group} onChange={(e) => upd({ group: e.target.checked })} />
        </label>
      </div>
    )
  }

  if (screen === 'theme') {
    const opts = [
      ['dark', 'Modalità scura', 'Tutti gli sfondi in tonalità scura: più riposante la sera e consuma meno batteria.'],
      ['light', 'Modalità chiara', 'Tutti gli sfondi in tonalità chiara, per un aspetto fresco.'],
      ['system', 'Sistema', "L'aspetto segue automaticamente quello del telefono."],
    ]
    return (
      <div className="set-page">
        <Header title="Tema" onBack={back} />
        <p className="set-intro">Money Grabber si adatta a te. Scegli tra tre varianti e cambiala quando vuoi.</p>
        <div className="theme-list" role="radiogroup" aria-label="Tema">
          {opts.map(([id, title, text]) => (
            <button key={id} type="button" role="radio" aria-checked={prefs.theme === id} className={`theme-opt ${prefs.theme === id ? 'on' : ''}`} onClick={() => upd({ theme: id })}>
              <PhonePreview mode={id} />
              <span className="theme-txt"><b>{title}</b><span>{text}</span></span>
              <span className="theme-check" aria-hidden="true">{prefs.theme === id ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (screen === 'pick') {
    return (
      <div className="set-page">
        <Header title="Impostazioni lista" onBack={back} />
        <p className="set-intro">Scegli la lista che vuoi modificare.</p>
        {lists.length === 0 ? <p className="set-intro">Non hai ancora creato liste.</p> : (
          <div className="set-menu plain">
            {lists.map((l) => <button key={l.id} type="button" onClick={() => setScreen({ list: l.id })}>{l.name}</button>)}
          </div>
        )}
      </div>
    )
  }

  if (!list) return null

  if (obj.sub === 'order') {
    const cur = list.sort || 'recent'
    return (
      <div className="set-page">
        <Header title="Ordine" onBack={back} />
        <div className="set-menu radio-list" role="radiogroup" aria-label="Ordine">
          {SORTS.map((s) => (
            <button key={s.id} type="button" role="radio" aria-checked={cur === s.id} onClick={() => store?.patchItem('shl', list.id, { sort: s.id })}>
              <span className="grow"><b>{s.label}</b><small>{s.hint}</small></span>
              <Radio on={cur === s.id} />
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (obj.sub === 'members') {
    const members = list.members || []
    return (
      <div className="set-page">
        <Header title="Membri della lista" onBack={back} />
        <div className="set-menu plain">
          {members.length === 0 && <p className="set-intro">Nessun membro. Aggiungi chi fa la spesa con te.</p>}
          {members.map((m, i) => (
            <div key={i} className="member-row">
              <span className="grow">{m}</span>
              <button type="button" className="icon" onClick={() => store?.patchItem('shl', list.id, { members: members.filter((_, k) => k !== i) })} aria-label={`Rimuovi ${m}`}>✕</button>
            </div>
          ))}
        </div>
        <form className="shop-add" onSubmit={(e) => { e.preventDefault(); const n = member.trim(); if (!n) return; store?.patchItem('shl', list.id, { members: [...members, n] }); setMember('') }}>
          <input className="field" placeholder="Nome" value={member} onChange={(e) => setMember(e.target.value)} aria-label="Nome membro" />
          <button type="submit" className="round-btn accent" disabled={!member.trim()} aria-label="Aggiungi membro">+</button>
        </form>
        <p className="set-note">I membri per ora sono solo nomi: per far vedere la lista ad altre persone serve condividere la pagina.</p>
      </div>
    )
  }

  if (obj.sub === 'name') {
    return <NameAndTheme list={list} store={store} onBack={back} />
  }

  // Personalizza lista
  return (
    <div className="set-page">
      <Header title="Impostazioni lista" onBack={back} />
      <div className={`list-banner big lc-${themeOf(list).color}`}>
        <ThemeBadge theme={themeOf(list)} />
        <h2>{list.name}</h2>
      </div>
      <section className="custom-panel">
        <Svg size={34}>{ICON.gear}</Svg>
        <h3>Personalizza lista</h3>
        <div className="custom-grid">
          <button type="button" onClick={() => setScreen({ list: list.id, sub: 'order' })}><Svg>{ICON.order}</Svg>Ordine</button>
          <button type="button" onClick={() => setScreen('view')}><Svg>{ICON.view}</Svg>Visualizzazione</button>
          <button type="button" onClick={() => setScreen({ list: list.id, sub: 'members' })}><Svg>{ICON.members}</Svg>Membri della lista</button>
          <button type="button" onClick={() => setScreen({ list: list.id, sub: 'name' })}><Svg>{ICON.pen}</Svg>Nome e tema</button>
        </div>
      </section>
      <button type="button" className={`danger-btn ${confirmDel ? 'armed' : ''}`} onClick={() => {
        if (!confirmDel) { setConfirmDel(true); return }
        items.filter((i) => i.listId === list.id).forEach((i) => store?.removeItem('shop', i.id))
        store?.removeItem('shl', list.id)
        onDeleted()
      }}>
        {confirmDel ? 'Tocca di nuovo per eliminare' : 'Elimina questa lista'}
      </button>
    </div>
  )
}

function NameAndTheme({ list, store, onBack }) {
  const [name, setName] = useState(list.name)
  const [theme, setTheme] = useState(themeOf(list).id)
  const t = THEMES.find((x) => x.id === theme)
  const save = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    store?.patchItem('shl', list.id, { name: name.trim(), theme, color: t.color })
    onBack()
  }
  return (
    <form className="set-page" onSubmit={save}>
      <Header title="Nome e tema" onBack={onBack} />
      <div className={`list-banner big lc-${t.color}`}><ThemeBadge theme={t} /><h2>{name || ' '}</h2></div>
      <input className="field big-field" value={name} onChange={(e) => setName(e.target.value)} aria-label="Nome della lista" />
      <p className="set-intro">Tema della lista</p>
      <ThemePicker value={theme} onChange={setTheme} />
      <button type="submit" className="primary" disabled={!name.trim()}>Salva</button>
    </form>
  )
}
