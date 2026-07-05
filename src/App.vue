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
  agentCount: 0
})

const direction = ref('forward')

function goNext() {
  direction.value = 'forward'
  state.screen = Math.min(state.screen + 1, SCREENS.length - 1)
}
function goPrev() {
  direction.value = 'backward'
  state.screen = Math.max(state.screen - 1, 0)
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
  await audio.unlock()
  await wakeLock.request()
  audio.play('welkom')
  goNext()
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
