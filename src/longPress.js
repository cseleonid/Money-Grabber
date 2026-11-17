import { useEffect, useRef, useState } from 'react'

// Pressione lunga su una riga per mostrare il pulsante "elimina".
// Telefono: tieni premuto ~0,5 s · computer: tasto destro · tastiera: Canc/Backspace sulla riga.
export function useLongPressReveal(ms = 500) {
  const [revealed, setRevealed] = useState(null)
  const t = useRef(null)
  const start = useRef(null)
  useEffect(() => {
    if (!revealed) return
    const close = (e) => { if (!e.target.closest?.(`[data-lp="${revealed}"]`)) setRevealed(null) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [revealed])
  const cancel = () => { clearTimeout(t.current); t.current = null }
  const bind = (id) => ({
    'data-lp': id,
    tabIndex: 0,
    onPointerDown: (e) => {
      if (e.target.closest('button')) return
      start.current = { x: e.clientX, y: e.clientY }
      cancel()
      t.current = setTimeout(() => { setRevealed(id); navigator.vibrate?.(15) }, ms)
    },
    onPointerMove: (e) => { if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 8) cancel() },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (e) => { e.preventDefault(); setRevealed(id) },
    onKeyDown: (e) => { if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); setRevealed(id) } },
  })
  return { revealed, bind, hide: () => setRevealed(null) }
}
