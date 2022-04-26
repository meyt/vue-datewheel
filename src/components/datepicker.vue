<template>
  <div class="vue-datewheel" :style="styles">
    <div v-for="(cols, idx) in layout" :key="idx" class="vdw-row">
      <div v-for="col in cols" :key="col" class="vdw-col">
        <selector
          :value="ctx[col]"
          :items="listItems[col]"
          :label="getLabel(col)"
          :item-height="itemHeight"
          :class="{'time-list': ['hour', 'minute', 'second'].includes(col)}"
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

export default {
  components: {
    selector
  },
  props: {
    value: {
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
  },
  data () {
    return {
      scrollbarWidth: 0,
      ctx: createDateContext(),
      calendar_: this.calendar,
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
    this.importValue(this, this.value, this.calendar, this.minYear, this.maxYear)
    this.listItems = {
      year: this.getYears(this.tree, this.minYear, this.maxYear),
      month: this.getMonths(this.tree, this.ctx.year, this.maxMonthsInYear),
      day: this.getDays(this.tree, this.ctx.year, this.ctx.month, this.maxDaysInMonth),
      hour: new Array(24).fill(0).map((v, k) => { return { text: k, value: k } }),
      minute: new Array(60).fill(0).map((v, k) => { return { text: k, value: k } }),
      second: new Array(60).fill(0).map((v, k) => { return { text: k, value: k } }),
    }
    this.applyFilter('hour')
    this.applyFilter('minute')
    this.applyFilter('second')
  },
  computed: {
    styles () {
      return {
        '--scrollbar-width': this.scrollbarWidth + 'px',
        '--item-height': this.itemHeight + 'px',
      }
    }
  },
  watch: {
    calendar (newVal, oldVal) {
      if (newVal === oldVal) return
      this.createIntl(newVal)
      this.importValue(this, this.value, newVal, this.minYear, this.maxYear)
      this.calendar_ = newVal
    },
    value: {
      deep: true,
      handler (newVal, oldVal) {
        if (newVal !== null) {
          const ctx = this.ctx
          if (
            typeof newVal === 'object' && (
              typeof ctx !== 'object' ||
              ctx === null ||
              (
                newVal.date &&
                ctx.date &&
                newVal.date.getTime() !== ctx.date.getTime()
              ) ||
              newVal.year !== ctx.year ||
              newVal.month !== ctx.month ||
              newVal.day !== ctx.day ||
              newVal.hour !== ctx.hour ||
              newVal.minute !== ctx.minute ||
              newVal.second !== ctx.second
            )
          ) {
            this.importValue(this, newVal, this.calendar, this.minYear, this.maxYear)
          }
        }
      }
    },
    ctx: {
      deep: true,
      handler (newVal) {
        this.$emit('input', {...newVal})
      }
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
    applyFilter(fieldName) {
      const filter = this['filter' + fieldName[0].toUpperCase() + fieldName.substring(1)]
      if (filter === null) return
      this.listItems[fieldName] = this.listItems[fieldName].filter(filter)
    },
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
    getYears (tree, minYear, maxYear) {
      if (tree) return Object.keys(tree).sort((a, b) => a - b).map((k) => {
        k = parseInt(k)
        return { text: k, value: k }
      })
      const r = []
      for (let i = minYear; i < maxYear; i++) {
        r.push({ text: i, value: i })
      }
      return r
    },
    getMonths (tree, year, maxMonthsInYear) {
      if (tree && year && typeof tree[year] !== 'undefined') {
        return tree[year].filter(el => el != null).map((v, k) => {
          return {
            text: this.locale.calendar[this.calendar].monthNames[k],
            value: k + 1
          }
        })
      }
      const r = []
      for (let i = 0; i < maxMonthsInYear; i++) {
        r.push({
          text: this.locale.calendar[this.calendar].monthNames[i],
          value: i + 1,
        })
      }
      return r
    },
    getDays (tree, year, month, maxDaysInMonth) {
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
    },
    importValue (self, v, calendar, minYear, maxYear) {
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
      }
      const canUpdateTree = (
        self.ctx.date !== null &&
          (
          this.tree == null ||
          minYear !== this.minYear ||
          maxYear !== this.maxYear ||
          calendar !== this.calendar_
        )
      )
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (self.ctx.date !== null) {
            if (canUpdateTree) {
              this.tree = generateTree(calendar, minYear, maxYear)
            }
            this.updateYears()
            this.updateMonths()
            this.updateDays()
          } else {
            this.tree = null
          }
          resolve(true)
        }, 0)
      })
    },
    getLabel (v) {
      return this.locale.datetime[v]
    },
    updateYears () {
      this.listItems.year = this.getYears(this.tree, this.minYear, this.maxYear)
      this.adjustField('year')
    },
    updateMonths () {
      this.listItems.month = this.getMonths(this.tree, this.ctx.year, this.maxMonthsInYear)
      this.adjustField('month')
    },
    updateDays () {
      this.listItems.day = this.getDays(this.tree, this.ctx.year, this.ctx.month, this.maxDaysInMonth)
      this.adjustField('day')
    },
    setField: debounce(function (k, v) {
      if (this.ctx[k] === v.value) return
      this.ctx[k] = v.value
      if (this.ctx.date) {
        switch(k) {
          case 'year':
            this.updateMonths()
            this.updateDays()
            break
          case 'month':
            this.updateDays()
            break
        }
        const day = this.tree[this.ctx.year][this.ctx.month - 1][this.ctx.day - 1]
        this.ctx.date = new Date(day[0], day[1], day[2])
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
    }
  }
}
</script>
