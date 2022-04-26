<template>
  <vue-datewheel
    v-model="selectedDate"
    :layout="[['month', 'day'], ['hour', 'minute']]"
  />
</template>

<script>
export default {
  data () {
    return {
      selectedDate: null
    }
  }
}
</script>