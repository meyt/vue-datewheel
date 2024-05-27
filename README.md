# vue-datewheel

![Build Status](https://github.com/meyt/vue-datewheel/actions/workflows/main.yaml/badge.svg?branch=master)

Simple iOS like date picker for Vue.

Features:
- Based on Browser native [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) implementation
- Zero dependency
- Multi-calendar
- Localization
- Mouse wheel and touch gestures


[Demo](https://meyt.github.io/vue-datewheel/?path=/story/vue-datewheel--basic)

## Install

Vue 2
```
npm install --save vue-datewheel@0.1.7
```

Vue 3
```
npm install --save vue-datewheel
```


## Usage:


```vue
<template>
  <v-app>
    <v-container>
      <vue-datewheel v-model="selectedDate"/>
      <div v-text="selectedDate" />
    </v-container>
  </v-app>
</template>

<script>
import vueDatewheel from 'vue-datewheel'
import 'vue-datewheel/dist/vue-datewheel.css'

export default {
  components: {
    vueDatewheel,
  },
  data () {
    return {
      selectedDate: null
    }
  }
}
</script>
```
