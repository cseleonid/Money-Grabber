# Money-Grabber

App React + Vite per tenere traccia delle spese mensili.

- **Grafico a torta** in alto con le spese raggruppate per macro categoria (clic su una fetta o sulla legenda per filtrare la lista).
- **Lista delle spese** del mese, con stella per segnare una spesa come superflua.
- **Box "Spese superflue da controllare"** in fondo: include le spese segnate a mano e quelle delle categorie superflue in automatico (di default *Svago* e *Abbonamenti*, modificabile da "Gestisci categorie"). Spunta ogni spesa quando l'hai controllata.
- Selettore del mese per consultare lo storico.

I dati restano nel browser (localStorage).

## Avvio

```bash
npm install
npm run dev
```

Build di produzione: `npm run build` (output in `dist/`).

## Versione da telefono (Artifact claude.ai)

`npm run build:artifact` crea `dist-artifact/money-grabber.html`, un unico file pubblicato come Artifact privato su claude.ai.
Lì i dati vengono salvati nel tuo account (area privata per utente), quindi sono gli stessi da telefono e da PC.
Fuori da claude.ai (es. `npm run dev`) l'app usa il localStorage del browser.
