<script setup>
import { ref, computed, watch, watchEffect, onMounted, nextTick, onBeforeUnmount } from 'vue'
import enLocale from '../locales/en-us'
import selector from './selector.vue'
import debounce from '../helpers/debounce'
import generateTree from '../helpers/datetree'
import addDay from '../helpers/addDay'
import formatToParts from '../helpers/formatToParts'
import isDate from '../helpers/isDate'
import isEqualDate from '../helpers/isEqualDate'
import isEqualDatetime from '../helpers/isEqualDatetime'
import { getYears, getMonths, getDays, getHours, getMinutes, getSeconds, getFirstMonth, getFirstDay } from '../helpers/datepicker'

const defaultCalendar = 'gregory'
const props = defineProps({
  modelValue: {
    type: [Object, Date, String, Number, null],
    default: null
  },
  locale: {
    type: Object,
    default() { return enLocale }
  },
  calendar: {
    type: String,
    default: defaultCalendar
  },
  layout: {
    type: Array,
    default() {
      return [
        ['year', 'month', 'day'],
        ['hour', 'minute', 'second']
      ]
    }
  },
  itemHeight: {
    type: Number,
    default: 35
  },
  min: {
    type: Date,
    default: null
  },
  max: {
    type: Date,
    default: null
  },
  filter: {
    type: Function,
    default: v => true
  },
})
const styles = computed(() => {
  return {
    '--scrollbar-width': scrollbarWidth.value + 'px',
    '--item-height': props.itemHeight + 'px',
  }
})
const emit = defineEmits(['update:modelValue'])

let intlDate = null
let tree = null
const yearInDays = 365
const rootEl = ref(null)
const scrollbarWidth = ref(0)
const cDate = ref(null)
const cYear = ref(null)
const cMonth = ref(null)
const cDay = ref(null)
const cHour = ref(null)
const cMinute = ref(null)
const cSecond = ref(null)
const listItems = ref({
  year: [],
  month: [],
  day: [],
  hour: [],
  minute: [],
  seconds: []
})
const minTime = ref([0, 0, 0])
const maxTime = ref([23, 59, 59])
const minDate = computed(() => {
  return (props.min && new Date(props.min)) || addDay(new Date(), -(50 * yearInDays))
})
const maxDate = computed(() => {
  return (props.max && new Date(props.max)) || addDay(new Date(), 50 * yearInDays)
})

// watchers
watch(minDate, newVal => {
  updateMinTime(cDate.value, newVal)
  updateTree(newVal, newVal, maxDate.value)
  updateLists()
})
watch(maxDate, newVal => {
  updateMaxTime(cDate.value, newVal)
  updateTree(newVal, minDate.value, newVal)
  updateLists()
})
watch(() => props.calendar, newVal => {
  updateIntl(newVal)
  importValue(cDate.value)
  updateTree(newVal, minDate.value, maxDate.value)
  updateLists()
})
watch(() => props.locale, newVal => {
  updateMonths(newVal)
})
watch(() => props.modelValue, (newVal, oldVal) => {
  if (newVal === oldVal) return
  importValue(newVal)
}, { deep: true })
watch(cDate, (newVal, oldVal) => {
  if (newVal === oldVal) return
  if (newVal !== null && oldVal !== null && newVal.getTime() === oldVal.getTime()) return
  updateMinTime(newVal, minDate.value)
  updateMaxTime(newVal, maxDate.value)
  updateLists()
  emit('update:modelValue', { ...getCtx(), date: newVal })
})
watch(cYear, (newVal, oldVal) => {
  if (newVal === oldVal) return
  const day = tree[newVal][cMonth.value - 1][cDay.value - 1]
  cDate.value = new Date(
    day[0],
    day[1],
    day[2],
    cHour.value,
    cMinute.value,
    cSecond.value,
  )
})
watch(cMonth, (newVal, oldVal) => {
  if (newVal === oldVal) return
  const day = tree[cYear.value][newVal - 1][cDay.value - 1]
  cDate.value = new Date(
    day[0],
    day[1],
    day[2],
    cHour.value,
    cMinute.value,
    cSecond.value,
  )
})
watch(cDay, (newVal, oldVal) => {
  if (newVal === oldVal) return
  const day = tree[cYear.value][cMonth.value - 1][newVal - 1]
  cDate.value = new Date(
    day[0],
    day[1],
    day[2],
    cHour.value,
    cMinute.value,
    cSecond.value,
  )
})
watch(cHour, (newVal, oldVal) => {
  if (newVal === oldVal) return
  const day = tree[cYear.value][cMonth.value - 1][cDay.value - 1]
  cDate.value = new Date(
    day[0],
    day[1],
    day[2],
    newVal,
    cMinute.value,
    cSecond.value,
  )
})
watch(cMinute, (newVal, oldVal) => {
  if (newVal === oldVal) return
  const day = tree[cYear.value][cMonth.value - 1][cDay.value - 1]
  cDate.value = new Date(
    day[0],
    day[1],
    day[2],
    cHour.value,
    newVal,
    cSecond.value,
  )
})
watch(cSecond, (newVal, oldVal) => {
  if (newVal === oldVal) return
  const day = tree[cYear.value][cMonth.value - 1][cDay.value - 1]
  cDate.value = new Date(
    day[0],
    day[1],
    day[2],
    cHour.value,
    cMinute.value,
    newVal,
  )
})

