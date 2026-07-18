<script setup>
import { inject } from 'vue'

const flow = inject('flow')
</script>

<template>
  <div class="screen start-screen">
    <div class="screen-eyebrow">Systeem online</div>
    <button class="big-button" :disabled="flow.state.starting" @click="flow.handleStart">
      {{ flow.state.starting ? 'Verbinden met meldkamer...' : 'Aanmelden' }}
    </button>
  </div>
</template>
