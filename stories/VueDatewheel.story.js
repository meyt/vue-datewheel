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
    modelValue: { control: 'date' },
    min: { control: 'date' },
    max: { control: 'date' },
    layout: { control: 'object' },
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
  },
  parameters: {
    controls: {
      exclude: ['filterDate', 'filterTime']
    }
  }
}

export const Basic = {
  args: {},
}

export const Calendar = {
  args: {
    calendar: 'persian'
  },
}


export const Locale = {
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
  argTypes: {
    modelValue: { control: 'number' },
  },
  args: {
    modelValue: 1577836800000
  },
}

export const ISO8601Value = {
  argTypes: {
    modelValue: { control: 'text' },
  },
  args: {
    modelValue: "2020-01-01T00:00:00Z"
  },
}

export const ContextValue = {
  argTypes: {
    modelValue: { control: 'object' },
  },
  args: {
    modelValue: { date: new Date(2020, 1, 1), year: 2020, month: 1, day: 1, hour: 0, minute: 0, second: 0 }
  },
}

export const ContextNoDateValue = {
  argTypes: {
    modelValue: { control: 'object' },
  },
  args: {
    modelValue: { date: null, year: 2020, month: 1, day: 1, hour: 0, minute: 0, second: 0 }
  },
}

export const CalendarContextValue = {
  name: 'Calendar + Context Value',
  argTypes: {
    modelValue: { control: 'object' },
  },
  args: {
    calendar: 'persian',
    modelValue: { date: null, year: 1380, month: 2, day: 3, hour: 0, minute: 0, second: 0 }
  },
}

export const MinMax = {
  args: {
    min: new Date(2010, 5, 5, 13, 12, 11),
    max: new Date(2020, 10, 10, 9, 8, 7),
  },
}

export const Layout = {
  args: {
    layout: [
      ['year', 'month', 'day'],
    ]
  },
}
