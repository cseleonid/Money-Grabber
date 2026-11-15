import { useState } from 'react'
import { formatEur } from './data.js'

// Grafico a ciambella in SVG puro. Gap di 2px tra le fette (colore superficie),
// tooltip al passaggio del mouse/tap, legenda con importi e percentuali.
const SIZE = 220
const R = 100
const INNER = 62
const C = SIZE / 2

function polar(r, a) {
  return [C + r * Math.sin(a), C - r * Math.cos(a)]
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

export default function PieChart({ data, total, selected, onSelect }) {
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

  return (
    <div className="pie-wrap">
      <div className="pie-svg-wrap">
        {total === 0 ? (
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="pie-svg" role="img" aria-label="Nessuna spesa">
            <circle cx={C} cy={C} r={(R + INNER) / 2} fill="none" stroke="var(--border)" strokeWidth={R - INNER} />
            <text x={C} y={C + 5} textAnchor="middle" className="pie-center-sub">Nessuna spesa</text>
          </svg>
        ) : (
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="pie-svg" role="img" aria-label="Spese per categoria">
            {arcs.map((a) => (
              <path
                key={a.id}
                d={arcPath(a.a0, a.a1)}
                fill={`var(--series-${a.slot})`}
                stroke="var(--surface)"
                strokeWidth={2}
                strokeLinejoin="round"
                opacity={selected && selected !== a.id ? 0.35 : 1}
                className="pie-slice"
                onMouseEnter={() => setHover(a)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(selected === a.id ? null : a.id)}
              >
                <title>{`${a.name}: ${formatEur(a.value)} (${((a.value / total) * 100).toFixed(1)}%)`}</title>
              </path>
            ))}
            {focus ? (
              <>
                <text x={C} y={C - 8} textAnchor="middle" className="pie-center-sub">{focus.name}</text>
                <text x={C} y={C + 14} textAnchor="middle" className="pie-center-main">{formatEur(focus.value)}</text>
                <text x={C} y={C + 32} textAnchor="middle" className="pie-center-sub">
                  {((focus.value / total) * 100).toFixed(1)}%
                </text>
              </>
            ) : (
              <>
                <text x={C} y={C - 4} textAnchor="middle" className="pie-center-sub">Totale</text>
                <text x={C} y={C + 18} textAnchor="middle" className="pie-center-main">{formatEur(total)}</text>
              </>
            )}
          </svg>
        )}
      </div>

      <ul className="legend">
        {data.map((d) => {
          const pct = total ? (d.value / total) * 100 : 0
          return (
            <li key={d.id}>
              <button
                type="button"
                className={`legend-item ${selected === d.id ? 'active' : ''} ${d.value === 0 ? 'empty' : ''}`}
                onClick={() => onSelect(selected === d.id ? null : d.id)}
                onMouseEnter={() => d.value > 0 && setHover(arcs.find((a) => a.id === d.id))}
                onMouseLeave={() => setHover(null)}
              >
                <span className="swatch" style={{ background: `var(--series-${d.slot})` }} />
                <span className="legend-name">{d.name}</span>
                <span className="legend-val">{formatEur(d.value)}</span>
                <span className="legend-pct">{pct.toFixed(0)}%</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
