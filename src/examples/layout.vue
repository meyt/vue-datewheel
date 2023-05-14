<script setup>
import {ref} from 'vue'

const selectedDate = ref(null)
</script>

<template>
  <vue-datewheel
    v-model="selectedDate"
    :layout="[['month', 'day'], ['hour', 'minute']]"
  />
</template>
