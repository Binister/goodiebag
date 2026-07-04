<script setup>
import { inject, onMounted, onUnmounted, ref, computed, watch } from 'vue'

const flow = inject('flow')
const audio = inject('audio')

const SCALE_MIN = 0
const SCALE_MAX = 1000
const HOLD_MS = 1500

const target = ref(300 + Math.random() * 400)
const zoneHalfWidth = ref(60)
const value = ref(0)
const locked = ref(false)

let noiseLoop = null
let boefLoop = null
let widenTimer = null
let holdTimer = null
let inZone = false

onMounted(() => {
  audio.play('frequentieInstructie')
  noiseLoop = audio.playNoiseLoop()
  widenTimer = setTimeout(() => {
    zoneHalfWidth.value *= 2
  }, 30000)
})

onUnmounted(() => {
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

watch(isInZone, (nowInZone) => {
  if (locked.value) return
  if (nowInZone && !inZone) {
    inZone = true
    boefLoop = audio.playBoefLoop()
    boefLoop.setGain(1, 0.2)
    noiseLoop?.setGain(0.12, 0.2)
    holdTimer = setTimeout(lockSignal, HOLD_MS)
  } else if (!nowInZone && inZone) {
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
    <input
      class="frequency-slider"
      type="range"
      :min="SCALE_MIN"
      :max="SCALE_MAX"
      v-model.number="value"
      :disabled="locked"
    />
  </div>
</template>

<style scoped>
.signal-bars {
  display: flex;
  gap: 0.5rem;
}
.bar {
  width: 1.2rem;
  height: 2.5rem;
  background: var(--bg-elevated);
  border-radius: 0.3rem;
  box-shadow: inset 0 0 0 1.5px rgba(11, 31, 51, 0.12);
}
.bar.lit {
  background: var(--success);
  box-shadow: none;
}
.frequency-slider {
  width: 90%;
  height: 4rem;
  accent-color: var(--police-blue);
}
</style>
