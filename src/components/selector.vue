<template>
  <div class="selector">
    <div v-if="label" class="label" v-text="label" />
    <div class="selector-list-wrapper">
      <div
        ref="list"
        class="selector-list"
        @wheel.prevent="onListWheel"
      >
        <selector-item
          v-for="(item, index) in items"
          ref="listItem"
          :key="item.value"
          :label="item.text"
          :selected="value === item.value"
          @mousedown="onItemMousedown(item, index, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TouchWheel from '../helpers/touchwheel'
import getMiddleElement from '../helpers/getMiddleElement'
import selectorItem from './selector-item.vue'
export default {
  components: {
    selectorItem
  },
  props: {
    label: {
      type: String,
      default: null
    },
    value: {
      type: [String, Number],
      default: null
    },
    items: {
      type: Array,
      default () { return [] }
    },
    itemHeight: {
      type: Number,
      default: 35,
    }
  },
  data () {
    return {}
  },
  watch: {
    value (newVal, oldVal) {
      if (newVal === oldVal) return
      this.$nextTick(this.scrollToValue)
    },
    items (newVal, oldVal) {
      if (newVal === oldVal) return
      this.$nextTick(this.scrollToValue)
    }
  },
  mounted () {
    this._touchWheel = new TouchWheel(this.$el.querySelector('.selector-list'))
    this._touchWheel.init()
    this._touchWheel.onScrollend = this.onScrollend
    this.$nextTick(this.scrollToValue)
  },
  beforeDestroy () {
    this._touchWheel.destroy()
  },
  methods: {
    scrollToValue () {
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].value === this.value) return this.selectItem(i)
      }
    },
    onItemMousedown (item, index, e) {
      this._clickIndex = index
    },
    scrollToMiddle () {
      const containerEl = this.$refs.list
      const middleEl = getMiddleElement(containerEl, this.itemHeight)
      if (!middleEl) return
      const containerYOffset = parseInt(parseInt(containerEl.clientHeight / this.itemHeight) / 2)
      containerEl.scrollTo({
        top: middleEl.offsetTop - this.itemHeight * containerYOffset,
        behavior: 'smooth'
      })
    },
    selectItem (index) {
      const containerEl = this.$refs.list
      const containerHalf = containerEl.clientHeight / 2
      const itemHalf = this.itemHeight / 2
      const itemEl = containerEl.children[index]
      const indicatorTop = containerHalf - itemHalf
      containerEl.scrollTo({
        top: itemEl.offsetTop - indicatorTop,
        behavior: 'smooth'
      })
      this.$emit('input', this.items[index])
    },
    onScrollend (e, deltaY) {
      if (Math.abs(deltaY) < 2 && typeof this._clickIndex !== 'undefined') {
        // its click
        this.selectItem(this._clickIndex)
      } else if (e.target === this.$refs.list) {
        // on dragging scrollbar
        setTimeout(this.scrollToMiddle, 200)
      } else {
        this.scrollToMiddle()
      }
      delete this._clickIndex
    },
    onListWheel (e) {
      const containerEl = this.$refs.list
      const isScrollDown = e.wheelDelta > 0
      const scrollTop = isScrollDown
        ? containerEl.scrollTop - this.itemHeight
        : containerEl.scrollTop + this.itemHeight
      if (
        scrollTop >= 0 &&
        scrollTop <= containerEl.scrollHeight - containerEl.clientHeight
      ) {
        const itemIndex = parseInt(scrollTop / this.itemHeight)
        const scrollBehavior = containerEl.style.scrollBehavior
        containerEl.style.scrollBehavior = 'auto'
        containerEl.scrollTop = scrollTop
        containerEl.style.scrollBehavior = scrollBehavior
        this.$emit('input', this.items[itemIndex])
      }
    }
  }
}
</script>
