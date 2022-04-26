
export default function TouchWheel (containerEl) {
  let isDown = false
  let startY
  let scrollTop
  const self = this
  const iswheelingClass = 'is-wheeling'
  const iswheelingGlobalClass = 'date-time-selector-is-wheeling'

  function getPageY (e) {
    return e.touches && e.touches.length > 0
      ? e.touches[0].pageY
      : e.pageY
  }
  function onMousedown (e) {
    if (isDown) return
    isDown = true
    startY = getPageY(e) - containerEl.offsetTop
    scrollTop = containerEl.scrollTop
    containerEl.classList.add(iswheelingClass)
    document.body.classList.add(iswheelingGlobalClass)
  }

  function onMouseup (e) {
    if (!isDown) return
    isDown = false
    containerEl.classList.remove(iswheelingClass)
    document.body.classList.remove(iswheelingGlobalClass)

    // hook
    const endY = getPageY(e) - containerEl.offsetTop
    self.onScrollend(e, endY - startY)
  }

  function onMousemove (e) {
    if (!isDown) return
    e.preventDefault()
    const y = getPageY(e) - containerEl.offsetTop
    const walk = y - startY
    containerEl.scrollTop = scrollTop - walk
  }

  // externals
  this.onScrollend = (e, deltaY) => {}
  this.init = () => {
    containerEl.addEventListener('mousedown', onMousedown)
    containerEl.addEventListener('touchstart', onMousedown, { passive: false })

    document.addEventListener('mouseleave', onMouseup)
    document.addEventListener('mouseup', onMouseup)
    document.addEventListener('touchend', onMouseup)
    document.addEventListener('touchcancel', onMouseup)

    document.addEventListener('mousemove', onMousemove)
    document.addEventListener('touchmove', onMousemove, { passive: false })
  }

  this.destroy = () => {
    containerEl.removeEventListener('mousedown', onMousedown)
    containerEl.removeEventListener('touchstart', onMousedown)

    document.removeEventListener('mouseleave', onMouseup)
    document.removeEventListener('mouseup', onMouseup)
    document.removeEventListener('touchend', onMouseup)
    document.removeEventListener('touchcancel', onMouseup)

    document.removeEventListener('mousemove', onMousemove)
    document.removeEventListener('touchmove', onMousemove)
  }
}
