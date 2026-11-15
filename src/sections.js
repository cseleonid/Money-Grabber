// Le sezioni raggiungibili dal pallino 🐙. Ogni sezione ha emoji e colore propri:
// il colore diventa il tema della pagina (accento + sfondo leggermente tinto).
export const SECTIONS = [
  { id: 'personale', name: 'Personale', emoji: '💰', hint: 'Le tue spese del mese' },
  { id: 'calendario', name: 'Calendario', emoji: '📅', hint: 'Appuntamenti e scadenze' },
  { id: 'spesa', name: 'Lista della spesa', emoji: '🛒', hint: 'Cosa comprare' },
  { id: 'todo', name: 'To Do List', emoji: '✅', hint: 'Cose da fare' },
  { id: 'condivise', name: 'Spese condivise', emoji: '🤝', hint: 'Chi deve cosa a chi' },
]

export const sectionFromHash = () => {
  const h = (typeof location !== 'undefined' ? location.hash : '').replace('#', '')
  return SECTIONS.some((s) => s.id === h) ? h : 'personale'
}
