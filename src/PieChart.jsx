import { useState } from 'react'
import { formatEur } from './data.js'
import { CategoryIcon } from './icons.jsx'

// Grafico a ciambella in SVG puro. Gap di 2px tra le fette (colore superficie),
// tooltip al passaggio del mouse/tap, legenda con importi e percentuali.
const SIZE = 220
const R = 100
const INNER = 91
const C = SIZE / 2

function polar(r, a) {
  return [C + r * Math.sin(a), C - r * Math.cos(a)]
}

// fette con le estremità arrotondate: arco disegnato come tratto con linecap tondo,
// accorciato di metà spessore (+ un piccolo spazio) per non sovrapporsi alla fetta vicina
const MID = (R + INNER) / 2
const W = R - INNER
const GAP = 3
function roundArc(a0, a1, single) {
  if (single) return null
  const pad = (W / 2 + GAP / 2) / MID
  let s = a0 + pad, e = a1 - pad
  if (e <= s) { const m = (a0 + a1) / 2; s = m - 0.0005; e = m + 0.0005 } // fetta minuscola: un pallino
  const large = e - s > Math.PI ? 1 : 0
  const [x0, y0] = polar(MID, s)
  const [x1, y1] = polar(MID, e)
  return `M${x0},${y0} A${MID},${MID} 0 ${large} 1 ${x1},${y1}`
}

function arcPath(a0, a1) {
  // un'unica fetta al 100%: disegna due semicerchi
  if (a1 - a0 >= Math.PI * 2 - 1e-6) a1 = a0 + Math.PI * 2 - 1e-4
  const large = a1 - a0 > Math.PI ? 1 : 0
  const [x0, y0] = polar(R, a0)
  const [x1, y1] = polar(R, a1)
  const [x2, y2] = polar(INNER, a1)
  const [x3, y3] = polar(INNER, a0)
  return `M${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${INNER},${INNER} 0 ${large} 0 ${x3},${y3} Z`
}

export default function PieChart({ data, total, selected, onSelect, onOpen, hideEmpty = false, centerLabel = 'Totale', showLegend = true, corner = null }) {
  const [hover, setHover] = useState(null)
  const slices = data.filter((d) => d.value > 0)

  let acc = 0
  const arcs = slices.map((d) => {
    const a0 = (acc / total) * Math.PI * 2
    acc += d.value
    const a1 = (acc / total) * Math.PI * 2
    return { ...d, a0, a1 }
  })

  const focus = hover ?? arcs.find((a) => a.id === selected) ?? null
  const pop = focus && focus.items?.length > 0 ? focus : null

  return (
    <div className="pie-wrap">
      <div className="pie-svg-wrap"><div className="pie-box">
        {total === 0 ? (
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="pie-svg" role="img" aria-label="Nessuna spesa">
            <circle cx={C} cy={C} r={(R + INNER) / 2} fill="none" stroke="var(--border)" strokeWidth={R - INNER} />
            <text x={C} y={C + 5} textAnchor="middle" className="pie-center-sub">Nessuna spesa</text>
          </svg>
        ) : (
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="pie-svg" role="img" aria-label="Spese per categoria">
            {arcs.map((a) => {
              const single = arcs.length === 1
              const common = {
                className: 'pie-slice',
                opacity: selected && selected !== a.id ? 0.35 : 1,
                onMouseEnter: () => setHover(a),
                onMouseLeave: () => setHover(null),
                // primo tocco: mostra percentuale; secondo tocco sulla stessa fetta: apre la pagina della categoria
                onClick: () => (selected === a.id && onOpen ? onOpen(a.id) : onSelect(a.id)),
              }
              const title = <title>{`${a.name}: ${formatEur(a.value)} (${((a.value / total) * 100).toFixed(1)}%)`}</title>
              return single ? (
                <circle key={a.id} cx={C} cy={C} r={MID} fill="none" stroke={`var(--series-${a.slot})`} strokeWidth={W} {...common}>{title}</circle>
              ) : (
                <path key={a.id} d={roundArc(a.a0, a.a1)} fill="none" stroke={`var(--series-${a.slot})`} strokeWidth={W} strokeLinecap="round" {...common}>{title}</path>
              )
            })}
            {pop ? null : focus ? (
              <>
                <text x={C} y={C - 20} textAnchor="middle" className="pie-center-sub">{focus.name}</text>
                <text x={C} y={C + 10} textAnchor="middle" className="pie-center-pct">
                  {((focus.value / total) * 100).toLocaleString('it-IT', { maximumFractionDigits: 1 })}%
                </text>
                <text x={C} y={C + 30} textAnchor="middle" className="pie-center-sub">{formatEur(focus.value)}</text>
                {onOpen && selected === focus.id && (
                  <text x={C} y={C + 52} textAnchor="middle" className="pie-center-open" onClick={() => onOpen(focus.id)}>Apri ›</text>
                )}
              </>
            ) : (
              <>
                <text x={C} y={C - 4} textAnchor="middle" className="pie-center-sub">{centerLabel}</text>
                <text x={C} y={C + 18} textAnchor="middle" className="pie-center-main">{formatEur(total)}</text>
              </>
            )}
          </svg>
        )}
        {pop && (
          // piccolo menù al centro del grafico: in alto il nome della categoria, sotto la lista compatta delle spese
          <div className="pie-pop" role="status">
            <div className="pie-pop-head">
              <CategoryIcon id={pop.id} slot={pop.slot} size={20} />
              <strong>{pop.name}</strong>
              <span className="pie-pop-pct">{((pop.value / total) * 100).toLocaleString('it-IT', { maximumFractionDigits: 0 })}%</span>
            </div>
            <ul>
              {pop.items.slice(0, 4).map((e) => (
                <li key={e.id}><span>{e.description || 'Spesa'}</span><b>{formatEur(e.amount)}</b></li>
              ))}
            </ul>
            {pop.items.length > 4 && <p className="pie-pop-more">+ altre {pop.items.length - 4}</p>}
            {onOpen && <button type="button" className="pie-pop-open" onClick={() => onOpen(pop.id)}>Apri ›</button>}
          </div>
        )}
        {corner}
      </div></div>

      {showLegend && <ul className="legend">
        {/* prima le categorie usate, poi quelle vuote (ordine scelto mantenuto in ciascun gruppo) */}
        {(hideEmpty ? data.filter((d) => d.value > 0) : [...data.filter((d) => d.value > 0), ...data.filter((d) => d.value <= 0)]).map((d) => {
          return (
            <li key={d.id}>
              <button
                type="button"
                className={`legend-item ${selected === d.id ? 'active' : ''} ${d.value === 0 ? 'empty' : ''}`}
                onClick={() => (onOpen ? onOpen(d.id) : onSelect(selected === d.id ? null : d.id))}
                onMouseEnter={() => d.value > 0 && setHover(arcs.find((a) => a.id === d.id))}
                onMouseLeave={() => setHover(null)}
              >
                <CategoryIcon id={d.id} slot={d.slot} size={28} />
                <span className="legend-name">{d.name}</span>
                <span className="legend-val">{formatEur(d.value)}</span>
                {onOpen && <span className="legend-chev" aria-hidden="true">›</span>}
              </button>
            </li>
          )
        })}
      </ul>}
    </div>
  )
}
