
export default function getMiddleElement (container, itemHeight) {
  const containerHalf = container.clientHeight / 2
  for (let i = 0; i < container.children.length; i++) {
    const item = container.children[i]
    const itemTop = item.offsetTop - container.scrollTop
    const itemBottom = itemTop + itemHeight
    if (itemTop < containerHalf && itemBottom > containerHalf) return item
  }
}