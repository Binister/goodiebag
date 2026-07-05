<script setup>
import { inject, onMounted, ref, computed, nextTick } from 'vue'

const flow = inject('flow')
const audio = inject('audio')

const PIN_LENGTH = 6
const TARGET = '260721'
const digits = ref('')
const flash = ref('')
const connecting = ref(false)
const inputRef = ref(null)

onMounted(() => {
  audio.play('pincodeInstructie')
  focusInput()
})

function focusInput() {
  nextTick(() => inputRef.value?.focus())
}

function onInput(e) {
  const raw = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH)
  digits.value = raw
  e.target.value = raw
  if (raw.length === PIN_LENGTH) {
    checkPincode()
  }
}

function checkPincode() {
  if (digits.value === TARGET) {
    handleCorrect()
  } else {
    handleWrong()
  }
}

function handleWrong() {
  flash.value = 'red'
  audio.beep(220, 0.3)
  audio.play('foutPincode')
  setTimeout(() => {
    flash.value = ''
    digits.value = ''
    if (inputRef.value) inputRef.value.value = ''
    focusInput()
  }, 900)
}

function handleCorrect() {
  flash.value = 'green'
  audio.play('goedPincode')
  connecting.value = true
  audio.playAscendingBeeps(4, 0.25)
  setTimeout(() => {
    flow.goNext()
  }, 1800)
}

const boxes = computed(() => digits.value.padEnd(PIN_LENGTH, ' ').split(''))
</script>

<template>
  <div class="screen pincode-screen" :class="flash && `flash-${flash}`">
    <h1 class="screen-title">Voer de pincode in</h1>
    <div v-if="!connecting" class="card digit-card">
      <div class="digit-group">
        <span v-for="(d, di) in boxes" :key="di" class="digit-box">{{ d.trim() }}</span>
      </div>
    </div>
    <div v-else class="connecting">
      <div class="connecting-text">Afluisterapparatuur wordt gekoppeld</div>
      <div class="connect-dots">
        <span v-for="n in 4" :key="n" class="connect-dot" :style="{ animationDelay: `${(n - 1) * 0.25}s` }"></span>
      </div>
      <div class="connect-progress"><div class="connect-progress-fill"></div></div>
    </div>
    <input
      ref="inputRef"
      class="tel-input"
      type="tel"
      inputmode="numeric"
      autocomplete="off"
      @input="onInput"
      @blur="focusInput"
    />
  </div>
</template>

<style scoped>
.pincode-screen {
  justify-content: flex-start;
  padding-top: calc(env(safe-area-inset-top, 0px) + 4rem);
}
.digit-card {
  max-width: 100%;
}
.digit-group {
  display: flex;
  gap: 2.2vw;
  max-width: 100%;
}
.digit-box {
  width: 11vw;
  height: 14vw;
  max-width: 66px;
  max-height: 84px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1.5px rgba(11, 31, 51, 0.15);
  border-radius: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 6vw;
  font-weight: 600;
  flex-shrink: 0;
}
.connecting {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.4rem;
}
.connecting-text {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
}
.connect-dots {
  display: flex;
  gap: 0.7rem;
}
.connect-dot {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 50%;
  background: var(--bg-elevated-2);
  animation: connectPulse 1s ease-in-out infinite;
}
@keyframes connectPulse {
  0%,
  100% {
    background: var(--bg-elevated-2);
    transform: scale(1);
  }
  30% {
    background: var(--police-blue);
    transform: scale(1.3);
  }
}
.connect-progress {
  width: 70vw;
  max-width: 320px;
  height: 0.5rem;
  background: var(--bg-elevated);
  border-radius: 999px;
  overflow: hidden;
}
.connect-progress-fill {
  height: 100%;
  width: 0%;
  background: var(--police-blue);
  border-radius: 999px;
  animation: connectFill 1.8s var(--ease-standard) forwards;
}
@keyframes connectFill {
  to {
    width: 100%;
  }
}
.tel-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  inset: 0;
  font-size: 16px;
}
</style>
