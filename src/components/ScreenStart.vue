<script setup>
import { inject } from 'vue'

const flow = inject('flow')
</script>

<template>
  <div class="screen start-screen">
    <div class="scanlines"></div>
    <h1 class="screen-title">Politie<br />Afluistercentrale</h1>
    <button class="big-button" @click="flow.handleStart">AANMELDEN</button>
  </div>
</template>

<style scoped>
.start-screen {
  background: radial-gradient(ellipse at center, #10222c 0%, #060f14 100%);
}
.screen-title {
  font-size: 1.8rem;
  line-height: 1.4;
}
.scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(43, 111, 255, 0.05) 0px,
    rgba(43, 111, 255, 0.05) 1px,
    transparent 1px,
    transparent 3px
  );
}
</style>
