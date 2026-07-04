<script setup>
import { inject, ref, onMounted, computed, nextTick } from 'vue'

const audio = inject('audio')

const phase = ref('A')
const showVideo = ref(false)
const videoDone = ref(false)
const videoRef = ref(null)

const videoSrc = computed(() => import.meta.env.BASE_URL + 'assets/video/boef-live.mp4')

onMounted(() => {
  audio.play('boefGesprek')
})

function replayGesprek() {
  audio.play('boefGesprek')
}

function startHack() {
  phase.value = 'B'
  audio.play('hack')
  setTimeout(async () => {
    showVideo.value = true
    await nextTick()
    videoRef.value?.play()
  }, 2000)
}

function onVideoEnded() {
  videoDone.value = true
  audio.play('slot')
}

function replayVideo() {
  if (!videoRef.value) return
  videoDone.value = false
  videoRef.value.currentTime = 0
  videoRef.value.play()
}
</script>

<template>
  <div class="screen interception-screen">
    <template v-if="phase === 'A'">
      <div class="screen-title">VERBINDING ONDERSCHEPT</div>
      <div class="waveform">
        <span v-for="n in 12" :key="n" class="bar" :style="{ animationDelay: `${n * 0.07}s` }"></span>
      </div>
      <button class="big-button" @click="replayGesprek">↻ OPNIEUW AFSPELEN</button>
      <button class="big-button active" @click="startHack">📹 CAMERA VERDACHTE HACKEN</button>
    </template>
    <template v-else>
      <div v-if="!showVideo" class="screen-title">VERBINDING MAKEN MET CAMERA...</div>
      <div v-else class="video-wrap">
        <video ref="videoRef" :src="videoSrc" playsinline @ended="onVideoEnded"></video>
        <div class="overlay">
          <div class="rec-dot"><span class="dot"></span> LIVE</div>
          <div class="cam-label">CAM VERDACHTE — VERBONDEN</div>
          <div class="signal-bars-small">
            <span v-for="n in 3" :key="n" class="bar"></span>
          </div>
          <div class="battery">🔋</div>
        </div>
        <div v-if="videoDone" class="result-overlay">
          <div class="screen-title">LOCATIE HERKEND</div>
          <button class="big-button" @click="replayVideo">↻ OPNIEUW AFSPELEN</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.waveform {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  height: 4rem;
}
.waveform .bar {
  width: 0.5rem;
  height: 1rem;
  background: var(--signal-green);
  animation: wave 0.9s ease-in-out infinite;
}
@keyframes wave {
  0%,
  100% {
    height: 0.6rem;
  }
  50% {
    height: 3.5rem;
  }
}
.video-wrap {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: black;
}
.video-wrap video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.overlay {
  position: absolute;
  inset: 0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--signal-green);
  font-size: 0.9rem;
  pointer-events: none;
}
.rec-dot {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--error-red);
}
.dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: var(--error-red);
  animation: blink 1s step-start infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
.signal-bars-small {
  display: flex;
  gap: 0.2rem;
  align-self: flex-end;
}
.signal-bars-small .bar {
  width: 0.3rem;
  height: 1rem;
  background: var(--signal-green);
}
.battery {
  align-self: flex-end;
}
.result-overlay {
  position: absolute;
  inset: 0;
  background: rgba(11, 29, 38, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  pointer-events: auto;
}
</style>
