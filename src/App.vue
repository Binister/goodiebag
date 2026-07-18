<script setup>
import { reactive, ref, provide, computed } from 'vue'
import HiddenControls from './components/HiddenControls.vue'
import PoliceBadge from './components/PoliceBadge.vue'
import ScreenStart from './components/ScreenStart.vue'
import ScreenFingerprint from './components/ScreenFingerprint.vue'
import ScreenPincode from './components/ScreenPincode.vue'
import ScreenFrequency from './components/ScreenFrequency.vue'
import ScreenInterception from './components/ScreenInterception.vue'
import { useAudioEngine } from './composables/useAudioEngine'
import { useWakeLock } from './composables/useWakeLock'

const SCREENS = [ScreenStart, ScreenFingerprint, ScreenPincode, ScreenFrequency, ScreenInterception]

const audio = useAudioEngine()
const wakeLock = useWakeLock()

const state = reactive({
  screen: 0,
  scannerArmed: true,
  agentCount: 0,
  starting: false
})

const direction = ref('forward')

function goNext() {
  if (state.screen >= SCREENS.length - 1) return
  direction.value = 'forward'
  audio.playTransitionSweep('forward')
  state.screen += 1
}
function goPrev() {
  if (state.screen <= 0) return
  direction.value = 'backward'
  audio.playTransitionSweep('backward')
  state.screen -= 1
}
function reset() {
  direction.value = 'forward'
  state.screen = 0
  state.scannerArmed = true
  state.agentCount = 0
}
function armScanner() {
  state.scannerArmed = true
}
function disarmScanner() {
  state.scannerArmed = false
}
function registerAgent() {
  state.agentCount++
}

async function handleStart() {
  // Het laden en decoderen van alle assets duurt even; een tweede tik
  // op Aanmelden mag niet nóg een keer door de flow heen (dat schoot
  // eerder twee schermen vooruit).
  if (state.starting || state.screen !== 0) return
  state.starting = true
  try {
    await audio.unlock()
    await wakeLock.request()
    audio.play('welkom')
    goNext()
  } finally {
    state.starting = false
  }
}

const flow = { state, goNext, goPrev, reset, armScanner, disarmScanner, registerAgent, handleStart }
provide('flow', flow)
provide('audio', audio)

const currentScreen = computed(() => SCREENS[state.screen])
const transitionName = computed(() => (direction.value === 'forward' ? 'slide-next' : 'slide-prev'))
</script>

<template>
  <div class="app-root">
    <Transition :name="transitionName" appear>
      <component :is="currentScreen" :key="state.screen" />
    </Transition>
    <PoliceBadge />
    <HiddenControls
      :arm-enabled="state.screen === 1"
      @arm="armScanner"
      @next="goNext"
      @prev="goPrev"
      @reset="reset"
    />
  </div>
</template>
