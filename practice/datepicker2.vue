<template>
  <div class="vue-datewheel" :style="styles">
    <div v-for="(cols, idx) in layout" :key="idx" class="vdw-row">
      <div v-for="col in cols" :key="col" class="vdw-col">
        <selector
          :value="ctx[col]"
          :items="listItems[col]"
          :label="getLabel(col)"
          :item-height="itemHeight"
          @input="setField(col, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import enLocale from '../locales/en-us'
import selector from './selector.vue'
import debounce from '../helpers/debounce'

function arrToObj (arr) {
  const res = {}
  arr.forEach((v) => {
    res[v.value] = v
  })
  return res
}

function getOptions () {
  const toTs = new Date()
  toTs.setDate(toTs.getDate() + 365)
  return {
    value: new Date().getTime(),
    fromTs: new Date('Jan 01 1970 00:00:00 UTC').getTime(),
    toTs: toTs.getTime(),
    title: null,
    hideSecond: false,
    hideTimezone: false,
    itemHeight: 35,
    calendar: 'persian',
    isVisible: false,
    timezone: null,
    ignoreSingleItem: false,
    hidePreview: false,
    showNowBtn: false
  }
}

function getFilters () {
  function dummyFilter (v) { return true }
  return {
    filterYear: dummyFilter,
    filterMonth: dummyFilter,
    filterDay: dummyFilter,
    filterHour: dummyFilter,
    filterMinute: dummyFilter,
    filterSecond: dummyFilter,
  }
}

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
  const ts = d.getTime()
  if (typeof window.__vdwCachedTimePart === 'undefined') {
    window.__vdwCachedTimePart = {}
  }
  const cache = window.__vdwCachedTimePart[ts]
  if (typeof cache !== 'undefined') return cache
  const r = {}
  intl.formatToParts(d).forEach(v => {
    r[v.type] = parseInt(v.value)
  })
  window.__vdwCachedTimePart[ts] = r
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
      res[p.year] = { text: p.year, value: p.year, months: {} }
    }
    if (typeof res[p.year].months[p.month] === 'undefined') {
      res[p.year].months[p.month] = { text: p.month, value: p.month, days: {} }
    }
    if (typeof res[p.year].months[p.month].days[p.day] === 'undefined') {
      res[p.year].months[p.month].days[p.day] = { text: p.day, value: p.day, ts: date.getTime() }
    }
  }
  const now = new Date()

  // past
  let date = new Date(now)
  let p = formatToParts(intl, date)
  setDay(p, date)
  while (p.year >= fromYear) {
    date.setDate(date.getDate() - 1)
    p = formatToParts(intl, date)
    if (p.year < fromYear) break
    setDay(p, date)
  }

  // future
  date = new Date(now)
  while (p.year < toYear) {
    date.setDate(date.getDate() + 1)
    p = formatToParts(intl, date)
    if (p.year >= toYear) break
    setDay(p, date)
  }
  return res
}

