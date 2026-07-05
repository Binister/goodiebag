#!/usr/bin/env python3
"""
Genereer placeholder-audio met Microsoft Edge's gratis neurale TTS
(via het edge-tts pakket) i.p.v. macOS 'say'.

Voordelen t.o.v. scripts/generate-placeholders.mjs:
- Werkt op elk platform (geen macOS nodig).
- Gratis, geen account of API-key.
- Twee echt verschillende Nederlandse stemmen voor meldkamer en boef,
  i.p.v. dezelfde mac-stem met een pitch-shift-truc.

Vereist een normale internetverbinding (dit script praat met Microsoft's
online spraakdienst) - draai het dus niet vanuit een sandbox die
buitenverkeer naar speech.platform.bing.com blokkeert.

Installeren en draaien:
    pip install edge-tts
    python3 scripts/generate-placeholders-edge-tts.py

Klopt een stemnaam niet meer (Microsoft wijzigt ze weleens)? Controleer met:
    edge-tts --list-voices | grep nl-
"""

import asyncio
from pathlib import Path

import edge_tts

AUDIO_DIR = Path(__file__).resolve().parent.parent / "public" / "assets" / "audio"

MELDKAMER_VOICE = "nl-NL-MaartenNeural"
BOEF_VOICE = "nl-BE-ArnaudNeural"
BOEF_RATE = "-8%"
BOEF_PITCH = "-15Hz"

CLIPS = [
    (
        "meldkamer-welkom.mp3",
        MELDKAMER_VOICE,
        None,
        None,
        "Welkom bij de politie afluistercentrale. Meld je aan met je vingerafdruk.",
    ),
    (
        "meldkamer-pincode.mp3",
        MELDKAMER_VOICE,
        None,
        None,
        "Voer de pincode van de telefoon van de boef in.",
    ),
    (
        "meldkamer-fout-pincode.mp3",
        MELDKAMER_VOICE,
        None,
        None,
        "Deze pincode klopt niet. Probeer het opnieuw.",
    ),
    (
        "meldkamer-goed-pincode.mp3",
        MELDKAMER_VOICE,
        None,
        None,
        "Pincode gekraakt. Afluisterapparatuur wordt gekoppeld.",
    ),
    (
        "meldkamer-frequentie.mp3",
        MELDKAMER_VOICE,
        None,
        None,
        "Draai aan de knop tot je het signaal van de boef te pakken hebt.",
    ),
    (
        "meldkamer-hack.mp3",
        MELDKAMER_VOICE,
        None,
        None,
        "We zijn binnen. Live beeld van de telefoon van de verdachte komt op je scherm.",
    ),
    (
        "meldkamer-slot.mp3",
        MELDKAMER_VOICE,
        None,
        None,
        "Locatie herkend. Hopelijk hebben jullie nu genoeg informatie agenten. "
        "Ga er op af en reken de boef in, maar onthoud: alleen schieten als hij vlucht!",
    ),
    (
        "boef-fragmenten.mp3",
        BOEF_VOICE,
        BOEF_RATE,
        BOEF_PITCH,
        "Ja, ja, ik zit hier goed verstopt. Niemand die mij vindt. Helemaal niemand.",
    ),
    (
        "boef-gesprek.mp3",
        BOEF_VOICE,
        BOEF_RATE,
        BOEF_PITCH,
        "Hallo, met mij. Nee, ze vinden me hier nooit. Ik zit goed verstopt bij de speeltuin. "
        "Over een uurtje kom ik eruit, dan is de kust vast wel weer veilig.",
    ),
]


async def generate():
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    for filename, voice, rate, pitch, text in CLIPS:
        out_path = AUDIO_DIR / filename
        kwargs = {}
        if rate:
            kwargs["rate"] = rate
        if pitch:
            kwargs["pitch"] = pitch
        print(f"[edge-tts] {filename} ({voice})")
        communicate = edge_tts.Communicate(text, voice, **kwargs)
        await communicate.save(str(out_path))
    print("Placeholder-audio gegenereerd met edge-tts.")


if __name__ == "__main__":
    asyncio.run(generate())
