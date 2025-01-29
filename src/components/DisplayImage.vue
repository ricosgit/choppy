<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const displayImage = ref<string>('normal')

// Blink settings
const isActiveBlink = ref<boolean>(true)
const blinkFloatingInterval: number = 5000
const blinkMinInterval: number = 3000
const blinkDuration: number = 300
let intervalId: number = 0

// Talk settings
const volume = ref<number>(0)
const audioContext = ref<AudioContext | null>(null)
const analyser = ref<AnalyserNode | null>(null)
const microphone = ref<MediaStreamAudioSourceNode | null>(null)
const animationFrameId = ref<number | null>(null)
const threshold: number = 0.1 // 音量閾値（0.0〜1.0）

/**
 * switch between normal and blink image at random interval
 */
const blink = (): void => {
  const randomInterval = Math.random() * blinkFloatingInterval + blinkMinInterval
  intervalId = setTimeout(() => {
    if (isActiveBlink.value) {
      displayImage.value = 'blink'
      setTimeout(() => {
        displayImage.value = 'normal'
      }, blinkDuration)
    }
    blink()
  }, randomInterval)
}

/**
 * switch blink on/off
 */
const switchBlink = (): void => {
  isActiveBlink.value = !isActiveBlink.value
}

/**
 * Analyze audio data and execute processing when the threshold is exceeded
 */
const processAudio = (): void => {
  if (!analyser.value) return

  const dataArray = new Uint8Array(analyser.value.frequencyBinCount)
  analyser.value.getByteFrequencyData(dataArray)

  // calculate the average volume
  const avg = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
  volume.value = avg / 256

  // switch display image when the volume exceeds the threshold
  if (displayImage.value !== 'blink') {
    displayImage.value = volume.value > threshold ? 'talk' : 'normal'
  }

  animationFrameId.value = requestAnimationFrame(processAudio);
}

/**
 * Start listening to the microphone
 */
const startListening = async (): Promise<void> => {
  // If already listening, do nothing
  if (audioContext.value) return

  // Initialize audio context
  audioContext.value = new AudioContext()
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  analyser.value = audioContext.value.createAnalyser()
  microphone.value = audioContext.value.createMediaStreamSource(stream)

  microphone.value.connect(analyser.value)
  analyser.value.fftSize = 256 // resolution of the frequency analysis

  processAudio()
}

/**
 * Stop listening to the microphone
 */
const stopListening = (): void => {
  if (audioContext.value) {
    audioContext.value.close()
    audioContext.value = null
  }
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = null
  }
}

onMounted(() => {
  blink()
})

onBeforeUnmount(() => {
  clearTimeout(intervalId)
  stopListening()
})
</script>

<template>
  <img :src="`/src/assets/img/${displayImage}.png`" alt="">
  <v-btn @click="switchBlink">Switch Blink</v-btn>
  <p>Current volume level: {{ volume.toFixed(2) }}</p>
  <v-btn @click="startListening">Start Recording</v-btn>
  <v-btn @click="stopListening">Stop Recording</v-btn>
</template>
