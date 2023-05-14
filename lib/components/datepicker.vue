<script setup>
import {ref,computed,watch,watchEffect, onMounted, nextTick, onBeforeUnmount} from 'vue'
import enLocale from '../locales/en-us'
import selector from './selector.vue'
import debounce from '../helpers/debounce'


const props = defineProps({
  modelValue: {
    type: [Object, Date, String, Number],
    default: null
  },
  locale: {
    type: Object,
    default () { return enLocale }
  },
  calendar: {
    type: String,
    default: 'gregory'
  },
  format: {
    type: String,
    default: null
  },
  initToday: {
    type: Boolean,
    default: false
  },
  layout: {
    type: Array,
    default () { return [
      ['year', 'month', 'day'],
      ['hour', 'minute', 'second']
    ]}
  },
  itemHeight: {
    type: Number,
    default: 35
  },
  minYear: {
    type: Number,
    default () { return new Date().getFullYear() - 100 }
  },
  maxYear: {
    type: Number,
    default () { return new Date().getFullYear() + 100 }
  },
  maxDaysInMonth: {
    type: Number,
    default: 31
  },
  maxMonthsInYear: {
    type: Number,
    default: 12
  },
  filterYear: {
    type: Function,
    default: null
  },
  filterMonth: {
    type: Function,
    default: null
  },
  filterDay: {
    type: Function,
    default: null
  },
  filterHour: {
    type: Function,
    default: null
  },
  filterMinute: {
    type: Function,
    default: null
  },
  filterSecond: {
    type: Function,
    default: null
  }
})
const styles = computed(() => {
  return {
    '--scrollbar-width': scrollbarWidth.value + 'px',
    '--item-height': props.itemHeight + 'px',
  }
})
const emit = defineEmits(['update:modelValue'])

const rootEl = ref(null)
const scrollbarWidth = ref(0)
const ctx = ref(createDateContext())
const tree = ref(null)
const calendar_ = ref(props.calendar)
const listItems = ref({
  year: [],
  month: [],
  day: [],
  hour: [],
  minute: [],
  seconds: []
})
let intlDate = null

// watchers
watch(() => props.calendar, (newVal, oldVal) => {
  if (newVal === oldVal) return
  createIntl(newVal)
  importValue(props.modelValue, newVal, props.minYear, props.maxYear)
  calendar_.value = newVal
})
watch(() => props.modelValue, (newVal, oldVal) => {
  if (newVal !== null) {
    const ctx_ = ctx.value
    if (
      typeof newVal === 'object' && (
        typeof ctx_ !== 'object' ||
        ctx_ === null ||
        (
          newVal.date &&
          ctx_.date &&
          newVal.date.getTime() !== ctx_.date.getTime()
        ) ||
        newVal.year !== ctx_.year ||
        newVal.month !== ctx_.month ||
        newVal.day !== ctx_.day ||
        newVal.hour !== ctx_.hour ||
        newVal.minute !== ctx_.minute ||
        newVal.second !== ctx_.second
      )
    ) {
      importValue(newVal, props.calendar, props.minYear, props.maxYear)
    }
  }
}, { deep: true })
watch(ctx, (newVal) => {
  emit('update:modelValue', {...newVal})
}, { deep: true })

// functions
function createDateContext () {
  return {
    date: null,
    year: null,
    month: null,
    day: null,
    hour: null,
    minute: null,
    second: null,
  }
}

function formatToParts (intl, d) {
  const r = {}
  intl.formatToParts(d).forEach(v => {
    r[v.type] = isNaN(v.value) ? v.value : parseInt(v.value)
  })
  return r
}

function generateTree (calendar, fromYear, toYear) {
  const res = {}
  const intl = new Intl.DateTimeFormat('en-US', {
    hour12: false,
    calendar,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })
  function setDay (p, date) {
    if (typeof res[p.year] === 'undefined') {
      res[p.year] = []
    }
    if (typeof res[p.year][p.month - 1] === 'undefined') {
      for (let i = 0; i < p.month - res[p.year].length; i++) {
        res[p.year].push([])
      }
      res[p.year][p.month-1] = []
    }
    const day = [date.getFullYear(), date.getMonth(), date.getDate()]
    if (typeof res[p.year][p.month - 1][p.day - 1] === 'undefined') {
      const month = res[p.year][p.month - 1]
      for (let i = 0; i < p.day - month.length; i++) {
        month.push(null)
      }
    }
    res[p.year][p.month - 1][p.day - 1] = day
  }

  let date = new Date(fromYear, 0, 1)
  let p = formatToParts(intl, date)
  while (date.getFullYear() < toYear) {
    date.setDate(date.getDate() + 1)
    p = formatToParts(intl, date)
    if (date.getFullYear() >= toYear) break
    setDay(p, date)
  }
  return res
}


