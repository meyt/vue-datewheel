<script setup>
import {computed} from 'vue'

const props = defineProps({
  label: {
    type: [Number, String],
    default: '&nbsp;',
  },
  selected: {
    type: Boolean,
    default: false
  }
})
const classes = computed(() => {
  const res = ['selector-item rounded']
  if (props.selected) res.push('is-selected')
  return res
})

</script>
<template>
  <div
    :class="classes"
    v-bind="$attrs"
    v-html="label"
  />
</template>
