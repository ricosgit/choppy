<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import DisplayImage from '@/components/DisplayImage.vue'
</script>

<template>
  <header>
  </header>

  <main>
    <v-app>
        <AppHeader />
        <v-main>
          <v-container fluid>
            <DisplayImage />
          </v-container>
        </v-main>
    </v-app>
  </main>
</template>

<style scoped>
</style>
