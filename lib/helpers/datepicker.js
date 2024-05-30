export function getYears(filterFn, tree) {
  return tree.years
    .map(year => parseInt(year))
    .filter(year => filterFn({ year }))
    .map(value => ({ text: value, value }))
}

export function getMonths(filterFn, tree, year, monthNames) {
  const r = []
  tree[year].entries().forEach(([k, v]) => {
    if (!v.length) return
    if (!filterFn({ year, month: k + 1 })) return
    r.push({
      text: monthNames[k],
      value: k + 1
    })
  })
  return r
}

export function getDays(filterFn, tree, year, month) {
  const r = []
  tree[year][month - 1].entries().forEach(([k, v]) => {
    if (v === null) return
    k = k + 1
    if (!filterFn({ year, month, day: k })) return
    r.push({
      text: k,
      value: k,
      date: v
    })
  })
  return r
}

export function getHours(filterFn, min, max, year, month, day) {
  const r = []
  for (let i = min[0]; i <= max[0]; i++) {
    if (!filterFn({ year, month, day, hour: i })) continue
    r.push({ text: i, value: i })
  }
  return r
}

export function getMinutes(filterFn, min, max, year, month, day, hour) {
  const r = []
  for (let i = min[1]; i <= max[1]; i++) {
    if (!filterFn({ year, month, day, hour, minute: i })) continue
    r.push({ text: i, value: i })
  }
  return r
}

export function getSeconds(filterFn, min, max, year, month, day, hour, minute) {
  const r = []
  for (let i = min[2]; i <= max[2]; i++) {
    if (!filterFn({ year, month, day, hour, minute, second: i })) continue
    r.push({ text: i, value: i })
  }
  return r
}

export function getFirstMonth(tree, year) {
  for (const [k, v] of tree[year].entries()) {
    if (v.length) return k + 1
  }
}

export function getFirstDay(tree, year, month) {
  for (const [k, v] of tree[year][month - 1].entries()) {
    if (v !== null) return k + 1
  }
}
