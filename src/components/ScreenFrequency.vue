<script setup>
import { inject, onMounted, onUnmounted, ref, computed, watch } from 'vue'

const flow = inject('flow')
const audio = inject('audio')

const SCALE_MIN = 0
const SCALE_MAX = 1000
const MAX_DISTANCE = 350
const HOLD_MS = 1500

const target = ref(300 + Math.random() * 400)
const zoneHalfWidth = ref(60)
const value = ref(0)
const locked = ref(false)

let crossfade = null
let widenTimer = null
let holdTimer = null
let inZone = false

onMounted(() => {
  audio.play('frequentieInstructie')
  crossfade = audio.startCrossfade()
  widenTimer = setTimeout(() => {
    zoneHalfWidth.value *= 2
  }, 30000)
})

onUnmounted(() => {
  crossfade?.stop()
  if (widenTimer) clearTimeout(widenTimer)
  if (holdTimer) clearTimeout(holdTimer)
})

const distance = computed(() => Math.abs(value.value - target.value))
const signalStrength = computed(() => 1 - Math.min(distance.value / MAX_DISTANCE, 1))
const isInZone = computed(() => distance.value <= zoneHalfWidth.value)
const barsLit = computed(() => {
  if (!isInZone.value) return 0
  const closeness = 1 - distance.value / zoneHalfWidth.value
  return Math.max(1, Math.round(closeness * 3))
})

watch(value, () => {
  crossfade?.setMix(signalStrength.value)
})

watch(isInZone, (nowInZone) => {
  if (locked.value) return
  if (nowInZone && !inZone) {
    inZone = true
    holdTimer = setTimeout(lockSignal, HOLD_MS)
  } else if (!nowInZone && inZone) {
    inZone = false
    if (holdTimer) clearTimeout(holdTimer)
  }
})

function lockSignal() {
  locked.value = true
  crossfade?.setMix(1)
  audio.beep(1400, 0.3)
  audio.beep(1800, 0.3, 0.15)
  setTimeout(() => {
    flow.goNext()
  }, 1600)
}
</script>

<template>
  <div class="screen frequency-screen">
    <div class="screen-title">{{ locked ? 'SIGNAAL VERGRENDELD' : 'ZOEK DE FREQUENTIE' }}</div>
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
  background: var(--bg-alt);
  border: 2px solid var(--police-blue);
  border-radius: 0.2rem;
}
.bar.lit {
  background: var(--signal-green);
  border-color: var(--signal-green);
}
.frequency-slider {
  width: 90%;
  height: 4rem;
  accent-color: var(--signal-green);
}
</style>
