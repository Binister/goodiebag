import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const AUDIO_DIR = path.join(__dirname, '..', 'public', 'assets', 'audio')
const VIDEO_DIR = path.join(__dirname, '..', 'public', 'assets', 'video')
const SYSTEM_FONT = '/System/Library/Fonts/Menlo.ttc'

const MELDKAMER_VOICE = 'Xander'
const BOEF_VOICE = 'Ellen'

const AUDIO_CLIPS = [
  {
    file: 'meldkamer-welkom.mp3',
    voice: MELDKAMER_VOICE,
    text: 'Welkom bij de politie afluistercentrale. Meld je aan met je vingerafdruk.'
  },
  {
    file: 'meldkamer-nummer.mp3',
    voice: MELDKAMER_VOICE,
    text: 'Voer het telefoonnummer van de boef in.'
  },
  {
    file: 'meldkamer-fout-nummer.mp3',
    voice: MELDKAMER_VOICE,
    text: 'Dit nummer is niet in gebruik. Probeer het opnieuw.'
  },
  {
    file: 'meldkamer-goed-nummer.mp3',
    voice: MELDKAMER_VOICE,
    text: 'Nummer gevonden. Afluisterapparatuur wordt gekoppeld.'
  },
  {
    file: 'meldkamer-frequentie.mp3',
    voice: MELDKAMER_VOICE,
    text: 'Draai aan de knop tot je het signaal van de boef te pakken hebt.'
  },
  {
    file: 'meldkamer-hack.mp3',
    voice: MELDKAMER_VOICE,
    text: 'We zijn binnen. Live beeld van de telefoon van de verdachte komt op je scherm.'
  },
  {
    file: 'meldkamer-slot.mp3',
    voice: MELDKAMER_VOICE,
    text: 'Locatie herkend. Goed gedaan, agenten! Missie geslaagd.'
  },
  {
    file: 'boef-fragmenten.mp3',
    voice: BOEF_VOICE,
    text: 'Ja, ja, ik zit hier goed verstopt. Niemand die mij vindt. Helemaal niemand.'
  },
  {
    file: 'boef-gesprek.mp3',
    voice: BOEF_VOICE,
    text:
      'Hallo, met mij. Nee, ze vinden me hier nooit. Ik zit goed verstopt bij de speeltuin. ' +
      'Over een uurtje kom ik eruit, dan is de kust vast wel weer veilig.'
  }
]

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit' })
}

function generateAudio(tmpDir) {
  for (const clip of AUDIO_CLIPS) {
    const aiffPath = path.join(tmpDir, `${clip.file}.aiff`)
    const mp3Path = path.join(AUDIO_DIR, clip.file)
    console.log(`[say] ${clip.file}`)
    run('say', ['-v', clip.voice, '-o', aiffPath, clip.text])
    console.log(`[ffmpeg] ${clip.file}`)
    run(ffmpegPath.path, ['-y', '-i', aiffPath, '-codec:a', 'libmp3lame', '-qscale:a', '4', mp3Path])
  }
}

function generateVideo() {
  const outPath = path.join(VIDEO_DIR, 'boef-live.mp4')
  console.log('[ffmpeg] boef-live.mp4')
  run(ffmpegPath.path, [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'testsrc2=size=1080x1920:rate=30:duration=20',
    '-vf',
    `drawtext=fontfile=${SYSTEM_FONT}:text='PLACEHOLDER VIDEO':fontcolor=white:fontsize=64:x=(w-text_w)/2:y=(h-text_h)/2`,
    '-pix_fmt',
    'yuv420p',
    '-c:v',
    'libx264',
    '-crf',
    '28',
    outPath
  ])
}

const tmpDir = mkdtempSync(path.join(tmpdir(), 'goodiebag-assets-'))
try {
  generateAudio(tmpDir)
  generateVideo()
  console.log('Placeholder-assets gegenereerd.')
} finally {
  rmSync(tmpDir, { recursive: true, force: true })
}
