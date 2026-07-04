<script setup>
import { inject, ref } from 'vue'
import fingerprintSvg from '../assets/fingerprint.svg?raw'

const flow = inject('flow')
const audio = inject('audio')

const scanning = ref(false)
const progress = ref(0)
const justSucceeded = ref(false)
let holdTimer = null
let progressTimer = null

const SCAN_DURATION = 2000

function startScan() {
  if (!flow.state.scannerArmed || scanning.value || justSucceeded.value) return
  scanning.value = true
  progress.value = 0
  audio.playAscendingBeeps(6, SCAN_DURATION / 1000 / 6)
  const startedAt = performance.now()
  progressTimer = setInterval(() => {
    progress.value = Math.min((performance.now() - startedAt) / SCAN_DURATION, 1)
  }, 50)
  holdTimer = setTimeout(completeScan, SCAN_DURATION)
}

function cancelScan() {
  if (justSucceeded.value) return
  if (holdTimer) clearTimeout(holdTimer)
  if (progressTimer) clearInterval(progressTimer)
  holdTimer = null
  progressTimer = null
  scanning.value = false
  progress.value = 0
}

function completeScan() {
  if (progressTimer) clearInterval(progressTimer)
  holdTimer = null
  scanning.value = false
  progress.value = 1
  justSucceeded.value = true
  audio.beep(1200, 0.25)
  flow.registerAgent()
  flow.disarmScanner()
  setTimeout(() => {
    justSucceeded.value = false
    progress.value = 0
  }, 1500)
}
</script>

<template>
  <div class="screen fingerprint-screen">
    <div class="screen-eyebrow">Agenten: {{ flow.state.agentCount }}</div>
    <h1 class="screen-title">Vingerafdrukscan</h1>
    <div
      class="fingerprint-icon"
      :class="{ armed: flow.state.scannerArmed, scanning, success: justSucceeded }"
      @pointerdown="startScan"
      @pointerup="cancelScan"
      @pointerleave="cancelScan"
      @pointercancel="cancelScan"
    >
      <div class="fingerprint-svg" v-html="fingerprintSvg"></div>
      <div class="scan-line" :style="{ top: `${4 + progress * 92}%` }"></div>
      <div v-if="justSucceeded" class="checkmark">✓</div>
    </div>
    <div class="status-text" :class="{ ready: flow.state.scannerArmed || justSucceeded }">
      {{
        justSucceeded
          ? 'Agent geregistreerd'
          : flow.state.scannerArmed
            ? 'Plaats duim op scanner'
            : 'Wachten op meldkamer...'
      }}
    </div>
  </div>
</template>

<style scoped>
.fingerprint-icon {
  position: relative;
  color: var(--police-blue);
  opacity: 0.5;
  transition:
    opacity 0.3s,
    color 0.3s;
}
.fingerprint-icon.armed {
  opacity: 1;
}
.fingerprint-icon.scanning,
.fingerprint-icon.success {
  color: var(--success);
}
.fingerprint-svg {
  width: 160px;
}
.fingerprint-svg :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}
.scan-line {
  position: absolute;
  left: 8%;
  right: 8%;
  height: 3px;
  border-radius: 2px;
  background: var(--success);
}
.checkmark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 600;
  color: var(--success);
}
.status-text {
  font-size: 1rem;
  color: var(--text-secondary);
  min-height: 1.5em;
}
.status-text.ready {
  color: var(--text);
  font-weight: 600;
}
</style>
