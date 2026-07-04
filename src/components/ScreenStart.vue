<script setup>
import { inject } from 'vue'

const flow = inject('flow')
</script>

<template>
  <div class="screen start-screen">
    <div class="screen-eyebrow">Systeem online</div>
    <button class="big-button" @click="flow.handleStart">Aanmelden</button>
  </div>
</template>
