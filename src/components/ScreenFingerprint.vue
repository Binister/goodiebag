<script setup>
import { inject, ref } from 'vue'

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
      <svg viewBox="0 0 100 100" width="170" height="170">
        <g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round">
          <path d="M14,84 A36,48 0 0 1 86,84" />
          <path d="M21,84 A29,40 0 0 1 79,84" />
          <path d="M28,84 A22,32 0 0 1 72,84" />
          <path d="M35,84 A15,24 0 0 1 65,84" />
          <path d="M42,84 A8,14 0 0 1 58,84" />
        </g>
        <rect class="scan-line" x="10" :y="36 + progress * 48" width="80" height="3" rx="1.5" fill="var(--success)" />
      </svg>
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
