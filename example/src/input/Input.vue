<template>
  <div class="input-box">
    <label for="my-input">{{ label }}</label>
    <input id="my-input" type="input" :class="classes" @input="onChange" :style="style"/>
  </div>
</template>

<script>
import './input.css';
import { reactive, computed } from 'vue';

export default {
  name: 'my-input',

  props: {
    label: {
      type: String,
      required: true,
    },
  },

  emits: ['change'],

  setup(props, { emit }) {
    props = reactive(props);
    return {
      classes: computed(() => ({
        'storybook-input': true
      })),
      onChange(evt) {
        emit('change', evt.target.value);
      }
    }
  },
};
</script>
