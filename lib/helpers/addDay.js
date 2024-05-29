export default function addDay(dt, days) {
  dt.setDate(dt.getDate() + days)
  return dt
}
