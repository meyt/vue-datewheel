
export default function (intl, d) {
  const r = {}
  intl.formatToParts(d).forEach(v => {
    r[v.type] = isNaN(v.value) ? v.value : parseInt(v.value)
  })
  return r
}

