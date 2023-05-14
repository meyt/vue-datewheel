<script setup>
import {ref} from 'vue'

const selectedDate = ref(new Date().getTime())
const calendar = ref('gregory')
const calendars = [
  'buddhist',
  // 'chinese',
  'coptic',
  // 'dangi',
  'ethioaa',
  'ethiopic',
  'gregory',
  // 'hebrew',
  'indian',
  'islamic',
  'islamic-umalqura',
  'islamic-tbla',
  'islamic-civil',
  'islamic-rgsa',
  // 'iso8601',
  'japanese',
  'persian',
  'roc'
]
</script>

<template>
  <div>
    <select v-model="calendar">
      <option
        v-for="item in calendars"
        :key="item"
        :value="item"
      >
        {{item}}
      </option>
    </select>

    <vue-datewheel
      v-model="selectedDate"
      :calendar="calendar"
      :min-year="1990"
      :max-year="2020"
    />
  </div>
</template>
