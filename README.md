# vue-datewheel

![Build Status](https://github.com/meyt/vue-datewheel/actions/workflows/main.yaml/badge.svg?branch=master)

Simple iOS like date picker for Vue.

Features:
- Based on Browsers native Intl
- Zero dependency
- Multi-calendar
- Localization
- Mouse wheel and touch gestures


[Demo](https://meyt.github.io/vue-datewheel)

## Install

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
import vueDatewheel from 'vue-datewheel
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
