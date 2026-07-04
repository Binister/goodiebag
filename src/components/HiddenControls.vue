<script setup>
import { useParentControls } from '../composables/useParentControls'

const props = defineProps({
  armEnabled: { type: Boolean, default: false }
})
const emit = defineEmits(['arm', 'next', 'prev', 'reset'])

const { nextTap, prevTap, resetPress } = useParentControls({
  onNext: () => emit('next'),
  onPrev: () => emit('prev'),
  onReset: () => emit('reset')
})

function handleArmTap() {
  if (props.armEnabled) emit('arm')
}
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
    <div class="hit-area bottom-right" @pointerdown="handleArmTap"></div>
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
  width: 96px;
  height: 96px;
  pointer-events: auto;
}
.top-left {
  top: max(8px, env(safe-area-inset-top));
  left: max(8px, env(safe-area-inset-left));
}
.top-right {
  top: max(8px, env(safe-area-inset-top));
  right: max(8px, env(safe-area-inset-right));
}
.bottom-left {
  bottom: max(18px, env(safe-area-inset-bottom));
  left: max(8px, env(safe-area-inset-left));
}
.bottom-right {
  bottom: max(18px, env(safe-area-inset-bottom));
  right: max(8px, env(safe-area-inset-right));
}
</style>
