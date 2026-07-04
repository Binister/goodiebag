<script setup>
import { reactive, provide, computed } from 'vue'
import HiddenControls from './components/HiddenControls.vue'
import ScreenStart from './components/ScreenStart.vue'
import ScreenFingerprint from './components/ScreenFingerprint.vue'
import ScreenPhoneNumber from './components/ScreenPhoneNumber.vue'
import ScreenFrequency from './components/ScreenFrequency.vue'
import ScreenInterception from './components/ScreenInterception.vue'
import { useAudioEngine } from './composables/useAudioEngine'
import { useWakeLock } from './composables/useWakeLock'

const SCREENS = [ScreenStart, ScreenFingerprint, ScreenPhoneNumber, ScreenFrequency, ScreenInterception]

const audio = useAudioEngine()
const wakeLock = useWakeLock()

const state = reactive({
  screen: 0,
  scannerArmed: false,
  agentCount: 0
})

function goNext() {
  state.screen = Math.min(state.screen + 1, SCREENS.length - 1)
}
function goPrev() {
  state.screen = Math.max(state.screen - 1, 0)
}
function reset() {
  state.screen = 0
  state.scannerArmed = false
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
</script>

<template>
  <div class="app-root">
    <component :is="currentScreen" />
    <HiddenControls
      :arm-enabled="state.screen === 1"
      @arm="armScanner"
      @next="goNext"
      @prev="goPrev"
      @reset="reset"
    />
  </div>
</template>
