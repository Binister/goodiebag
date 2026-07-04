<script setup>
import { inject, onMounted, ref, computed, nextTick } from 'vue'

const flow = inject('flow')
const audio = inject('audio')

const TARGET = '0621072107'
const digits = ref('')
const flash = ref('')
const connecting = ref(false)
const inputRef = ref(null)

onMounted(() => {
  audio.play('nummerInstructie')
  focusInput()
})

function focusInput() {
  nextTick(() => inputRef.value?.focus())
}

function onInput(e) {
  const raw = e.target.value.replace(/\D/g, '').slice(0, 10)
  digits.value = raw
  e.target.value = raw
  if (raw.length === 10) {
    checkNumber()
  }
}

function checkNumber() {
  if (digits.value === TARGET) {
    handleCorrect()
  } else {
    handleWrong()
  }
}

function handleWrong() {
  flash.value = 'red'
  audio.beep(220, 0.3)
  audio.play('foutNummer')
  setTimeout(() => {
    flash.value = ''
    digits.value = ''
    if (inputRef.value) inputRef.value.value = ''
    focusInput()
  }, 900)
}

function handleCorrect() {
  flash.value = 'green'
  audio.play('goedNummer')
  connecting.value = true
  audio.playAscendingBeeps(4, 0.25)
  setTimeout(() => {
    flow.goNext()
  }, 1800)
}

const groups = computed(() => {
  const padded = digits.value.padEnd(10, ' ').split('')
  return [padded.slice(0, 2), padded.slice(2, 4), padded.slice(4, 6), padded.slice(6, 8), padded.slice(8, 10)]
})
</script>

<template>
  <div class="screen phone-screen" :class="flash && `flash-${flash}`">
    <div class="screen-title">Voer nummer in</div>
    <div v-if="!connecting" class="digit-groups">
      <div v-for="(group, gi) in groups" :key="gi" class="digit-group">
        <span v-for="(d, di) in group" :key="di" class="digit-box">{{ d.trim() }}</span>
      </div>
    </div>
    <div v-else class="connecting-text">AFLUISTERAPPARATUUR WORDT GEKOPPELD</div>
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
.digit-groups {
  display: flex;
  gap: 1.5vw;
  max-width: 100%;
}
.digit-group {
  display: flex;
  gap: 0.6vw;
}
.digit-box {
  width: 6.5vw;
  height: 8.5vw;
  border: 2px solid var(--police-blue);
  border-radius: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.8vw;
  font-weight: bold;
  flex-shrink: 0;
}
.connecting-text {
  font-size: 1.3rem;
  color: var(--signal-green);
  letter-spacing: 0.08em;
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
