<template>
  <div
    :class="classes"
    v-bind="$attrs"
    v-on="$listeners"
    v-html="label"
  />
</template>

<script>
export default {
  props: {
    label: {
      type: [Number, String],
      default: '&nbsp;',
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    classes () {
      const res = ['selector-item rounded']
      if (this.selected) res.push('is-selected')
      return res
    }
  }
}
</script>
