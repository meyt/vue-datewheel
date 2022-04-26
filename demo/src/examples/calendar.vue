<template>
  <div>
    <select v-model="calendar">
      <option :value="item" :key="item" v-for="item in calendars">{{item}}</option>
    </select>

    <vue-datewheel
      v-model="selectedDate"
      :calendar="calendar"
      :min-year="1990"
      :max-year="2020"
    />
  </div>
</template>

<script>
export default {
  data () {
    return {
      selectedDate: new Date().getTime(),
      calendar: 'gregory',
      calendars: [
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
    }
  }
}
</script>
