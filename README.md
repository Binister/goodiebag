# Politie Afluistercentrale

Politiespeurtocht-app voor een kinderfeestje (7 kinderen, 4-6 jaar): de
kinderen voeren de pincode van de telefoon van "de boef" in, "luisteren" zijn
gesprek af en hacken zijn live-camerabeeld om zijn schuilplaats te vinden.
Eén iPhone, Safari, één ouder bedient onzichtbaar de voortgang. Zie
[spec-afluister-app.md](spec-afluister-app.md) voor de volledige spec.

Gebouwd met Vue 3 + Vite, offline-first via een service worker
(vite-plugin-pwa) die alle audio/video precachet.

## Ontwikkelen

```
npm install
npm run dev
```

## Placeholder-assets opnieuw genereren

Alle audio (`public/assets/audio/*.mp3`) en de video
(`public/assets/video/boef-live.mp4`) zijn nu placeholders: audio via macOS
`say` (Nederlandse TTS) en video een ffmpeg-testpatroon. Opnieuw genereren
(macOS met `say` nodig):

```
npm run gen:placeholders
```

### Checklist: placeholders vervangen door echte opnames

Vervang onderstaande bestanden 1-op-1 (zelfde bestandsnaam, audio als mp3,
video als mp4 portret 9:16, <20MB):

- [ ] `public/assets/audio/meldkamer-welkom.mp3` — welkom + "meld je aan met je vingerafdruk"
- [ ] `public/assets/audio/meldkamer-pincode.mp3` — instructie pincode invoeren
- [ ] `public/assets/audio/meldkamer-fout-pincode.mp3` — "deze pincode klopt niet"
- [ ] `public/assets/audio/meldkamer-goed-pincode.mp3` — "pincode gekraakt, apparatuur wordt gekoppeld"
- [ ] `public/assets/audio/meldkamer-frequentie.mp3` — instructie frequentiepuzzel
- [ ] `public/assets/audio/meldkamer-hack.mp3` — "we zijn binnen, live beeld..."
- [ ] `public/assets/audio/meldkamer-slot.mp3` — "locatie herkend, ga erop af..."
- [ ] `public/assets/audio/boef-fragmenten.mp3` — loopende stem-knipsels voor de puzzel
- [ ] `public/assets/audio/boef-gesprek.mp3` — het volledige afgeluisterde gesprek
- [ ] `public/assets/video/boef-live.mp4` — 15-30 sec, portret 9:16, H.264, <20MB
- [ ] `public/icons/icon-192.png` / `icon-512.png` — eigen app-icoon (optioneel)

Na vervangen: `npm run build` en opnieuw deployen (of gewoon pushen naar
`main`, de GitHub Actions workflow doet dit automatisch).

## Deployen naar GitHub Pages

Eenmalig in de GitHub-repo instellen: **Settings → Pages → Source: GitHub
Actions**. Daarna bouwt en deployt `.github/workflows/deploy.yml` de app
automatisch bij elke push naar `main`. De app komt op
`https://binister.github.io/goodiebag/`.

## PWA installeren op de iPhone (Add to Home Screen)

1. Open de gedeployde URL in Safari.
2. Tik op het deel-icoon (vierkant met pijl omhoog).
3. Kies "Zet op beginscherm".
4. Open de app vanaf het beginscherm — na de eerste keer laden werkt hij
   ook zonder internetverbinding (bijv. in vliegtuigmodus).

## Testchecklist (op het echte toestel, niet vanuit dev-omgeving te verifiëren)

- [ ] Volledige flow werkt in vliegtuigmodus, ook na 10 minuten stilstand.
- [ ] Eerste tik op AANMELDEN unlockt audio; video start betrouwbaar via de hack-knop.
- [ ] Scherm gaat niet op slot tijdens gebruik (Wake Lock).
- [ ] Pinch-zoom, dubbeltik-zoom en pull-to-refresh zijn geblokkeerd.
- [ ] Vingerafdrukscanner werkt meteen voor het eerste kind; gaat daarna op
      slot en vereist de arm-gesture (tik rechtsonder) van de ouder voor elk
      volgend kind.
- [ ] Verborgen oudercontrols werken: 3× tik rechtsboven (volgende), 3× tik
      linksboven (vorige), 3 sec indrukken linksonder (reset).

## Verborgen oudercontrols

Onzichtbare hit-areas (~96×96px, iets ingesprongen vanaf de randen) in de
hoeken van het scherm:

- Tik rechtsonder → arm de vingerafdrukscanner voor het volgende kind
  (scanner werkt voor het eerste kind meteen, en gaat na elke geslaagde
  scan weer op slot)
- 3× tik rechtsboven → volgende scherm (skip)
- 3× tik linksboven → vorig scherm
- Lang indrukken (3 sec) linksonder → volledige reset
