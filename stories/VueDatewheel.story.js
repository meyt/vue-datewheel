import VueDatewheel from '../lib/components/datepicker.vue'
import faLocale from '../lib/locales/fa-ir'
import enLocale from '../lib/locales/en-us'
import '../lib/assets/style.scss'
import { fn } from '@storybook/test'

const locales = { faLocale, enLocale }
const calendars = [
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
export default {
  title: 'vue-datewheel',
  component: VueDatewheel,
  argTypes: {
    initToday: {
      control: 'boolean'
    },
    calendar: {
      options: calendars,
      control: 'select'
    },
    locale: {
      options: Object.keys(locales),
      mapping: locales,
      control: {
        type: 'select',
        labels: {
          faLocale: 'fa-IR',
          enLocale: 'en-US',
        },
      },
    },
  },
  render: (args) => ({
    components: { VueDatewheel },
    setup() {
      return { args };
    },
    template: '<VueDatewheel v-bind="args"/>',
  }),
  args: {
    "onUpdate:modelValue": fn()
  }
}

export const Basic = {
  args: {},
}

export const InitToday = {
  args: {
    initToday: true
  },
}

export const CustomCalendar = {
  args: {
    calendar: 'persian'
  },
}


export const CustomLocale = {
  args: {
    locale: faLocale
  },
}

export const DateValue = {
  args: {
    modelValue: new Date(2020, 1, 1)
  },
}

export const TimestampValue = {
  args: {
    modelValue: 1577836800000
  },
}

export const ISO8601Value = {
  args: {
    modelValue: "2020-01-01T00:00:00Z"
  },
}

export const ContextValue = {
  args: {
    modelValue: { date: null, year: 2020, month: 1, day: 1, hour: 0, minute: 0, second: 0 }
  },
}

export const MinMaxYear = {
  args: {
    minYear: '2010',
    maxYear: '2020',
  },
}
