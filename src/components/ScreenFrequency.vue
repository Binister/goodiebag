<script setup>
import { inject, onMounted, onUnmounted, ref, computed, watch } from 'vue'

const flow = inject('flow')
const audio = inject('audio')

const SCALE_MIN = 0
const SCALE_MAX = 1000
const HOLD_MS = 1500
const DIAL_FREQ_MIN = 88
const DIAL_FREQ_MAX = 108

const target = ref(300 + Math.random() * 400)
const zoneHalfWidth = ref(60)
const value = ref(0)
const locked = ref(false)

const ready = ref(false)

let noiseLoop = null
let boefLoop = null
let widenTimer = null
let holdTimer = null
let startTimer = null
let inZone = false

onMounted(() => {
  const instructionMs = audio.getDuration('frequentieInstructie') * 1000
  audio.play('frequentieInstructie')
  // Ruis (en dus ook het boef-signaal) mag pas beginnen zodra de
  // instructie is uitgesproken, nooit ertussendoor.
  startTimer = setTimeout(() => {
    noiseLoop = audio.playNoiseLoop()
    ready.value = true
    // De naald kan al in de doelzone staan tegen de tijd dat de instructie
    // klaar is; isInZone verandert dan niet meer, dus de watcher hieronder
    // vuurt niet vanzelf - handmatig checken.
    if (isInZone.value) enterZone()
    widenTimer = setTimeout(() => {
      zoneHalfWidth.value *= 2
    }, 30000)
  }, instructionMs + 150)
})

onUnmounted(() => {
  if (startTimer) clearTimeout(startTimer)
  noiseLoop?.stop()
  boefLoop?.stop()
  if (widenTimer) clearTimeout(widenTimer)
  if (holdTimer) clearTimeout(holdTimer)
})

const distance = computed(() => Math.abs(value.value - target.value))
const isInZone = computed(() => distance.value <= zoneHalfWidth.value)
const barsLit = computed(() => {
  if (!isInZone.value) return 0
  const closeness = 1 - distance.value / zoneHalfWidth.value
  return Math.max(1, Math.round(closeness * 3))
})

const needlePct = computed(() => (value.value / SCALE_MAX) * 100)

function freqToPct(freq) {
  return ((freq - DIAL_FREQ_MIN) / (DIAL_FREQ_MAX - DIAL_FREQ_MIN)) * 100
}

const majorTicks = computed(() => {
  const ticks = []
  for (let f = DIAL_FREQ_MIN; f <= DIAL_FREQ_MAX; f += 4) {
    ticks.push({ pct: freqToPct(f), label: f.toFixed(1) })
  }
  return ticks
})

const minorTicks = computed(() => {
  const ticks = []
  for (let f = DIAL_FREQ_MIN; f <= DIAL_FREQ_MAX; f += 1) {
    if (f % 4 !== 0) ticks.push({ pct: freqToPct(f) })
  }
  return ticks
})

function enterZone() {
  if (inZone) return
  inZone = true
  boefLoop = audio.playBoefLoop()
  boefLoop.setGain(1, 0.2)
  noiseLoop?.setGain(0.12, 0.2)
  holdTimer = setTimeout(lockSignal, HOLD_MS)
}

function exitZone() {
  if (!inZone) return
  inZone = false
  if (holdTimer) clearTimeout(holdTimer)
  noiseLoop?.setGain(1, 0.2)
  if (boefLoop) {
    const toStop = boefLoop
    toStop.setGain(0, 0.15)
    setTimeout(() => toStop.stop(), 200)
    boefLoop = null
  }
}

watch(isInZone, (nowInZone) => {
  if (!ready.value || locked.value) return
  if (nowInZone) enterZone()
  else exitZone()
})

function lockSignal() {
  locked.value = true
  noiseLoop?.setGain(0, 0.1)
  boefLoop?.setGain(1)
  audio.beep(1400, 0.3)
  audio.beep(1800, 0.3, 0.15)
  setTimeout(() => {
    flow.goNext()
  }, 1600)
}
</script>

