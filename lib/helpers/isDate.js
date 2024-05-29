export default function (v) {
  return Object.prototype.toString.call(v) === '[object Date]'
}
