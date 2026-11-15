// Icone a linea dei prodotti, scelte in automatico dal nome (parole chiave italiane).
const P = {
  pane: <><path d="M3.5 13.5c0-3.6 3.8-6 8.5-6s8.5 2.4 8.5 6c0 1.7-1.3 3-3 3h-11c-1.7 0-3-1.3-3-3Z" /><path d="M8 8.5 9 12M12 7.8v4M16 8.5 15 12" /></>,
  latte: <><path d="M8 7.5 10 3h4l2 4.5V20a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z" /><path d="M8 7.5h8M8 12h8" /></>,
  uova: <><path d="M9 20c-3 0-5-2.3-5-5.5S6.2 6 9 6s5 5.3 5 8.5S12 20 9 20Z" /><path d="M16.5 17.5c2.2-.4 3.5-2.2 3.5-4.6 0-2.7-1.7-6.4-4.2-6.9" /></>,
  frutta: <><path d="M12 7.5c-3-2.2-7.5-.2-7.5 4.6S8 21.2 12 19.3c4 1.9 7.5-2.4 7.5-7.2S15 5.3 12 7.5Z" /><path d="M12 7.5c0-2.2 1-3.7 3-4.4" /></>,
  banana: <><path d="M4 7c1 7 6 11 13 10 1.5-.2 2.5-1.2 2.5-2.2-5 .8-9.5-2.2-11.3-8.6Z" /><path d="M8.2 6.2 7.6 4" /></>,
  verdura: <><path d="M4.5 19.5 14.8 9.2a3 3 0 0 0-4-4L4.5 19.5Z" /><path d="m14.8 9.2 4.2-3.7M13 7l2.6-3.8M16.8 11.2l3.7-2.4" /></>,
  formaggio: <><path d="M3 15.5 14 6l7 6v6.5H3Z" /><path d="M3 15.5h18" /><circle cx="9" cy="17" r=".9" /><circle cx="15" cy="16.8" r="1.1" /></>,
  carne: <><path d="M14.5 4.5c3.5 0 6 2.7 5 6.2-1 3.6-5.6 7.8-10.2 8.6-3.3.6-5.6-1.4-4.8-4.4 1-3.9 6.3-10.4 10-10.4Z" /><circle cx="14.5" cy="9.5" r="2" /></>,
  pesce: <><path d="M3 12c3-4.5 9.5-5.5 14-1.5L21 7v10l-4-3.5C12.5 17.5 6 16.5 3 12Z" /><circle cx="7.5" cy="11.3" r=".8" /></>,
  pasta: <><path d="M5 20 19 6M7.5 20 20 7.5M5 17.5 17.5 5" /></>,
  bottiglia: <path d="M10 2.8h4v3.4l2 3.1v10.9a1.6 1.6 0 0 1-1.6 1.6H9.6A1.6 1.6 0 0 1 8 20.2V9.3l2-3.1Z M8 13h8" />,
  vino: <><path d="M8 3h8v4a4 4 0 0 1-8 0Z" /><path d="M12 11v9M8.5 20.5h7" /></>,
  caffe: <><path d="M4.5 9h12v5.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Z" /><path d="M16.5 10.5h1.5a2.5 2.5 0 0 1 0 5h-1.5M8 3.5v2.5M11 3.5v2.5M14 3.5v2.5" /></>,
  biscotti: <><circle cx="9" cy="12" r="5.5" /><circle cx="16.5" cy="12" r="4.5" /><path d="M7.5 10.5h.01M10 13.5h.01M8 14h.01M16 10.5h.01M17.5 13h.01" /></>,
  salsa: <><path d="M10 2.5h4v2.5l1.5 2.5V20a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V7.5L10 5Z" /><circle cx="12" cy="13.5" r="2.5" /></>,
  detersivo: <><path d="M9.5 3h4v3h-4Z" /><path d="M8 6h7l1.5 3v11a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V9Z" /><path d="M9 15c1.5 1.2 3.5 1.2 5 0" /></>,
  carta: <><rect x="4" y="5" width="12" height="15" rx="2" /><path d="M16 8h2.5a1.5 1.5 0 0 1 1.5 1.5V20M4 9h12" /></>,
  animali: <><circle cx="7" cy="9" r="1.8" /><circle cx="11" cy="6.5" r="1.8" /><circle cx="15" cy="7.5" r="1.8" /><circle cx="17.8" cy="11.5" r="1.6" /><path d="M8.5 18c0-3 1.8-5.5 4.2-5.5S17 15 16 17.5c-.7 1.6-2.5 1.5-3.6 1-1 .7-3.9 1.3-3.9-.5Z" /></>,
  sacchetto: <><path d="M5 8h14l-1.2 12.5H6.2Z" /><path d="M9 8V6.2a3 3 0 0 1 6 0V8" /></>,
}

