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
  filterDate: {
    type: Function,
    default: null
  },
  filterTime: {
    type: Function,
    default: null
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
const ctx = ref(createDateContext())
const listItems = ref({
  year: [],
  month: [],
  day: [],
  hour: [],
  minute: [],
  seconds: []
})
const minDate = computed(() => {
  return (props.min && new Date(props.min)) || addDay(new Date(), -(50 * yearInDays))
})
const maxDate = computed(() => {
  return (props.max && new Date(props.max)) || addDay(new Date(), 50 * yearInDays)
})

// watchers
watch(minDate, newVal => {
  updateTree(newVal, newVal, maxDate.value)
  updateLists()
})
watch(maxDate, newVal => {
  updateTree(newVal, minDate.value, newVal)
  updateLists()
})
watch(() => props.calendar, newVal => {
  updateIntl(newVal)
  importValue(ctx.value.date)
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
watch(ctx, (newVal) => {
  emit('update:modelValue', { ...newVal })
}, { deep: true })

// functions
function createDateContext() {
  return {
    date: null,
    year: null,
    month: null,
    day: null,
    hour: 0,
    minute: 0,
    second: 0,
  }
}

function getYears() {
  return tree.years
    .map(year => parseInt(year))
    .filter(year => {
      if (typeof props.filterDate !== 'function') return true
      return props.filterDate({ year, month: null, day: null })
    })
    .map(value => ({ text: value, value }))
}
function getMonths(year, locale) {
  const r = []
  tree[year].entries().forEach(([k, v]) => {
    if (!v.length) return
    if (typeof props.filterDate === 'function') {
      if (!props.filterDate({ year, month: k + 1, day: null })) {
        return
      }
    }
    r.push({
      text: locale.calendar[props.calendar].monthNames[k],
      value: k + 1
    })
  })
  return r
}
function getDays(year, month) {
  const r = []
  tree[year][month - 1].entries().forEach(([k, v]) => {
    if (v === null) return
    k = k + 1
    if (typeof props.filterDate === 'function') {
      if (!props.filterDate({ year, month, day: k })) {
        return
      }
    }
    r.push({
      text: k,
      value: k,
      date: v
    })
  })
  return r
}
function getLabel(v) {
  return props.locale.datetime[v]
}
function updateMonths(locale) {
  listItems.value.month = getMonths(ctx.value.year, props.locale)
  adjustField('month')
}
function updateDays() {
  listItems.value.day = getDays(ctx.value.year, ctx.value.month)
  adjustField('day')
}
function updateTime() {
  Object.entries(getTime(ctx.value.date, minDate.value, maxDate.value)).forEach(([k, v]) => {
    listItems.value[k] = v
  })
  adjustField('hour')
  adjustField('minute')
  adjustField('second')
}
const setField = debounce(function (k, v) {
  if (ctx.value[k] === v.value) return
  ctx.value[k] = v.value
  if (ctx.value.date) {
    switch (k) {
      case 'year':
        updateMonths(props.locale)
        updateDays()
        break
      case 'month':
        updateDays()
        break
    }
    const day = tree[ctx.value.year][ctx.value.month - 1][ctx.value.day - 1]
    ctx.value.date = new Date(
      day[0],
      day[1],
      day[2],
      ctx.value.hour,
      ctx.value.minute,
      ctx.value.second
    )
    if (k === 'year' || k === 'month' || k === 'day') {
      updateTime()
    }
  }
}, 200)
function adjustField(name) {
  const items = listItems.value[name]
  if (items.length === 0) return
  const lastItem = items[items.length - 1]
  const value = ctx.value[name]
  if (value > lastItem.value) {
    ctx.value[name] = lastItem.value
  } else if (value < items[0].value) {
    ctx.value[name] = items[0].value
  } else if (typeof items.find(o => o.value === value) === 'undefined') {
    ctx.value[name] = items[0].value
  }
}
function getFirstMonth(year) {
  for (const [k, v] of tree[year].entries()) {
    if (v.length) return k + 1
  }
}
function getFirstDay(year, month) {
  for (const [k, v] of tree[year][month - 1].entries()) {
    if (v !== null) return k + 1
  }
}
function calcCtxDate() {
  const [y, m, d] = tree[ctx.value.year][ctx.value.month - 1][ctx.value.day - 1]
  return new Date(y, m, d)
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
function getTime(d, min, max) {
  const r = { hour: [], minute: [], second: [] }
  min = isEqualDate(d, min)
    ? [min.getHours(), min.getMinutes(), min.getSeconds()]
    : [0, 0, 0]
  max = isEqualDate(d, max)
    ? [max.getHours(), max.getMinutes(), max.getSeconds()]
    : [23, 59, 59]
  for (let i = min[0]; i <= max[0]; i++) {
    r.hour.push({ text: i, value: i })
  }
  for (let i = min[1]; i <= max[1]; i++) {
    r.minute.push({ text: i, value: i })
  }
  for (let i = min[2]; i <= max[2]; i++) {
    r.second.push({ text: i, value: i })
  }
  return r
}
function updateLists() {
  listItems.value = {
    year: getYears(),
    month: getMonths(ctx.value.year, props.locale),
    day: getDays(ctx.value.year, ctx.value.month),
    ...getTime(ctx.value.date, minDate.value, maxDate.value),
  }
}
function isInitialCtx(c) {
  return Object.values(c).every(v => v === null)
}
function isSameCtx(a, b) {
  return (
    (
      (isDate(a.date) && isDate(b.date) && isEqualDatetime(a.date, b.date)) ||
      a.date === b.date
    ) &&
    a.year === b.year && a.month === b.month && a.day === b.day &&
    a.hour === b.hour && a.minute === b.minute && a.second === b.second
  )
}
function importValue(v) {
  if (isDate(v) || typeof v === 'string' || typeof v === 'number') {
    // load datetime or isostring or timestamp
    const newDate = new Date(v)
    if (ctx.value.date === null || !isEqualDatetime(ctx.value.date, newDate)) {
      ctx.value = createDateContext()
      ctx.value.date = newDate
    }

  } else if (v === null) {
    // no value
    if (!isInitialCtx(ctx.value)) {
      ctx.value = createDateContext()
      ctx.value.year = tree.years[0]
      ctx.value.month = getFirstMonth(ctx.value.year)
      ctx.value.day = getFirstDay(ctx.value.year, ctx.value.month)
    }

  } else if (typeof v === 'object') {
    // load ctx
    if (!isSameCtx(ctx.value, v)) {
      ctx.value = v
    }
  }

  if (ctx.value.date === null) {
    ctx.value.date = calcCtxDate()
  } else {
    const parts = formatToParts(intlDate, ctx.value.date)
    Object.keys(ctx.value).forEach((k) => {
      if (typeof parts[k] === 'undefined') return
      if (ctx.value[k] === parts[k]) return
      ctx.value[k] = parts[k]
    })
  }
}

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
  updateIntl(props.calendar)
  updateTree(props.calendar, minDate.value, maxDate.value)
  importValue(props.modelValue)
  updateLists()

  // fix scroll
  nextTick(() => {
    setTimeout(() => {
      const el = rootEl.value.querySelector('.selector-list')
      scrollbarWidth.value = el ? el.offsetWidth - el.clientWidth : 24
    }, 0)
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
    ref="rootEl"
    class="vue-datewheel"
    :style="styles"
    v-if="isMounted"
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
          :modelValue="ctx[col]"
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