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
    <div v-else class="connecting-text">Afluisterapparatuur wordt gekoppeld</div>
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
.connecting-text {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
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
