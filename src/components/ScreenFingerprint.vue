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
    <div class="screen-title">Agenten: {{ flow.state.agentCount }}</div>
    <div
      class="fingerprint-icon"
      :class="{ armed: flow.state.scannerArmed, scanning, success: justSucceeded }"
      @pointerdown="startScan"
      @pointerup="cancelScan"
      @pointerleave="cancelScan"
      @pointercancel="cancelScan"
    >
      <svg viewBox="0 0 100 100" width="180" height="180">
        <g fill="none" stroke="currentColor" stroke-width="4">
          <ellipse cx="50" cy="55" rx="35" ry="40" />
          <ellipse cx="50" cy="55" rx="26" ry="31" />
          <ellipse cx="50" cy="55" rx="17" ry="22" />
          <ellipse cx="50" cy="55" rx="8" ry="13" />
        </g>
        <rect class="scan-line" x="10" :y="15 + progress * 80" width="80" height="3" fill="var(--signal-green)" />
      </svg>
      <div v-if="justSucceeded" class="checkmark">✓</div>
    </div>
    <div class="status-text">
      {{
        justSucceeded
          ? 'AGENT GEREGISTREERD'
          : flow.state.scannerArmed
            ? 'PLAATS DUIM OP SCANNER'
            : 'WACHTEN OP MELDKAMER...'
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
  color: var(--signal-green);
}
.checkmark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: var(--signal-green);
}
.status-text {
  font-size: 1.1rem;
  letter-spacing: 0.08em;
  min-height: 1.5em;
}
</style>