export default {
  components: {
    selector
  },
  props: {
    value: {
      type: [Object, Date, String],
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
      default: null
    },
    maxYear: {
      type: Number,
      default: null
    },
    maxDaysInMonth: {
      type: Number,
      default: 31
    },
    maxMonthsInYear: {
      type: Number,
      default: 12
    }
  },
  data () {
    return {
      scrollbarWidth: 0,
      listItems: {
        year: [],
        month: [],
        day: [],
        hour: [],
        minute: [],
        seconds: []
      },
      tree: null
    }
  },
  created () {
    this.createIntl(this.calendar)
    this.importValue(this, this.value, this.calendar, this.fromYear, this.toYear)
    this.listItems = {
      year: this.getYears(this.tree, this.fromYear, this.toYear),
      month: this.getMonths(this.tree, this.ctx.year, this.maxMonthsInYear),
      day: this.getDays(this.tree, this.ctx.year, this.ctx.month, this.maxDaysInMonth),
      hour: [],
      minute: [],
      seconds: []
    }
  },
  computed: {
    styles () {
      return {
        '--scrollbar-width': this.scrollbarWidth + 'px',
        '--item-height': this.itemHeight + 'px',
      }
    },
    hours () { return [] },
    minutes () { return [] },
    seconds () { return [] },
    fromYear () {
      if (this.minYear === null) {
        const d = new Date()
        d.setFullYear(d.getFullYear() - 100)
        const p = formatToParts(this._intlDate, d)
        return p.year
      }
      return this.minYear
    },
    toYear () {
      if (this.maxYear === null) {
        const d = new Date()
        d.setFullYear(d.getFullYear() + 100)
        const p = formatToParts(this._intlDate, d)
        return p.year
      }
      return this.maxYear
    }
  },
  watch: {
    calendar (newVal, oldVal) {
      if (newVal === oldVal) return
      this.createIntl(newVal)
      this.importValue(this, this.value, newVal, this.fromYear, this.toYear)
      this.updateYears()
      this.updateMonths()
      this.updateDays()
    },
    value (newVal, oldVal) {
      this.importValue(this, newVal, this.calendar, this.fromYear, this.toYear)
    }
  },
  mounted () {
    this.$nextTick(() => {
      setTimeout(() => {
        const el = this.$el.querySelector('.selector-list')
        this.scrollbarWidth = el ? el.offsetWidth - el.clientWidth : 24
      }, 0)
    })
  },
  beforeDestroy () {
    delete this._intlDate
  },
  methods: {
    createIntl (calendar) {
      this._intlDate = new Intl.DateTimeFormat('en-US', {
        hour12: false,
        calendar,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
    },
    getYears (tree, fromYear, toYear) {
      if (tree) return Object.keys(tree).sort((a, b) => a - b).map(k => tree[k])
      const r = []
      for (let i = fromYear; i < toYear; i++) {
        r.push({ text: y, value: y })
      }
      return r
    },
    getMonths (tree, year, maxMonthsInYear) {
      if (tree && year) return Object.keys(tree[year].months).sort((a, b) => a - b).map((k) => {
        const m = tree[year].months[k]
        m.text = this.locale.calendar[this.calendar].monthNames[m.value]
        return m
      })
      const r = []
      for (let i = 1; i <= maxMonthsInYear; i++) {
        r.push({
          text: this.locale.calendar[this.calendar].monthNames[i],
          value: i,
        })
      }
      return r
    },
    getDays (tree, year, month, maxDaysInMonth) {
      if (tree && year && month) return Object.keys(tree[year].months[month].days).sort((a, b) => a - b).map((k) => {
        return tree[year].months[month].days[k]
      })
      const r = []
      for (let i = 1; i <= maxDaysInMonth; i++) {
        r.push({ text: i, value: i, date: null })
      }
      return r
    },
    importValue (self, v, calendar, fromYear, toYear) {
      if (Object.prototype.toString.call(v) === '[object Date]') {
        // load datetime
        self.ctx = createDateContext()
        self.ctx.date = new Date(v)
        self.inputType = 'date'

      } else if (v === null) {
        // no value
        self.ctx = createDateContext()
        if (this.initToday) self.ctx.date = new Date()
        self.inputType = 'iso'

      } else if (typeof v === 'object') {
        // load ctx
        self.ctx = v
        self.inputType = 'context'

      } else if (typeof v === 'string') {
        // load isostring
        self.ctx = createDateContext()
        self.ctx.date = new Date(v)
        self.inputType = 'iso'

      } else if (typeof v === 'number') {
        // load timestamp
        self.ctx = createDateContext()
        self.ctx.date = new Date(v)
        self.inputType = 'timestamp'

      }

      self.timezone = {
        name: this._intlDate.resolvedOptions().timeZone,
        value: new Date().getTimezoneOffset()
      }

      if (self.ctx.date !== null) {
        const parts = formatToParts(this._intlDate, self.ctx.date)
        Object.keys(self.ctx).forEach((k) => {
          if (typeof parts[k] === 'undefined') return
          self.ctx[k] = parts[k]
        })
        this.tree = generateTree(calendar, fromYear, toYear)
      } else {
        this.tree = null
      }
    },
    getLabel (v) {
      return this.locale.datetime[v]
    },
    updateYears () {
      this.listItems.year = this.getYears(this.tree, this.fromYear, this.toYear)
    },
    updateMonths () {
      this.listItems.month = this.getMonths(this.tree, this.ctx.year, this.maxMonthsInYear)
    },
    updateDays () {
      this.listItems.day = this.getDays(this.tree, this.ctx.year, this.ctx.month, this.maxDaysInMonth)
    },
    setField: debounce(function (k, v) {
      if (this.ctx[k] === v.value) return
      this.ctx[k] = v.value
      if (this.ctx.date) {
        switch(k) {
          case 'year':
            this.updateMonths()
            this.updateDays()
            this.adjustField('month')
            this.adjustField('day')
            break
          case 'month':
            this.updateDays()
            this.adjustField('day')
            break
        }
        this.ctx.date = new Date(
          this.tree[this.ctx.year].months[this.ctx.month].days[this.ctx.day].ts
        )
      }
    }, 200),
    adjustField (name) {
      const items = this.listItems[name]
      if (items.length === 0) return
      const lastItem = items[items.length - 1]
      const value = this.ctx[name]
      if (value > lastItem.value) {
        this.ctx[name] = lastItem.value
      } else if (value < items[0].value) {
        this.ctx[name] = items[0].value
      } else if (typeof items.find(o => o.value === value) === 'undefined') {
        this.ctx[name] = items[0].value
      }
    },
    exportValue (year, month, day, hour, minute, second) {
      const dt = this._calendar.toDate(year, month, day)
      dt.setHours(hour)
      dt.setMinutes(minute)
      dt.setSeconds(second)
      return dt.getTime()
    }
  }
}
</script>
