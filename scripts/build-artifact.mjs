// Crea un unico file HTML (JS e CSS inline) da pubblicare come Artifact su claude.ai.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'

const assets = readdirSync('dist/assets')
const js = readFileSync('dist/assets/' + assets.find((f) => f.endsWith('.js')), 'utf8')
const css = readFileSync('dist/assets/' + assets.find((f) => f.endsWith('.css')), 'utf8')
const safeJs = js.replace(/<\/script/gi, '<\\/script')

const html = `<title>Money Grabber</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>${css}</style>
<div id="root"></div>
<script type="module">${safeJs}</script>
`
mkdirSync('dist-artifact', { recursive: true })
writeFileSync('dist-artifact/money-grabber.html', html)
console.log('dist-artifact/money-grabber.html', (html.length / 1024).toFixed(0) + ' KB')
