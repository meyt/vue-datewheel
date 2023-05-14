<script setup>
import {ref} from 'vue'
import faLocale from '../../lib/locales/fa-ir'

const selectedDate = ref(null)
</script>

<template>
  <vue-datewheel
    v-model="selectedDate"
    :locale="faLocale"
    :min-year="1990"
    :max-year="2020"
  />
</template>

