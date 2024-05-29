import addDay from './addDay'
import formatToParts from './formatToParts'

function formatGregory(d) {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds()
  }
}

export default function generateTree(intl, fromDate, toDate) {
  const formatDate = intl === null
    ? formatGregory
    : d => formatToParts(intl, d)

  const res = { years: [] }
  function setDay(p, date) {
    if (typeof res[p.year] === 'undefined') {
      res[p.year] = []
      res.years.push(p.year)
    }
    if (typeof res[p.year][p.month - 1] === 'undefined') {
      const mneed = p.month - res[p.year].length
      for (let i = 0; i < mneed; i++) res[p.year].push([])
    }
    const day = [date.getFullYear(), date.getMonth(), date.getDate()]
    if (typeof res[p.year][p.month - 1][p.day - 1] === 'undefined') {
      const month = res[p.year][p.month - 1]
      const dneed = p.day - month.length
      for (let i = 0; i < dneed; i++) month.push(null)
    }
    res[p.year][p.month - 1][p.day - 1] = day
  }

  let date = new Date(fromDate)
  let p = formatDate(date)
  while (date.getTime() < toDate.getTime()) {
    p = formatDate(date)
    setDay(p, date)
    addDay(date, 1)
    date.setHours(0, 0, 0, 0)
  }
  return res
}
