<template lang="pug">
nav.pagination(
  aria-label="Page navigation",
  @click.prevent="onClick",
)
  a.page-item(
    v-if="hasPrevious",
    :class="hasPrevious && !isLoading ? '' : 'disabled'",
    href="javascript:void(0)",
    aria-label="Previous Page",
    :data-to="modelValue > 1 ? modelValue - 1 : 1",
  )
    span.aria-hidden(aria-hidden="true") &lsaquo;

  a.page-item(
    v-for="page in pages",
    :class="{active: modelValue === page, disabled: isLoading}",
    href="javascript:void(0)",
    :aria-label="'Page ' + page",
    :data-to="page",
  )
    span.spinner-border.spinner-border-sm(v-if="isLoading && page === modelValue")
    span(v-else) {{page}}
    span.sr-only (current)

  input.page-item.w-16.text-xs(
    type="number",
    min="0",
    :max="last",
    placeholder="页码",
    @keyup.enter="doGotoPage",
  )

  a.page-item(
    v-if="hasNext",
    :class="hasNext && !isLoading ? '' : 'disabled'",
    href="javascript:void(0)",
    aria-label="Next Page",
    :data-to="modelValue < last ? modelValue + 1 : last",
  )
    span.aria-hidden(aria-hidden="true") &rsaquo;
</template>

<script>
import {
  computed,
  toRefs,
} from 'vue';
export default {
  props: {
    total: {
      type: Number,
      default: 0,
    },
    perPage: {
      type: Number,
      default: 20,
    },
    range: {
      type: Number,
      default: 4,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Number,
      default: 1,
    },
  },
  setup(props, {emit}) {
    const {
      total,
      range,
      perPage,
      isLoading,
      modelValue,
    } = toRefs(props);
    function onClick(event) {
      if (event.target.classList.contains('disabled')) {
        return;
      }
      let to = event.target.getAttribute('data-to');
      if (!to) {
        return;
      }
      to = Number(to);
      if (to === modelValue.value) {
        return;
      }
      emit('update:modelValue', to);
    }
    function doGotoPage(event) {
      let to = event.target.value;
      if (!to) {
        return;
      }
      to = Number(to);
      if (to === modelValue.value) {
        return;
      }
      emit('update:modelValue', to);
    }

    const hasNext = computed(() => {
      return modelValue.value < last.value;
    });
    const hasPrevious = computed(() => {
      return modelValue.value > 1;
    });
    const last = computed(() => {
      return Math.ceil(total.value / perPage.value);
    });
    const pages = computed(() => {
      let start = modelValue.value > range.value ? modelValue.value - (range.value - 1) : 1;
      let end = modelValue.value < last.value - range.value ? modelValue.value + range.value : last.value;
      let array = [];
      for (; start <= end; start++) {
        array.push(start);
      }
      return array;
    });

    return {
      isLoading,

      hasNext,
      hasPrevious,
      last,
      pages,

      doGotoPage,
      onClick,
    };
  },
};
</script>
