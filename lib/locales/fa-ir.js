// https://github.com/unicode-org/icu/blob/f374427f6018056a6643c6519bbfadf869755ae0/icu4c/source/data/locales/fa.txt

const gregoryMonthNames = [
  "ژانویه",
  "فوریه",
  "مارس",
  "آوریل",
  "مه",
  "ژوئن",
  "ژوئیه",
  "اوت",
  "سپتامبر",
  "اکتبر",
  "نوامبر",
  "دسامبر",
]

export default {
  datetime: {
    year: 'سال',
    month: 'ماه',
    day: 'روز',
    hour: 'ساعت',
    minute: 'دقیقه',
    second: 'ثانیه',
  },
  calendar: {
    gregory: {
      monthNames: gregoryMonthNames
    },
    persian: {
      monthNames: [
        "فروردین",
        "اردیبهشت",
        "خرداد",
        "تیر",
        "مرداد",
        "شهریور",
        "مهر",
        "آبان",
        "آذر",
        "دی",
        "بهمن",
        "اسفند",
      ]
    },
  }
}
