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

function generateTree (calendar, fromYear, toYear) {
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
  function formatToParts (d) {
    const r = {}
    intl.formatToParts(d).forEach(v => {
      r[v.type] = parseInt(v.value)
    })
    return r
  }
  function initDay (p, date) {
    return {
      text: p.day,
      value: p.day,
      ts: date.getTime()
    }
  }
  function initMonth (p, date) {
    return {
      text: p.month,
      value: p.month,
      days: [initDay(p, date)]
    }
  }
  function initYear (p, date) {
    return {
      text: p.year,
      value: p.year,
      months: [ initMonth(p, date) ]
    }
  }
  const now = new Date()
  const nowp = formatToParts(now)
  let date = new Date(now)
  let p = formatToParts(date)
  const pastYears = [initYear(p, date)]
  while (p.year >= fromYear) {
    date.setDate(date.getDate() - 1)
    const newp = formatToParts(date)
    if (newp.year < fromYear || newp.year === nowp.year) break
    if (newp.year === p.year) {
      const year = pastYears[pastYears.length - 1]
      if (newp.month === p.month) {
        year.months[year.months.length - 1].days.push(initDay(newp, date))
      } else {
        year.months[year.months.length - 1].days.reverse()
        year.months.push(initMonth(newp, date))
      }
    } else {
      pastYears[pastYears.length - 1].months.reverse()
      pastYears.push(initYear(newp, date))
    }
    p = newp
  }
  const latestyear = pastYears[pastYears.length - 1]
  latestyear.months[latestyear.months.length - 1].days.reverse()
  latestyear.months.reverse()
  pastYears.reverse()

  // next years
  date = new Date(now)
  date.setDate(date.getDate() + 1)
  p = formatToParts(date)
  const nextYears = [initYear(p, date)]
  while (p.year < toYear) {
    date.setDate(date.getDate() + 1)
    const newp = formatToParts(date)
    if (newp.year >= toYear) break
    if (newp.year === p.year) {
      const year = nextYears[nextYears.length - 1]
      if (newp.month === p.month) {
        year.months[year.months.length - 1].days.push(initDay(newp, date))
      } else {
        year.months.push(initMonth(newp, date))
      }
    } else {
      nextYears.push(initYear(newp, date))
    }
    p = newp
  }

  return [...pastYears, ...nextYears]
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
    }
  },
  data () {
    const initialData = {
      scrollbarWidth: 0,
    }
    this.importValue(initialData, this.value, this.calendar)
    initialData.listItems = {
      year: this.getYears(this.minYear, this.maxYear),
      month: this.getMonths(initialData.ctx.date, this.maxMonthsInYear),
      day: this.getDays(initialData.ctx.date, this.maxDaysInMonth),
      hour: [],
      minute: [],
      seconds: []
    }
    return initialData
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
  },
  watch: {
    calendar (newVal, oldVal) {
      console.log('new calendar')
      if (newVal === oldVal) return
      this.importValue(this, this.value, newVal)
    },
    value (newVal, oldVal) {
      console.log('new value')
      this.importValue(this, this.value, newVal)
    }
  },
  mounted () {
    this.$nextTick(() => {
      setTimeout(() => {
        const el = this.$el.querySelector('.selector-list')
        this.scrollbarWidth = el ? el.offsetWidth - el.clientWidth : 24
      }, 0)
    })
    console.log(generateTree('persian', 1374, 1420))
    // this.importValue(this, this.value, this.calendar)
  },
  beforeDestroy () {
    delete this._intlDate
  },
  methods: {
    getYearBegin (lYear) {
      const d = new Date()
    },
    generateYearTree (lYear) {

    },
    getYearLength (date) {
      const d = new Date(date)
      let p = this.formatToParts(d)
      const initialYear = p.year
      while (true) {
        d.setMonth(d.getMonth() + 1)
        const np = this.formatToParts(d)
        if (np.year !== initialYear) return p.month
        p = np
      }
    },
    getMonthLength (date) {
      const d = new Date(date)
      let p = this.formatToParts(d)
      const initialMonth = p.month
      while (true) {
        d.setDate(d.getDate() + 1)
        const np = this.formatToParts(d)
        // console.log(np, p, 'getMonthLength')
        if (np.month !== initialMonth) return p.day
        p = np
      }
    },
    getYears (minYear, maxYear) {
      const r = []
      const d = new Date(maxYear, 0, 1)
      const lMaxYear = this.formatToParts(d).year
      for (let i = 0; i < maxYear - minYear; i++) {
        const y = lMaxYear - i
        d.setFullYear(d.getFullYear() - 1)
        r.push({ text: y, value: y, date: new Date(d) })
      }
      return r
    },
    getMonths (date, maxMonthsInYear) {
      const r = []
      if (date !== null) {
        const p = this.formatToParts(date)
        for (let i = 1; i <= this.getYearLength(date); i++) {
          const d = new Date(date)
          d.setMonth(d.getMonth() + (i - p.month))
          r.push({
            text: this.locale.calendar[this.calendar].monthNames[i],
            value: i,
            date: d
          })
        }
      } else {
        for (let i = 1; i <= maxMonthsInYear; i++) {
          r.push({ text: i, value: i, date: null })
        }
      }
      return r
    },
    getDays (date, maxDaysInMonth) {
      const r = []
      if (date !== null) {
        const p = this.formatToParts(date)
        const monthlength = this.getMonthLength(date)
        // console.log(p, monthlength, '<<getdays')
        for (let i = 1; i <= monthlength; i++) {
          const d = new Date(date)
          d.setDate(d.getDate() + (i - p.day))
          r.push({ text: i, value: i, date: d })
        }
      } else {
        for (let i = 1; i <= maxDaysInMonth; i++) {
          r.push({ text: i, value: i, date: null })
        }
      }
      return r
    },
    formatToParts (d) {
      const r = {}
      this._intlDate.formatToParts(d).forEach(v => {
        r[v.type] = isNaN(v.value) ? v.value : parseInt(v.value)
      })
      return r
    },
    importValue (self, v, calendar) {
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
      self.timezone = {
        name: this._intlDate.resolvedOptions().timeZone,
        value: new Date().getTimezoneOffset()
      }

      if (self.ctx.date !== null) {
        const parts = this.formatToParts(self.ctx.date)
        Object.keys(self.ctx).forEach((k) => {
          if (typeof parts[k] === 'undefined') return
          self.ctx[k] = parts[k]
        })
      }
    },
    getLabel (v) {
      return this.locale.datetime[v]
    },
    updateYears () {
      this.listItems.year = this.getYears(this.minYear, this.maxYear)
    },
    updateMonths () {
      this.listItems.month = this.getMonths(this.ctx.date, this.maxMonthsInYear)
    },
    updateDays () {
      this.listItems.day = this.getDays(this.ctx.date, this.maxDaysInMonth)
    },
    setField: debounce(function (k, v) {
      if (this.ctx[k] === v.value) return
      this.ctx[k] = v.value
      if (k === 'year' && v.date) {
        this.ctx.date = new Date(
          v.date.getFullYear(),
          this.ctx.date.getMonth(),
          this.ctx.date.getDate(),
          this.ctx.date.getHours(),
          this.ctx.date.getMinutes(),
          this.ctx.date.getSeconds(),
        )
        this.updateMonths()
        this.updateDays()
      } else if (k === 'month' && v.date) {
        this.ctx.date = new Date(
          v.date.getFullYear(),
          v.date.getMonth(),
          this.ctx.date.getDate(),
          this.ctx.date.getHours(),
          this.ctx.date.getMinutes(),
          this.ctx.date.getSeconds(),
        )
        // console.log('setfield month', v.date.getFullYear(),
        //   v.date.getMonth(),)
        this.updateDays()
      } else if (k === 'day' && v.date) {
        this.ctx.date = new Date(
          v.date.getFullYear(),
          v.date.getMonth(),
          v.date.getDate(),
          this.ctx.date.getHours(),
          this.ctx.date.getMinutes(),
          this.ctx.date.getSeconds(),
        )
      }
    }, 200),
    setValue (ts) {
      const dt = new Date(ts)
      const { year, month, day } = this._calendar.fromDate(dt)
      this.year = year
      this.month = month
      this.day = day
      this.hour = dt.getHours()
      this.minute = dt.getMinutes()
      this.second = dt.getSeconds()
      this.setYears()
      this.setMonths()
      this.setDays()
      this.setHours()
      this.setMinutes()
      this.setSeconds()
      this.value = this.exportValue(
        this.year, this.month, this.day,
        this.hour, this.minute, this.second
      )
    },
    selectNow () {
      this.setValue(new Date().getTime())
    },
    updateField (name, item) {
      const oldValue = this[name]
      const newValue = item.value
      if (oldValue === newValue) return
      this[name] = item.value
      this.selectedItem = { ...item }
      switch (name) {
        case 'year':
          this.setMonths()
          this.setDays()
          this.setHours()
          this.setMinutes()
          this.setSeconds()
          break
        case 'month':
          this.setDays()
          this.setHours()
          this.setMinutes()
          this.setSeconds()
          break
        case 'day':
          this.setHours()
          this.setMinutes()
          this.setSeconds()
          break
        case 'hour':
          this.setMinutes()
          this.setSeconds()
          break
        case 'minute':
          this.setSeconds()
          break
      }
      this.value = this.exportValue(
        this.year, this.month, this.day,
        this.hour, this.minute, this.second
      )
    },
    adjustField (name, items, itemsMap) {
      if (items.length === 0) return
      const lastItem = items[items.length - 1]
      const value = this[name]
      if (value > lastItem.value) {
        this[name] = lastItem.value
      } else if (value < items[0].value) {
        this[name] = items[0].value
      } else if (typeof itemsMap[value] === 'undefined') {
        this[name] = items[0].value
      }
    },
    adjustAll () {
      this.adjustField('year', this.years, this.yearsMap)
      this.adjustField('month', this.months, this.monthsMap)
      this.adjustField('day', this.days, this.daysMap)
      this.adjustField('hour', this.hours, this.hoursMap)
      this.adjustField('minute', this.minutes, this.minutesMap)
      this.adjustField('second', this.seconds, this.secondsMap)
    },
    exportValue (year, month, day, hour, minute, second) {
      const dt = this._calendar.toDate(year, month, day)
      dt.setHours(hour)
      dt.setMinutes(minute)
      dt.setSeconds(second)
      return dt.getTime()
    },
    setYears () {
      const items = this._calendar
        .getYears()
        .filter((v) => {
          const ts = this.exportValue(
            v.value, 1, 1,
            0, 0, 0
          )
          return this.filterYear({ ...v, ts })
        })
      this.yearsMap = arrToObj(items)
      this.years = items
      this.adjustField('year', this.years, this.yearsMap)
    },
    setMonths () {
      const items = this._calendar
        .getMonths(this.year)
        .filter((v) => {
          const ts = this.exportValue(
            this.year, v.value, 1,
            0, 0, 0
          )
          return this.filterMonth({ ...v, ts })
        })
      this.monthsMap = arrToObj(items)
      this.months = items
      this.adjustField('month', items, this.monthsMap)
    },
    setDays () {
      const items = this._calendar
        .getDays(this.year, this.month)
        .filter((v) => {
          const ts = this.exportValue(
            this.year, this.month, v.value,
            0, 0, 0
          )
          return this.filterDay({ ...v, ts })
        })
      this.daysMap = arrToObj(items)
      this.days = items
      this.adjustField('day', items, this.daysMap)
    },
    setHours () {
      const items = this._calendar
        .getHours()
        .filter(v => this.filterHour({
          ...v,
          ts: this.exportValue(
            this.year, this.month, this.day,
            v.value, 0, 0
          )
        }))
      this.hoursMap = arrToObj(items)
      this.hours = items
      this.adjustField('hour', items, this.hoursMap)
    },
    setMinutes () {
      const items = this._calendar
        .getMinutes()
        .filter(v => this.filterMinute({
          ...v,
          ts: this.exportValue(
            this.year, this.month, this.day,
            this.hour, v.value, 0
          ),
          hour: this.hour,
          minute: v.value,
          second: 0
        }))
      this.minutesMap = arrToObj(items)
      this.minutes = items
      this.adjustField('minute', items, this.minutesMap)
    },
    setSeconds () {
      const items = this._calendar
        .getSeconds()
        .filter(v => this.filterSecond({
          ...v,
          ts: this.exportValue(
            this.year, this.month, this.day,
            this.hour, this.minute, v.value
          ),
          hour: this.hour,
          minute: this.minute,
          second: v.value
        }))
      this.secondsMap = arrToObj(items)
      this.seconds = items
      this.adjustField('second', items, this.secondsMap)
    },
    canShowField (name) {
      if (this.ignoreSingleItem && this[name + 's'].length === 1) return
      if (name === 'second' && this.hideSecond) return
      return true
    }
  }
}
</script>
