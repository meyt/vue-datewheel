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

<script>
export default {
  data () {
    return {
      selectedDate: null
    }
  },
  computed: {
    dateString () {
      const ctx = this.selectedDate
      if (!ctx) return
      return [
        [ctx.year, ctx.month, ctx.day].join('-'),
        [ctx.hour, ctx.minute, ctx.second].join(':'),
      ].join(' ')
    }
  },
  methods: {
    increase (n) {
      const dt = new Date(this.selectedDate.date)
      if (n >= 30) {
        dt.setMonth(dt.getMonth() + 1)
      } else {
        dt.setDate(dt.getDate() + n)
      }
      this.selectedDate.date = dt
    }
  }
}
</script>
