<template>
  <vue-datewheel
    v-model="selectedDate"
    :locale="faLocale"
    :min-year="1990"
    :max-year="2020"
  />
</template>

<script>
import faLocale from '../../../src/locales/fa-ir'
export default {
  data () {
    return {
      faLocale,
      selectedDate: null
    }
  }
}
</script>
