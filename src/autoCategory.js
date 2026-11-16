// Categoria automatica dalla descrizione: prima impara dalle spese già inserite,
// poi usa parole chiave comuni. Restituisce l'id della categoria o null.
const RULES = [
  ['casa', /affitt|mutuo|condomin|ikea|mobil|arred|elettrodom|ferramenta|bricolage|leroy/],
  ['bollette', /\bluce\b|\bgas\b|acqua|enel|eni\b|bolletta|internet|fibra|telefon|\btim\b|vodafone|fastweb|iliad|wind|tari|a2a|hera|iren/],
  ['trasporti', /benzin|carburant|diesel|gasolio|treno|trenitalia|italo|\bbus\b|autobus|metro|taxi|uber|autostrad|telepass|parchegg|bollo|meccanico|gomme|monopattino/],
  ['salute', /farmac|medic|dentist|visita|analisi|ottic|ospedal|ticket|fisioterap|psicolog/],
  ['abbonamenti', /netflix|spotify|disney|prime|amazon prime|abbonament|palestra|dazn|now tv|sky|youtube premium|icloud|google one|apple music/],
  ['svago', /asporto|pizz|sushi|kebab|hamburger|burger|deliveroo|glovo|just ?eat|ristorant|trattoria|osteria|\bbar\b|aperitiv|caff[eè] al bar|cinema|concert|teatro|museo|viaggi|hotel|vacanz|gelat|pub\b|discoteca|libr[oi]|videogioc/],
  ['alimentari', /spesa|supermerc|esselunga|coop|conad|lidl|carrefour|eurospin|pam\b|despar|penny|aldi|md\b|panett|pane|frutta|verdura|macelleria|pescheria|mercato|alimentar|latte|uova/],
]

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

export function suggestCategory(text, history = [], validIds = []) {
  const t = norm(text || '')
  if (t.length < 2) return null
  const ok = (id) => !validIds.length || validIds.includes(id)
  // 1) impara dalle tue spese: stessa descrizione o descrizione che contiene la parola
  const past = history.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  const exact = past.find((e) => norm(e.description || '') === t && ok(e.categoryId))
  if (exact) return exact.categoryId
  const partial = past.find((e) => { const d = norm(e.description || ''); return d.length > 2 && (d.includes(t) || t.includes(d)) && ok(e.categoryId) })
  if (partial) return partial.categoryId
  // 2) parole chiave
  const rule = RULES.find(([id, re]) => ok(id) && re.test(t))
  return rule ? rule[0] : null
}
