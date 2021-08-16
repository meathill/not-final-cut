<template lang="pug">
transition(
  name="alert-transition",
  enter-active-class="animated slideInDown",
  leave-active-class="animated slideOutUp",
)
  .py-2.px-3.absolute.w-full.z-10(
    v-if="visible && message",
    :class="status === true ? 'bg-green-300' : 'bg-red-300'",
  )
    slot {{message}}
    button.close(
      v-if="dismissable",
      type="button",
      @click="doDismiss",
    ) &times;
</template>

<script>
import {
  ref,
  toRefs,
  watch,
} from 'vue';

export default {
  props: {
    message: {
      type: String,
      default: null,
    },
    status: {
      type: Boolean,
      default: null,
    },
    autoHide: {
      type: Number,
      default: 0,
    },
    dismissable: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, {emit}) {
    const {
      message,
      status,
      autoHide,
      dismissable,
    } = toRefs(props);
    const visible = ref(true);

    let timeout;
    if (autoHide.value) {
      watch(message, value => {
        clearTimeout(timeout);
        if (value) {
          visible.value = true;
          const duration = autoHide.value * 1000;
          if (duration && status.value) {
            timeout = setTimeout(() => {
              visible.value = false;
              emit('hide');
            }, duration);
          }
        }
      });
    }

    function doDismiss() {
      visible.value = false;
      clearTimeout(timeout);
    }

    return {
      message,
      status,
      visible,
      dismissable,

      doDismiss,
    };
  },
}
</script>
