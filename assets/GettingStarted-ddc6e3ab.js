import{r as m,M as c}from"./index-6a6c59bb.js";import{u as v}from"./index-abfa5f44.js";import"./iframe-46f67355.js";import"../sb-preview/runtime.js";import"./index-abcdd3e4.js";import"./index-356e4a49.js";var u={exports:{}},o={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var f=m,h=Symbol.for("react.element"),w=Symbol.for("react.fragment"),_=Object.prototype.hasOwnProperty,x=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,y={key:!0,ref:!0,__self:!0,__source:!0};function d(n,e,l){var t,r={},a=null,i=null;l!==void 0&&(a=""+l),e.key!==void 0&&(a=""+e.key),e.ref!==void 0&&(i=e.ref);for(t in e)_.call(e,t)&&!y.hasOwnProperty(t)&&(r[t]=e[t]);if(n&&n.defaultProps)for(t in e=n.defaultProps,e)r[t]===void 0&&(r[t]=e[t]);return{$$typeof:h,type:n,key:a,ref:i,props:r,_owner:x.current}}o.Fragment=w;o.jsx=d;o.jsxs=d;u.exports=o;var s=u.exports;const b=`# vue-datewheel

![Build Status](https://github.com/meyt/vue-datewheel/actions/workflows/main.yaml/badge.svg?branch=master)

Simple iOS like date picker for Vue.

Features:
- Based on Browser native [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) implementation
- Zero dependency
- Multi-calendar
- Localization
- Mouse wheel and touch gestures


[Demo](https://meyt.github.io/vue-datewheel)

## Install

Vue 2
\`\`\`
npm install --save vue-datewheel@0.1.7
\`\`\`

Vue 3
\`\`\`
npm install --save vue-datewheel
\`\`\`


## Usage:


\`\`\`vue
<template>
  <v-app>
    <v-container>
      <vue-datewheel v-model="selectedDate"/>
      <div v-text="selectedDate" />
    </v-container>
  </v-app>
</template>

<script>
import vueDatewheel from 'vue-datewheel'
import 'vue-datewheel/dist/vue-datewheel.css'

export default {
  components: {
    vueDatewheel,
  },
  data () {
    return {
      selectedDate: null
    }
  }
}
<\/script>
\`\`\`
`;function p(n){return s.jsx(c,{children:b})}function g(n={}){const{wrapper:e}={...v(),...n.components};return e?s.jsx(e,{...n,children:s.jsx(p,{...n})}):p()}export{g as default};
