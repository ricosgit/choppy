<script setup lang="ts">
import { customColors } from '@/main'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { mdiChatOutline, mdiEyeClosed, mdiEyeOutline, mdiVolumeEqual, mdiVolumeHigh } from '@mdi/js'

interface SelectedFiles {
  [normal: string] : File | null,
  blink: File | null,
  talk: File | null
}
const selectedFiles = ref<SelectedFiles>({
  normal: null,
  blink: null,
  talk: null
})

interface ImageUrl {
  [normal: string]: string,
  blink: string,
  talk: string
}
const imageUrl = ref<ImageUrl>({
  normal: '/src/assets/img/normal.png',
  blink: '/src/assets/img/blink.png',
  talk: '/src/assets/img/talk.png'
})

const displayImage = ref<string>('normal')
const selectedBgColor = ref<string>('chromakeyGreen')
const bgColors = Object.keys(customColors)

// Blink settings
const isActiveBlink = ref<boolean>(true)
const blinkFloatingInterval: number = 5000
const blinkMinInterval: number = 3000
const blinkDuration: number = 300
let intervalId: number = 0

// Talk settings
const isActiveTalk = ref<boolean>(false)
const volume = ref<number>(0)
const audioContext = ref<AudioContext | null>(null)
const analyser = ref<AnalyserNode | null>(null)
const microphone = ref<MediaStreamAudioSourceNode | null>(null)
const animationFrameId = ref<number | null>(null)
const threshold = ref<number>(0.1) // 0.0〜1.0

/**
 * Preview the selected image
 * @param imgKind - 'normal', 'blink', or 'talk'
 */
const previewImage = (imgKind: string): void => {
  if (selectedFiles.value[imgKind]) {
    const file = selectedFiles.value[imgKind] as File
    const reader = new FileReader()

    reader.onload = (e) => {
      imageUrl.value[imgKind] = e.target?.result as string
    }

    reader.readAsDataURL(file);
  }
}

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
    displayImage.value = volume.value > threshold.value ? 'talk' : 'normal'
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
  <v-row no-gutters>
    <v-col class="text-center">
      <v-card
        :style="{ 'background-color': `rgb(var(--v-theme-${selectedBgColor}))` }"
      >
        <v-img
          :src="imageUrl[displayImage]"
          alt="プレビュー画像"
          max-height="1000"
          class="my-10"
        />
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <v-card
        title="Select Images"
        class="pa-5"
      >
        <v-file-input
          accept="image/*"
          label="Normal Image"
          show-size
          v-model="selectedFiles.normal"
          :prepend-icon="mdiEyeOutline"
          @change="previewImage('normal')"
        />
        <v-file-input
          accept="image/*"
          label="Blink Image"
          show-size
          v-model="selectedFiles.blink"
          :prepend-icon="mdiEyeClosed"
          @change="previewImage('blink')"
        />
        <v-file-input
          accept="image/*"
          label="Talk Image"
          show-size
          v-model="selectedFiles.talk"
          :prepend-icon="mdiChatOutline"
          @change="previewImage('talk')"
        />
      </v-card>
    </v-col>
    <v-col>
      <v-card
        title="Settings"
        class="pa-5"
      >
        <v-select
          label="Background Color"
          v-model="selectedBgColor"
          :items="bgColors"
        />
        <v-switch
          label="Blink"
          color="black"
          v-model="isActiveBlink"
        />
        <v-switch
          label="Talk"
          color="black"
          v-model="isActiveTalk"
          @update:modelValue="isActiveTalk ? startListening() : stopListening()"
        />
        <v-slider
          v-show="isActiveTalk"
          label="Threshold"
          min="0"
          max="1"
          step="0.1"
          thumb-label="always"
          :prepend-icon="mdiVolumeEqual"
          v-model="threshold"
        />
        <v-slider
          v-show="isActiveTalk"
          label="Microphone Input"
          readonly
          min="0"
          max="1"
          thumb-label="always"
          :prepend-icon="mdiVolumeHigh"
          v-model="volume"
        />
      </v-card>
    </v-col>
  </v-row>
</template>

<style>
.v-slider__label {
  width: 150px;
}
</style>