// functions
function getLabel(v) {
  return props.locale.datetime[v]
}
function updateMonths(locale) {
  listItems.value.month = getMonths(props.filter, tree, cYear.value, locale.calendar[props.calendar].monthNames)
  adjustField('month')
}
function updateDays() {
  listItems.value.day = getDays(props.filter, tree, cYear.value, cMonth.value)
  adjustField('day')
}
function updateHours() {
  listItems.value.hour = getHours(props.filter, minTime.value, maxTime.value, cYear.value, cMonth.value, cDay.value)
  adjustField('hour')
}
function updateMinutes() {
  listItems.value.minute = getMinutes(props.filter, minTime.value, maxTime.value, cYear.value, cMonth.value, cDay.value, cHour.value)
  adjustField('minute')
}
function updateSeconds() {
  listItems.value.second = getSeconds(props.filter, minTime.value, maxTime.value, cYear.value, cMonth.value, cDay.value, cHour.value, cMinute.value)
  adjustField('second')
}
function updateMinTime(d, min) {
  minTime.value = d && isDate(d) && isEqualDate(d, min)
    ? [min.getHours(), min.getMinutes(), min.getSeconds()]
    : [0, 0, 0]
}
function updateMaxTime(d, max) {
  maxTime.value = d && isDate(d) && isEqualDate(d, max)
    ? [max.getHours(), max.getMinutes(), max.getSeconds()]
    : [23, 59, 59]
}
function getCtx() {
  return {
    date: cDate.value,
    year: cYear.value,
    month: cMonth.value,
    day: cDay.value,
    hour: cHour.value,
    minute: cMinute.value,
    second: cSecond.value,
  }
}
const setField = debounce(function (k, v) {
  v = v.value
  switch (k) {
    case 'year':
      if (v === cYear.value) return
      cYear.value = v
      updateMonths(props.locale)
      updateDays()
      updateHours()
      updateMinutes()
      updateSeconds()
      break
    case 'month':
      if (v === cMonth.value) return
      cMonth.value = v
      updateDays()
      updateHours()
      updateMinutes()
      updateSeconds()
      break
    case 'day':
      if (v === cDay.value) return
      cDay.value = v
      updateHours()
      updateMinutes()
      updateSeconds()
      break
    case 'hour':
      if (v === cHour.value) return
      cHour.value = v
      updateMinutes()
      updateSeconds()
      break
    case 'minute':
      if (v === cMinute.value) return
      cMinute.value = v
      updateSeconds()
      break
    case 'second':
      if (v === cSecond.value) return
      cSecond.value = v
      break
  }
}, 200)
function adjustField(name) {
  const items = listItems.value[name]
  if (items.length === 0) return
  const lastItem = items[items.length - 1]
  const value = getCtxValue(name)
  if (value > lastItem.value) {
    setCtxValue(name, lastItem.value)
  } else if (value < items[0].value) {
    setCtxValue(name, items[0].value)
  } else if (typeof items.find(o => o.value === value) === 'undefined') {
    setCtxValue(name, items[0].value)
  }
}
function calcCtxDate() {
  const [y, m, d] = tree[cYear.value][cMonth.value - 1][cDay.value - 1]
  return new Date(y, m, d, cHour.value, cMinute.value, cSecond.value)
}
function updateIntl(calendar) {
  intlDate = new Intl.DateTimeFormat('en-US', {
    hour12: false,
    calendar,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })
}
function updateTree(calendar, min, max) {
  tree = generateTree(calendar === 'gregory' ? null : intlDate, min, max)
}
function updateLists() {
  listItems.value = {
    year: getYears(props.filter, tree),
    month: getMonths(props.filter, tree, cYear.value, props.locale.calendar[props.calendar].monthNames),
    day: getDays(props.filter, tree, cYear.value, cMonth.value),
    hour: getHours(props.filter, minTime.value, maxTime.value, cYear.value, cMonth.value, cDay.value),
    minute: getMinutes(props.filter, minTime.value, maxTime.value, cYear.value, cMonth.value, cDay.value, cHour.value),
    second: getSeconds(props.filter, minTime.value, maxTime.value, cYear.value, cMonth.value, cDay.value, cHour.value, cMinute.value),
  }
}
function getCtxValue(k) {
  switch (k) {
    case 'year':
      return cYear.value
    case 'month':
      return cMonth.value
    case 'day':
      return cDay.value
    case 'hour':
      return cHour.value
    case 'minute':
      return cMinute.value
    case 'second':
      return cSecond.value
  }
}
function setCtxValue(k, v) {
  switch (k) {
    case 'year':
      if (cYear.value === v) return
      cYear.value = v
      return
    case 'month':
      if (cMonth.value === v) return
      cMonth.value = v
      return
    case 'day':
      if (cDay.value === v) return
      cDay.value = v
      return
    case 'hour':
      if (cHour.value === v) return
      cHour.value = v
      return
    case 'minute':
      if (cMinute.value === v) return
      cMinute.value = v
      return
    case 'second':
      if (cSecond.value === v) return
      cSecond.value = v
      return
  }
}
function resetAll() {
  cDate.value = null
  cYear.value = null
  cMonth.value = null
  cDay.value = null
  cHour.value = null
  cMinute.value = null
  cDay.value = null
}
function importValue(v) {
  if (v === null) {
    // no value
    cDate.value = null
    cYear.value = tree.years[0]
    cMonth.value = getFirstMonth(tree, cYear.value)
    cDay.value = getFirstDay(tree, cYear.value, cMonth.value)
    cHour.value = minDate.value.getHours()
    cMinute.value = minDate.value.getMinutes()
    cSecond.value = minDate.value.getSeconds()

  } else if (typeof v === 'string' || typeof v === 'number' || isDate(v)) {
    // load datetime or isostring or timestamp
    const newDate = new Date(v)
    if (cDate.value === null || !isEqualDatetime(cDate.value, newDate)) {
      resetAll()
      cDate.value = newDate
    }
  } else if (typeof v === 'object') {
    // load ctx
    cDate.value = v.date
    cYear.value = v.year
    cMonth.value = v.month
    cDay.value = v.day
    cHour.value = v.hour
    cMinute.value = v.minute
    cSecond.value = v.second
  }

  if (cDate.value === null) {
    cDate.value = calcCtxDate()
  } else {
    const parts = formatToParts(intlDate, cDate.value)
    cYear.value = parts.year
    cMonth.value = parts.month
    cDay.value = parts.day
    cHour.value = parts.hour
    cMinute.value = parts.minute
    cSecond.value = parts.second
  }
}

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
  updateIntl(props.calendar)
  updateTree(props.calendar, minDate.value, maxDate.value)
  importValue(props.modelValue)
  updateMinTime(cDate.value, minDate.value)
  updateMaxTime(cDate.value, maxDate.value)
  updateLists()

  // fix scroll
  nextTick(() => {
    const el = rootEl.value.querySelector('.selector-list')
    scrollbarWidth.value = el ? el.offsetWidth - el.clientWidth : 24
  })
})
onBeforeUnmount(() => {
  isMounted.value = false
  intlDate = null
  tree = null
})
</script>

<template>
  <div
    v-if="isMounted"
    ref="rootEl"
    class="vue-datewheel"
    :style="styles"
  >
    <div
      v-for="(cols, idx) in layout"
      :key="idx"
      class="vdw-row"
    >
      <div
        v-for="col in cols"
        :key="col"
        class="vdw-col"
      >
        <selector
          :modelValue="getCtxValue(col)"
          :items="listItems[col]"
          :label="getLabel(col)"
          :item-height="itemHeight"
          :class="{ 'time-list': ['hour', 'minute', 'second'].includes(col) }"
          @update:model-value="setField(col, $event)"
        />
      </div>
    </div>
  </div>
</template>
