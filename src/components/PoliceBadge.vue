<template>
  <div class="police-badge" aria-hidden="true">
    <svg viewBox="0 0 100 110" width="42" height="46">
      <path
        d="M50 4 L90 18 V50 C90 78 72 98 50 106 C28 98 10 78 10 50 V18 Z"
        fill="var(--bg-alt)"
        stroke="var(--police-blue)"
        stroke-width="4"
      />
      <path
        d="M50 22 L58 40 H78 L62 52 L68 72 L50 60 L32 72 L38 52 L22 40 H42 Z"
        fill="var(--police-blue)"
      />
    </svg>
    <div class="badge-label">POLITIE</div>
  </div>
</template>

<style scoped>
.police-badge {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 0.6rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  pointer-events: none;
  opacity: 0.9;
}
.badge-label {
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  color: var(--police-blue);
  font-weight: bold;
}
</style>
