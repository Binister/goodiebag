import { ref } from 'vue'

const AUDIO_FILES = {
  welkom: 'assets/audio/meldkamer-welkom.mp3',
  pincodeInstructie: 'assets/audio/meldkamer-pincode.mp3',
  foutPincode: 'assets/audio/meldkamer-fout-pincode.mp3',
  goedPincode: 'assets/audio/meldkamer-goed-pincode.mp3',
  frequentieInstructie: 'assets/audio/meldkamer-frequentie.mp3',
  hack: 'assets/audio/meldkamer-hack.mp3',
  slot: 'assets/audio/meldkamer-slot.mp3',
  boefFragmenten: 'assets/audio/boef-fragmenten.mp3',
  boefGesprek: 'assets/audio/boef-gesprek.mp3'
}

function createNoiseBuffer(ctx, seconds) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

export function useAudioEngine() {
  const ready = ref(false)
  let ctx = null
  const buffers = {}
  let noiseBuffer = null
  const activeSources = []

  async function unlock() {
    if (ctx) return
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    await ctx.resume()
    await Promise.all(
      Object.entries(AUDIO_FILES).map(async ([key, path]) => {
        const res = await fetch(import.meta.env.BASE_URL + path)
        const arrayBuffer = await res.arrayBuffer()
        buffers[key] = await ctx.decodeAudioData(arrayBuffer)
      })
    )
    noiseBuffer = createNoiseBuffer(ctx, 2)
    ready.value = true
  }

  function play(key, { loop = false, volume = 1 } = {}) {
    if (!ctx || !buffers[key]) return null
    const source = ctx.createBufferSource()
    source.buffer = buffers[key]
    source.loop = loop
    const gain = ctx.createGain()
    gain.gain.value = volume
    source.connect(gain).connect(ctx.destination)
    source.start()
    activeSources.push(source)
    return { source, gain }
  }

  function stopAll() {
    activeSources.forEach((s) => {
      try {
        s.stop()
      } catch {
        // already stopped
      }
    })
    activeSources.length = 0
  }

  function beep(frequency = 880, duration = 0.12, delay = 0) {
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.15, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration)
  }

  function playAscendingBeeps(count = 5, spacing = 0.35) {
    for (let i = 0; i < count; i++) {
      beep(440 + i * 90, 0.1, i * spacing)
    }
  }

  function playTransitionSweep(direction = 'forward') {
    if (!ctx) return
    const startFreq = direction === 'forward' ? 500 : 900
    const endFreq = direction === 'forward' ? 900 : 500
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.18)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2)
    osc.connect(gain).connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.22)
  }

  function playLoop(buffer, initialGain = 1) {
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const gain = ctx.createGain()
    gain.gain.value = initialGain
    source.connect(gain).connect(ctx.destination)
    source.start()

    function setGain(value, rampSeconds = 0) {
      if (rampSeconds > 0) {
        gain.gain.linearRampToValueAtTime(value, ctx.currentTime + rampSeconds)
      } else {
        gain.gain.value = value
      }
    }

    function stop() {
      source.stop()
    }

    return { setGain, stop }
  }

  function playNoiseLoop() {
    return playLoop(noiseBuffer, 1)
  }

  function playBoefLoop() {
    return playLoop(buffers.boefFragmenten, 0)
  }

  return {
    ready,
    unlock,
    play,
    stopAll,
    beep,
    playAscendingBeeps,
    playTransitionSweep,
    playNoiseLoop,
    playBoefLoop
  }
}
