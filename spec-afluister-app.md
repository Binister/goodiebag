# Spec — Afluister-app "Politie Afluistercentrale"

## Context (kort)
Onderdeel van een politiespeurtocht op een kinderfeestje (7 kinderen, 4–6 jaar).
De kinderen hebben buiten een kaartje gevonden met het telefoonnummer van "de boef".
In deze app voeren ze dat nummer in, "luisteren" ze zijn telefoongesprek af en zien
ze een nep-live-videobeeld uit zijn telefoon dat verraadt waar hij zich verstopt.
Eén ouder begeleidt en bedient verborgen controls; de telefoon gaat van kind naar kind.

## Harde randvoorwaarden
- Eén iPhone, Safari. Buiten, mogelijk fel zonlicht → hoog contrast, grote elementen.
- Gebruikers kunnen **niet lezen**: alle functionele instructies via audio;
  tekst op scherm is alleen decor.
- **100% offline** zodra geladen; onbetrouwbaar netwerk op locatie.
- Totale ervaring max. 5 minuten.
- De ouder moet elke stap onzichtbaar kunnen sturen, overslaan of herstarten.

## Techniek
- Eén statische pagina: vanilla HTML/CSS/JS, geen framework, geen build-stap.
  Assets lokaal in `assets/`.
- Deploybaar naar Vercel/Netlify/GitHub Pages. Service worker die álles pre-cachet,
  inclusief de video; installeerbaar als PWA ("Add to Home Screen").
- iOS Safari:
  - Audio pas na user gesture → de eerste tik (AANMELDEN) unlockt de Web Audio
    context en pre-decodeert alle buffers. Video start via een eigen knop.
  - Wake Lock API om het scherm aan te houden (met fallback).
  - Pinch-zoom, dubbeltik-zoom en pull-to-refresh blokkeren.
- Audio-engine: Web Audio API (nodig voor realtime crossfade in de frequentiepuzzel).
  Witte ruis synthetiseren.
- Alle state in JS-geheugen; geen storage nodig.

## Flow — 5 schermen

### Scherm 0 — Start
- Donker scherm, "POLITIE AFLUISTERCENTRALE", mono-font, subtiele scanlijnen.
- Eén grote knop **AANMELDEN** → audio-unlock + welkom-audio speelt
  (`meldkamer-welkom.mp3`).

### Scherm 1 — Vingerafdrukscan
- Groot vingerafdruk-icoon; kind houdt duim op het scherm → scan-animatie ~2 sec
  (lijn beweegt op en neer, oplopende piepjes) → groen vinkje,
  "AGENT GEREGISTREERD", bevestigingstoon. Teller "AGENTEN: n" telt op.
- **Ouder-gestuurd tempo:** na elke geslaagde scan gaat de scanner op slot
  ("wachten op meldkamer..."). Dubbeltik rechtsonder (verborgen) armt de scanner
  voor het volgende kind. Doorgaan naar scherm 2 via de skip-gesture.

### Scherm 2 — Telefoonnummer invoeren
- Instructie-audio speelt (`meldkamer-nummer.mp3`).
- Invoerveld met het **native iOS-numerieke toetsenbord** (`type="tel"` /
  `inputmode="numeric"`) — geen eigen numpad bouwen. Ingetikte cijfers verschijnen
  in tien grote vakjes in groepering `06 - 21 07 21 07`; wissen via de native
  backspace. **Juist nummer: 0621072107.**
  Let op: font-size van het input-element ≥ 16px (voorkomt iOS auto-zoom bij focus)
  en focus vasthouden zodat het toetsenbord niet wegklapt tussen kinderen door.
- Compleet & fout: rode flits + zoemer + `meldkamer-fout-nummer.mp3`;
  onbeperkt opnieuw.
- Goed: groene flits, "NUMMER GEVONDEN — AFLUISTERAPPARATUUR WORDT GEKOPPELD",
  korte koppel-animatie met piepjes → scherm 3.

### Scherm 3 — Frequentiepuzzel (bewust simpel)
- Instructie-audio (`meldkamer-frequentie.mp3`).
- Eén dikke horizontale slider met naald over een frequentieschaal (retro-radio-look).
- Mechaniek: afstand tot doelfrequentie bepaalt lineaire crossfade
  ruis ↔ boef-stem (`boef-fragmenten.mp3`, loopend). In de doelzone lopen drie
  signaalbalkjes vol; **1,5 sec vasthouden → "SIGNAAL VERGRENDELD"** + lock-geluid.
- Ruime doelzone (kleutermotoriek); na 30 sec wordt de zone stilletjes 2× zo breed.
  Verder geen mechanieken.