// methods
function applyFilter(fieldName) {
  const filter = props['filter' + fieldName[0].toUpperCase() + fieldName.substring(1)]
  if (filter === null) return
  listItems.value[fieldName] = listItems.value[fieldName].filter(filter)
}
function createIntl (calendar) {
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
function getYears (tree, minYear, maxYear) {
  if (tree) return Object.keys(tree).sort((a, b) => a - b).map((k) => {
    k = parseInt(k)
    return { text: k, value: k }
  })
  const r = []
  minYear = formatToParts(intlDate, new Date(minYear, 0, 1)).year
  maxYear = formatToParts(intlDate, new Date(maxYear, 11, 31)).year
  for (let i = minYear; i < maxYear; i++) {
    r.push({ text: i, value: i })
  }
  return r
}
function getMonths (tree, year, maxMonthsInYear) {
  if (tree && year && typeof tree[year] !== 'undefined') {
    return tree[year].filter(el => el != null).map((v, k) => {
      return {
        text: props.locale.calendar[props.calendar].monthNames[k],
        value: k + 1
      }
    })
  }
  const r = []
  for (let i = 0; i < maxMonthsInYear; i++) {
    r.push({
      text: props.locale.calendar[props.calendar].monthNames[i],
      value: i + 1,
    })
  }
  return r
}
function getDays (tree, year, month, maxDaysInMonth) {
  if (tree && year && month && typeof tree[year] !== 'undefined' && typeof tree[year][month-1] !== 'undefined') {
    return tree[year][month - 1].map((v, k) => {
      return {
        text: k + 1,
        value: k + 1,
        date: v
      }
    })
  }
  const r = []
  for (let i = 1; i <= maxDaysInMonth; i++) {
    r.push({ text: i, value: i, date: null })
  }
  return r
}
function importValue (v, calendar, minYear, maxYear) {
  if (Object.prototype.toString.call(v) === '[object Date]') {
    // load datetime
    ctx.value = createDateContext()
    ctx.value.date = new Date(v)

  } else if (v === null) {
    // no value
    ctx.value = createDateContext()
    if (props.initToday) ctx.value.date = new Date()

  } else if (typeof v === 'object') {
    // load ctx
    ctx.value = v

  } else if (typeof v === 'string') {
    // load isostring
    ctx.value = createDateContext()
    ctx.value.date = new Date(v)

  } else if (typeof v === 'number') {
    // load timestamp
    ctx.value = createDateContext()
    ctx.value.date = new Date(v)

  }
  if (ctx.value.date !== null) {
    const parts = formatToParts(intlDate, ctx.value.date)
    Object.keys(ctx.value).forEach((k) => {
      if (typeof parts[k] === 'undefined') return
      ctx.value[k] = parts[k]
    })
  }
  const canUpdateTree = (
    ctx.value.date !== null &&
      (
      tree.value == null ||
      minYear !== props.minYear ||
      maxYear !== props.maxYear ||
      calendar !== calendar_.value
    )
  )
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (ctx.value.date !== null) {
        if (canUpdateTree) {
          tree.value = generateTree(calendar, minYear, maxYear)
        }
        updateYears()
        updateMonths()
        updateDays()
      } else {
        tree.value = null
      }
      resolve(true)
    }, 0)
  })
}
function getLabel (v) {
  return props.locale.datetime[v]
}
function updateYears () {
  listItems.value.year = getYears(tree.value, ctx.value.minYear, props.maxYear)
  adjustField('year')
}
function updateMonths () {
  listItems.value.month = getMonths(tree.value, ctx.value.year, props.maxMonthsInYear)
  adjustField('month')
}
function updateDays () {
  listItems.value.day = getDays(tree.value, ctx.value.year, ctx.value.month, props.maxDaysInMonth)
  adjustField('day')
}
const setField = debounce(function (k, v) {
  if (ctx.value[k] === v.value) return
  ctx.value[k] = v.value
  if (ctx.value.date) {
    switch(k) {
      case 'year':
        updateMonths()
        updateDays()
        break
      case 'month':
        updateDays()
        break
    }
    const day = tree.value[ctx.value.year][ctx.value.month - 1][ctx.value.day - 1]
    ctx.value.date = new Date(
      day[0],
      day[1],
      day[2],
      ctx.value.hour,
      ctx.value.minute,
      ctx.value.second
    )
  }
}, 200)
function adjustField (name) {
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

// lifecycle
onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      const el = rootEl.value.querySelector('.selector-list')
      scrollbarWidth.value = el ? el.offsetWidth - el.clientWidth : 24
    }, 0)
  })
})
onBeforeUnmount(() =>{
  intlDate = null
})

// created
createIntl(props.calendar)
importValue(props.modelValue, props.calendar, props.minYear, props.maxYear)
listItems.value = {
  year: getYears(tree.value, props.minYear, props.maxYear),
  month: getMonths(tree.value, ctx.value.year, props.maxMonthsInYear),
  day: getDays(tree.value, ctx.value.year, ctx.value.month, props.maxDaysInMonth),
  hour: new Array(24).fill(0).map((v, k) => { return { text: k, value: k } }),
  minute: new Array(60).fill(0).map((v, k) => { return { text: k, value: k } }),
  second: new Array(60).fill(0).map((v, k) => { return { text: k, value: k } }),
}
applyFilter('hour')
applyFilter('minute')
applyFilter('second')
</script>


<template>
  <div ref="rootEl" class="vue-datewheel" :style="styles">
    <div v-for="(cols, idx) in layout" :key="idx" class="vdw-row">
      <div v-for="col in cols" :key="col" class="vdw-col">
        <selector
          :modelValue="ctx[col]"
          :items="listItems[col]"
          :label="getLabel(col)"
          :item-height="itemHeight"
          :class="{'time-list': ['hour', 'minute', 'second'].includes(col)}"
          @update:model-value="setField(col, $event)"
        />
      </div>
    </div>
  </div>
</template>