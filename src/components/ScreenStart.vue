<script setup>
import { inject } from 'vue'

const flow = inject('flow')
</script>

<template>
  <div class="screen start-screen">
    <div class="screen-eyebrow">Systeem online</div>
    <h1 class="screen-title">Politie Afluistercentrale</h1>
    <button class="big-button" @click="flow.handleStart">Aanmelden</button>
  </div>
</template>

<style scoped>
.screen-title {
  font-size: 2rem;
  line-height: 1.25;
  max-width: 16ch;
}
</style>
