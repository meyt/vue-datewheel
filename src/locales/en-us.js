// https://github.com/unicode-org/icu/blob/f374427f6018056a6643c6519bbfadf869755ae0/icu4c/source/data/locales/root.txt

const gregoryMonthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const islamicMonthNames = [
  "Muharram",
  "Safar",
  "Rabiʻ I",
  "Rabiʻ II",
  "Jumada I",
  "Jumada II",
  "Rajab",
  "Shaʻban",
  "Ramadan",
  "Shawwal",
  "Dhuʻl-Qiʻdah",
  "Dhuʻl-Hijjah",
]
const chineseMonthNames = [
  "M01",
  "M02",
  "M03",
  "M04",
  "M05",
  "M06",
  "M07",
  "M08",
  "M09",
  "M10",
  "M11",
  "M12",
]
const ethiopicMonthNames = [
  "Meskerem",
  "Tekemt",
  "Hedar",
  "Tahsas",
  "Ter",
  "Yekatit",
  "Megabit",
  "Miazia",
  "Genbot",
  "Sene",
  "Hamle",
  "Nehasse",
  "Pagumen",
]
export default {
  datetime: {
    year: 'Year',
    month: 'Month',
    day: 'Day',
    hour: 'Hour',
    minute: 'Minute',
    second: 'Second',
  },
  calendar: {
    gregory: {
      monthNames: gregoryMonthNames
    },
    persian: {
      monthNames: [
        'Farvardin',
        'Ordibehesht',
        'Khordad',
        'Tir',
        'Mordad',
        'Shahrivar',
        'Mehr',
        'Aban',
        'Azar',
        'Dey',
        'Bahman',
        'Esfand'
      ]
    },
    islamic: {
      monthNames: [
        "Muharram",
        "Safar",
        "Rabiʻ I",
        "Rabiʻ II",
        "Jumada I",
        "Jumada II",
        "Rajab",
        "Shaʻban",
        "Ramadan",
        "Shawwal",
        "Dhuʻl-Qiʻdah",
        "Dhuʻl-Hijjah",
      ]
    },
    islamic: {
      monthNames: islamicMonthNames
    },
    'islamic-civil': {
      monthNames: islamicMonthNames
    },
    'islamic-rgsa': {
      monthNames: islamicMonthNames
    },
    'islamic-tbla': {
      monthNames: islamicMonthNames
    },
    'islamic-umalqura': {
      monthNames: islamicMonthNames
    },
    japanese: {
      monthNames: gregoryMonthNames
    },
    roc: {
      monthNames: gregoryMonthNames
    },
    buddhist: {
      monthNames: gregoryMonthNames
    },
    coptic: {
      monthNames: [
        "Tout",
        "Baba",
        "Hator",
        "Kiahk",
        "Toba",
        "Amshir",
        "Baramhat",
        "Baramouda",
        "Bashans",
        "Paona",
        "Epep",
        "Mesra",
        "Nasie",
      ]
    },
    chinese: {
      monthNames: chineseMonthNames
    },
    dangi: {
      monthNames: chineseMonthNames
    },
    ethiopic: {
      monthNames: ethiopicMonthNames
    },
    ethioaa: {
      monthNames: ethiopicMonthNames
    },
    hebrew: {
      monthNames: [
        "Tishri",
        "Heshvan",
        "Kislev",
        "Tevet",
        "Shevat",
        "Adar I",
        "Adar",
        "Nisan",
        "Iyar",
        "Sivan",
        "Tamuz",
        "Av",
        "Elul",
        "Adar II",
      ]
    },
    indian: {
      monthNames: [
        "Chaitra",
        "Vaisakha",
        "Jyaistha",
        "Asadha",
        "Sravana",
        "Bhadra",
        "Asvina",
        "Kartika",
        "Agrahayana",
        "Pausa",
        "Magha",
        "Phalguna",
      ]
    }
  }
}
