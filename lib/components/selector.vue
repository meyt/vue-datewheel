<script setup>
import {watch,nextTick,ref, onMounted, onBeforeUnmount} from 'vue'
import TouchWheel from '../helpers/touchwheel'
import getMiddleElement from '../helpers/getMiddleElement'
import selectorItem from './selector-item.vue'

const props = defineProps({
  label: {
    type: String,
    default: null
  },
  modelValue: {
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
})
const emit = defineEmits(['update:modelValue'])
const listEl = ref(null)
const rootEl = ref(null)

let _touchWheel = null
let _clickIndex = null

// watchers
watch(() => props.modelValue, (newVal, oldVal) => {
  if (newVal === oldVal) return
  nextTick(scrollToValue)
})

watch(() => props.items, (newVal, oldVal) => {
  if (newVal === oldVal) return
  nextTick(scrollToValue)
})

// methods
function scrollToValue () {
  for (let i = 0; i < props.items.length; i++) {
    if (props.items[i].value === props.modelValue) return selectItem(i)
  }
}
function onItemMousedown (item, index, e) {
  _clickIndex = index
}
function scrollToMiddle () {
  const containerEl = listEl.value
  const middleEl = getMiddleElement(containerEl, props.itemHeight)
  if (!middleEl) return
  const containerYOffset = parseInt(parseInt(containerEl.clientHeight / props.itemHeight) / 2)
  const scrollTop = middleEl.offsetTop - props.itemHeight * containerYOffset
  containerEl.scrollTo({ top: scrollTop, behavior: 'smooth' })

  const itemIndex = parseInt(scrollTop / props.itemHeight)
  emit('update:modelValue', props.items[itemIndex])
}
function selectItem (index) {
  const containerEl = listEl.value
  const containerHalf = containerEl.clientHeight / 2
  const itemHalf = props.itemHeight / 2
  const itemEl = containerEl.children[index]
  const indicatorTop = containerHalf - itemHalf
  containerEl.scrollTo({
    top: itemEl.offsetTop - indicatorTop,
    behavior: 'smooth'
  })
  emit('update:modelValue', props.items[index])
}
function onScrollend (e, deltaY) {
  if (Math.abs(deltaY) < 2 && _clickIndex !== null) {
    // its click
    selectItem(_clickIndex)
  } else if (e.target === listEl.value) {
    // on dragging scrollbar
    setTimeout(scrollToMiddle, 200)
  } else {
    scrollToMiddle()
  }
  _clickIndex = null
}
function onListWheel (e) {
  const containerEl = listEl.value
  const isScrollDown = e.wheelDelta > 0
  const scrollTop = isScrollDown
    ? containerEl.scrollTop - props.itemHeight
    : containerEl.scrollTop + props.itemHeight
  if (
    scrollTop >= 0 &&
    scrollTop <= containerEl.scrollHeight - containerEl.clientHeight
  ) {
    const itemIndex = parseInt(scrollTop / props.itemHeight)
    const scrollBehavior = containerEl.style.scrollBehavior
    containerEl.style.scrollBehavior = 'auto'
    containerEl.scrollTop = scrollTop
    containerEl.style.scrollBehavior = scrollBehavior
    emit('update:modelValue', props.items[itemIndex])
  }
}

// lifecycle
onMounted(() => {
  _touchWheel = new TouchWheel(rootEl.value.querySelector('.selector-list'))
  _touchWheel.init()
  _touchWheel.onScrollend = onScrollend
  nextTick(scrollToValue)
})
onBeforeUnmount(() => {
  if (_touchWheel !== null) _touchWheel.destroy()
})

</script>
<template>
  <div class="selector" ref="rootEl">
    <div v-if="label" class="label" v-text="label" />
    <div class="selector-list-wrapper">
      <div
        ref="listEl"
        class="selector-list"
        @wheel.prevent="onListWheel"
      >
        <selector-item
          v-for="(item, index) in items"
          :key="item.value"
          :label="item.text"
          :selected="modelValue === item.value"
          @mousedown="onItemMousedown(item, index, $event)"
        />
      </div>
    </div>
  </div>
</template>
