<script setup>
import { inject } from 'vue'

const flow = inject('flow')
</script>

<template>
  <div class="screen start-screen">
    <div class="scanlines"></div>
    <div class="screen-eyebrow">Systeem online</div>
    <h1 class="screen-title">Politie Afluistercentrale</h1>
    <button class="big-button" @click="flow.handleStart">Aanmelden</button>
  </div>
</template>

<style scoped>
.start-screen {
  background: radial-gradient(ellipse at 50% 30%, #17335c 0%, transparent 65%);
}
.screen-title {
  font-size: 1.9rem;
  line-height: 1.3;
  max-width: 18ch;
}
.scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.035) 0px,
    rgba(255, 255, 255, 0.035) 1px,
    transparent 1px,
    transparent 3px
  );
}
</style>
