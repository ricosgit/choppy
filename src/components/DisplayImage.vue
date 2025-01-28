<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const displayImage = ref<string>('normal')

// Blink settings
const isActiveBlink = ref<boolean>(true)
const blinkFloatingInterval: number = 5000
const blinkMinInterval: number = 3000
const blinkDuration: number = 300
let intervalId: number = 0

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

onMounted(() => {
  blink()
})

onBeforeUnmount(() => {
  clearTimeout(intervalId)
})
</script>

<template>
  <img :src="`/src/assets/img/${displayImage}.png`" alt="">
  <v-btn @click="switchBlink">Switch Blink</v-btn>
</template>