const KEYS = [
  [/pane|panin|baguette|cracker|grissin|focacc|piadin/, 'pane'],
  [/latte|yogurt|panna|burro/, 'latte'],
  [/uov/, 'uova'],
  [/banan/, 'banana'],
  [/mel[ae]|per[ae]|aranc|frutt|limon|kiwi|fragol|uva|pesch/, 'frutta'],
  [/porr|carot|insalat|verdur|zucchin|pomodor|cipoll|patat|spinac|broccol|lattuga/, 'verdura'],
  [/formagg|mozzarell|parmig|grana|ricott/, 'formaggio'],
  [/carne|pollo|manzo|maiale|salsicc|prosciut|salame|wurstel|bistecc/, 'carne'],
  [/pesce|tonno|salmone|merluzz|gamber/, 'pesce'],
  [/pasta|spaghett|penne|riso|farina|fusill/, 'pasta'],
  [/vino|birra|prosecco/, 'vino'],
  [/acqua|bibit|succo|coca|aranciat|olio|aceto/, 'bottiglia'],
  [/caff|tè\b|the\b|tisan|camomill/, 'caffe'],
  [/biscott|gocciol|merend|cioccol|torta|dolc|crostat/, 'biscotti'],
  [/salsa|sugo|ketchup|maionese|senape|pesto|passata/, 'salsa'],
  [/detersiv|candeggin|sapone|ammorbid|sgrassat|shampoo|bagnoschiuma|dentifric|spray/, 'detersivo'],
  [/carta|scottex|swiffer|tovagliol|fazzolett|spugn|panno/, 'carta'],
  [/gatt|cane|croccant|lettiera|scatolett|crocchett/, 'animali'],
]

export const iconFor = (name) => {
  const n = name.toLowerCase()
  return (KEYS.find(([re]) => re.test(n)) || [null, 'sacchetto'])[1]
}

export function ProductIcon({ name, size = 64 }) {
  return (
    <svg className="prod-icon" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[iconFor(name)]}
    </svg>
  )
}

// Reparti per "Raggruppa gli articoli" e per l'ordine "Per reparto"
export const GROUPS = [
  ['frutta', 'Frutta'], ['banana', 'Frutta'], ['verdura', 'Verdura'],
  ['pane', 'Pane e forno'], ['latte', 'Latte e latticini'], ['formaggio', 'Formaggi'], ['uova', 'Uova'],
  ['carne', 'Carne e salumi'], ['pesce', 'Pesce'], ['pasta', 'Pasta, riso e farine'],
  ['salsa', 'Salse e condimenti'], ['biscotti', 'Dolci e snack'], ['caffe', 'Colazione'],
  ['bottiglia', 'Bevande'], ['vino', 'Vino e birra'],
  ['detersivo', 'Casa e igiene'], ['carta', 'Carta e pulizia'], ['animali', 'Animali'], ['sacchetto', 'Altro'],
]
const GROUP_OF = Object.fromEntries(GROUPS)
const GROUP_ORDER = [...new Set(GROUPS.map(([, g]) => g))]
export const groupFor = (name) => GROUP_OF[iconFor(name)] || 'Altro'
export const groupRank = (name) => GROUP_ORDER.indexOf(groupFor(name))