### Scherm 4 — Onderschepping (payoff, twee fases)
- **Fase A:** "VERBINDING ONDERSCHEPT" + waveform-animatie; het afgeluisterde
  gesprek speelt (`boef-gesprek.mp3`). Grote replay-knop.
- **Fase B:** knop **"📹 CAMERA VERDACHTE HACKEN"** verschijnt → korte
  "we zijn binnen"-audio (`meldkamer-hack.mp3`) → video (`boef-live.mp4`)
  fullscreen portret met CSS-overlay: rode LIVE/REC-stip, lopende timestamp,
  "CAM VERDACHTE — VERBONDEN", signaalbalkjes, batterij-icoon.
- Slot: "LOCATIE HERKEND" + slotaudio (`meldkamer-slot.mp3`). Replay-knop video.

## Verborgen oudercontrols
Onzichtbare hit-areas (~80×80px) in de hoeken, geen zichtbare UI:
- Dubbeltik rechtsonder → arm de vingerafdrukscanner (alleen scherm 1)
- 3× tik rechtsboven → volgende scherm (skip)
- 3× tik linksboven → vorig scherm
- Lang indrukken (3 sec) linksonder → volledige reset

## Assets
Bouw eerst met placeholders (spraaksynthese/beeps + testvideo), exact deze
bestandsnamen, zodat echte opnames er later 1-op-1 in kunnen:

```
assets/audio/meldkamer-welkom.mp3        # welkom + "meld je aan met je vingerafdruk"
assets/audio/meldkamer-nummer.mp3        # instructie telefoonnummer invoeren
assets/audio/meldkamer-fout-nummer.mp3   # "dit nummer is niet in gebruik"
assets/audio/meldkamer-goed-nummer.mp3   # "nummer gevonden, apparatuur wordt gekoppeld"
assets/audio/meldkamer-frequentie.mp3    # instructie frequentiepuzzel
assets/audio/meldkamer-hack.mp3          # "we zijn binnen, live beeld..."
assets/audio/meldkamer-slot.mp3          # "alle agenten: naar de speeltuin!"
assets/audio/boef-fragmenten.mp3         # loopende stem-knipsels voor de puzzel
assets/audio/boef-gesprek.mp3            # het volledige afgeluisterde gesprek
assets/video/boef-live.mp4               # 15–30 sec, portret 9:16, H.264, < 20 MB
```
Sfx (zoemer, piepjes, lock, scan) mogen gesynthetiseerd of royalty-free zijn en in
de app zelf zitten. Ruis synthetiseren met Web Audio.
Optioneel: een licht "telefoon/radio"-EQ-filter op de meldkamer-audio via Web Audio.

## Visuele stijl
- Meldkamer/surveillance maar speels — politieserie voor kleuters, geen horror.
- Zeer donker blauwgrijs als basis, fel signaalgroen voor "goed/actief",
  politieblauw als accent, rood alleen voor fouten. Hoog contrast is functioneel.
- Monospace/terminal-font als decor; de cijfervakjes op scherm 2 extra groot en vet.
- Signatuur-element: de frequentie-slider met naald en signaalbalkjes.
- Animatie subtiel en functioneel (scanlijn, waveform, balkjes) — audio ís de content.

## Acceptatiecriteria
1. Volledige flow werkt in vliegtuigmodus op iPhone Safari, ook na 10 min stilstand.
2. Eerste tik unlockt audio; video start betrouwbaar via de hack-knop.
3. Scherm gaat niet op slot tijdens gebruik (wake lock).
4. Scanner registreert alléén na de arm-gesture van de ouder.
5. Alle app-eigen knoppen ≥ 80×80px, bedienbaar zonder precisie
   (native iOS-toetsenbord uitgezonderd).
6. Frequentiepuzzel binnen 60 sec oplosbaar door een kleuter (zone-verbreding werkt).
7. Ouder kan elk scherm skippen/resetten zonder dat kinderen het zien.
8. Geen scherm vereist leesvaardigheid; foute invoer is nooit een dead end.
9. README bevat: deploy-instructies, PWA-installatiestappen, en de checklist
   voor het vervangen van de placeholder-assets.

## Kickoff-prompt
> "Lees spec-afluister-app.md. Bouw de app als één statische site zonder framework
> of build-stap. Begin met de vijf schermen en navigatie inclusief alle verborgen
> oudercontrols (let op de arm-gesture op scherm 1). Gebruik placeholder-audio en
> een placeholder-video met exact de bestandsnamen uit de spec, zodat ik de hele
> flow kan testen vóór de echte opnames. Bouw daarna de frequentiepuzzel met
> Web Audio (ruis-synthese + crossfade, doelzone-verbreding na 30 sec). Sluit af
> met de service worker (video mee in de cache) en de README."
