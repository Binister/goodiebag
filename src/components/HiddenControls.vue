<script setup>
import { useParentControls } from '../composables/useParentControls'

const props = defineProps({
  armEnabled: { type: Boolean, default: false }
})
const emit = defineEmits(['arm', 'next', 'prev', 'reset'])

const { armTap, nextTap, prevTap, resetPress } = useParentControls({
  onArm: () => props.armEnabled && emit('arm'),
  onNext: () => emit('next'),
  onPrev: () => emit('prev'),
  onReset: () => emit('reset')
})
</script>

<template>
  <div class="hidden-controls">
    <div class="hit-area top-left" @pointerdown="prevTap"></div>
    <div class="hit-area top-right" @pointerdown="nextTap"></div>
    <div
      class="hit-area bottom-left"
      @pointerdown="resetPress.start"
      @pointerup="resetPress.cancel"
      @pointerleave="resetPress.cancel"
      @pointercancel="resetPress.cancel"
    ></div>
    <div class="hit-area bottom-right" @pointerdown="armTap"></div>
  </div>
</template>

<style scoped>
.hidden-controls {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
}
.hit-area {
  position: absolute;
  width: 80px;
  height: 80px;
  pointer-events: auto;
}
.top-left {
  top: 0;
  left: 0;
}
.top-right {
  top: 0;
  right: 0;
}
.bottom-left {
  bottom: 0;
  left: 0;
}
.bottom-right {
  bottom: 0;
  right: 0;
}
</style>
