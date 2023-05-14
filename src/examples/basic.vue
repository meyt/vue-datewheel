<script setup>
  import {ref,computed} from 'vue'

  const selectedDate = ref(null)
  const dateString = computed(() => {
    const ctx = selectedDate.value
    if (!ctx) return
    return [
      [ctx.year, ctx.month, ctx.day].join('-'),
      [ctx.hour, ctx.minute, ctx.second].join(':'),
    ].join(' ')
  })

  function increase (n) {
    const dt = new Date(selectedDate.value.date)
    if (n >= 30) {
      dt.setMonth(dt.getMonth() + 1)
    } else {
      dt.setDate(dt.getDate() + n)
    }
    selectedDate.value.date = dt
  }

</script>
<template>
  <div>
    <vue-datewheel v-model="selectedDate" init-today />
    <div v-if="dateString">
      <div>
        <span>Selected Date: </span>
        <span v-text="dateString"/>
      </div>
      <div>
        <span>ISOString: </span>
        <code v-text="selectedDate.date.toISOString()"/>
      </div>
      <button @click="increase(1)">Add one day</button>
      <button @click="increase(7)">Add one week</button>
      <button @click="increase(30)">Add one month</button>
    </div>
  </div>
</template>