<template>
  <div class="screen frequency-screen">
    <h1 class="screen-title">{{ locked ? 'Signaal vergrendeld' : 'Zoek de frequentie' }}</h1>
    <div class="signal-bars">
      <span v-for="n in 3" :key="n" class="bar" :class="{ lit: n <= barsLit }"></span>
    </div>
    <div class="dial">
      <div class="dial-plate">
        <div class="dial-track">
          <div class="ticks">
            <span v-for="t in minorTicks" :key="'m' + t.pct" class="tick minor" :style="{ left: t.pct + '%' }"></span>
            <span v-for="t in majorTicks" :key="'M' + t.pct" class="tick major" :style="{ left: t.pct + '%' }">
              <span class="tick-label">{{ t.label }}</span>
            </span>
          </div>
          <div class="needle" :style="{ left: needlePct + '%' }">
            <span class="needle-line"></span>
            <span class="needle-tip"></span>
          </div>
        </div>
      </div>
      <input
        class="frequency-slider"
        type="range"
        :min="SCALE_MIN"
        :max="SCALE_MAX"
        v-model.number="value"
        :disabled="locked"
      />
    </div>
  </div>
</template>

<style scoped>
.frequency-screen .screen-title {
  font-size: 2.1rem;
}
.signal-bars {
  display: flex;
  gap: 1rem;
}
.bar {
  width: 2.1rem;
  height: 4.2rem;
  background: var(--bg-elevated);
  border-radius: 0.45rem;
  box-shadow: inset 0 0 0 2px rgba(11, 31, 51, 0.14);
  transition:
    background 0.15s,
    box-shadow 0.15s;
}
.bar.lit {
  background: var(--success);
  box-shadow: 0 0 20px 3px rgba(21, 115, 71, 0.55);
}
.dial {
  position: relative;
  width: 100%;
  max-width: 480px;
}
.dial-plate {
  position: relative;
  height: 7.5rem;
  background: linear-gradient(180deg, #fbfcfe 0%, var(--bg-elevated) 100%);
  border-radius: var(--radius-lg);
  box-shadow:
    inset 0 0 0 1.5px rgba(11, 31, 51, 0.12),
    inset 0 2px 8px rgba(11, 31, 51, 0.08);
  overflow: hidden;
  pointer-events: none;
}
.dial-track {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 1.8rem;
  right: 1.8rem;
}
.ticks {
  position: absolute;
  inset: 0;
}
.tick {
  position: absolute;
  bottom: 0.9rem;
  width: 2px;
  height: 1rem;
  background: rgba(11, 31, 51, 0.25);
  transform: translateX(-50%);
}
.tick.major {
  height: 1.7rem;
  width: 3px;
  background: var(--police-blue);
}
.tick-label {
  position: absolute;
  bottom: 1.9rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
  white-space: nowrap;
}
.needle {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0;
  transform: translateX(-50%);
}
.needle-line {
  position: absolute;
  top: 0.6rem;
  bottom: 0.6rem;
  left: -1.5px;
  width: 3px;
  border-radius: 2px;
  background: var(--error-red);
  box-shadow: 0 0 10px rgba(192, 57, 43, 0.65);
}
.needle-tip {
  position: absolute;
  top: 0.3rem;
  left: -0.55rem;
  width: 1.1rem;
  height: 1.1rem;
  background: var(--error-red);
  border-radius: 50% 50% 50% 0;
  transform: rotate(45deg);
  box-shadow: 0 0 8px rgba(192, 57, 43, 0.5);
}
.frequency-slider {
  -webkit-appearance: none;
  appearance: none;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  background: transparent;
  z-index: 2;
}
.frequency-slider::-webkit-slider-runnable-track {
  background: transparent;
  height: 100%;
}
.frequency-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 4.5rem;
  height: 7.5rem;
  background: transparent;
}
.frequency-slider::-moz-range-track {
  background: transparent;
  height: 100%;
  border: none;
}
.frequency-slider::-moz-range-thumb {
  width: 4.5rem;
  height: 7.5rem;
  background: transparent;
  border: none;
}
.frequency-slider:disabled {
  pointer-events: none;
}
</style>
