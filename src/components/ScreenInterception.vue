<script setup>
import { inject, ref, onMounted, computed, nextTick } from 'vue'

const audio = inject('audio')

const phase = ref('A')
const showVideo = ref(false)
const videoDone = ref(false)
const videoRef = ref(null)
const gesprekPlaying = ref(false)
let currentGesprekSource = null

const videoSrc = computed(() => audio.videoUrl.value)

onMounted(() => {
  playGesprek()
})

function playGesprek() {
  // audio.play() stopt zelf al een eventueel nog spelende vorige beurt
  // (bv. bij snel op "opnieuw afspelen" drukken), maar de oude bron kan
  // zijn eigen 'ended' nog steeds na de nieuwe start vuren. Alleen de
  // laatst gestarte bron mag gesprekPlaying dus nog beïnvloeden.
  gesprekPlaying.value = true
  const playback = audio.play('boefGesprek')
  currentGesprekSource = playback?.source ?? null
  if (playback?.source) {
    const thisSource = playback.source
    thisSource.addEventListener('ended', () => {
      if (currentGesprekSource === thisSource) {
        gesprekPlaying.value = false
      }
    })
  } else {
    gesprekPlaying.value = false
  }
}

function replayGesprek() {
  playGesprek()
}

async function startHack() {
  phase.value = 'B'
  audio.play('hack')
  await nextTick()
  // Meteen (nog binnen deze klik-gesture) een keer starten en direct weer
  // pauzeren: Safari staat het latere, asynchrone afspelen met geluid
  // alleen betrouwbaar toe als het video-element al eens via een
  // user-gesture is gestart.
  try {
    await videoRef.value?.play()
    videoRef.value?.pause()
  } catch {
    // Priming mislukt: de echte afspeelpoging hieronder wordt alsnog geprobeerd.
  }
  setTimeout(() => {
    showVideo.value = true
    if (videoRef.value) videoRef.value.currentTime = 0
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
      <h1 class="screen-title">Verbinding onderschept</h1>
      <div class="waveform" :class="{ playing: gesprekPlaying }">
        <span v-for="n in 12" :key="n" class="bar" :style="{ animationDelay: `${n * 0.07}s` }"></span>
      </div>
      <button class="big-button secondary" @click="replayGesprek">↻ Opnieuw afspelen</button>
      <button class="big-button" @click="startHack">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7h3l1.5-2h9L18 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
        Camera verdachte hacken
      </button>
    </template>
    <template v-else>
      <h1 v-if="!showVideo" class="screen-title">Verbinding maken met camera...</h1>
      <div class="video-wrap" v-show="showVideo">
        <video ref="videoRef" :src="videoSrc" playsinline @ended="onVideoEnded"></video>
        <div class="overlay">
          <div class="rec-dot"><span class="dot"></span> LIVE</div>
          <div class="cam-label">Cam verdachte — verbonden</div>
          <div class="signal-bars-small">
            <span v-for="n in 3" :key="n" class="bar"></span>
          </div>
          <svg class="battery" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="17" height="10" rx="2" />
            <line x1="22" y1="10" x2="22" y2="14" />
            <rect x="4.5" y="9.5" width="11" height="5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div v-if="videoDone" class="result-overlay">
          <h1 class="screen-title">Locatie herkend</h1>
          <button class="big-button" @click="replayVideo">↻ Opnieuw afspelen</button>
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
  height: 0.6rem;
  background: var(--police-blue);
  animation: wave 0.9s ease-in-out infinite;
  animation-play-state: paused;
  transition: height 0.2s ease-out;
}
.waveform.playing .bar {
  animation-play-state: running;
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
  color: rgba(255, 255, 255, 0.9);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.03em;
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
  background: rgba(255, 255, 255, 0.9);
  animation: signalFlicker 2.4s ease-in-out infinite;
}
.signal-bars-small .bar:nth-child(1) {
  animation-delay: 0s;
}
.signal-bars-small .bar:nth-child(2) {
  animation-delay: 0.3s;
}
.signal-bars-small .bar:nth-child(3) {
  animation-delay: 0.6s;
}
@keyframes signalFlicker {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}
.battery {
  align-self: flex-end;
  animation: batteryFlicker 3.6s ease-in-out infinite;
}
@keyframes batteryFlicker {
  0%,
  92%,
  100% {
    opacity: 0.9;
  }
  95% {
    opacity: 0.5;
  }
}
.result-overlay {
  position: absolute;
  inset: 0;
  background: rgba(11, 14, 20, 0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  pointer-events: auto;
}
</style>
