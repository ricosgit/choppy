// Vuetify
import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { createApp } from 'vue'
import App from './App.vue'

export const customColors = {
  chromakeyGreen: '00FF00',
  chromakeyBlue: '0000FF',
  magenta: 'FF00FF',
  cyan: '00FFFF',
  pureRed: 'FF0000',
  pureBlack: '000000',
  pureWhite: 'FFFFFF',
  keyLime: '32CD32'
}

const customTheme: ThemeDefinition = {
  dark: false,
  colors: customColors
}

const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'customTheme',
      themes: {
        customTheme,
      }
    }
  })

createApp(App).use(vuetify).mount('#app')
