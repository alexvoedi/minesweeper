<script setup lang="ts">
import { CellState } from '../interfaces/CellState'
import { Cell } from '../interfaces/Cell'
import { CellActions } from '../interfaces/CellActions';
import { PropType } from 'vue';

defineProps({
  cell: {
    type: Object as PropType<Cell>,
    required: true,
  },
  actions: {
    type: Object as PropType<CellActions>,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  value: {
    type: Number,
    required: true,
  }
})
</script>

<template>
  <button
    class="btn btn-sm btn-square rounded-none transition-none border-gray-500"
    :class="{
      open: cell.state === CellState.Open,
      questionmark: cell.state === CellState.Questionmark,
      flag: cell.state === CellState.Flag,
      highlight: cell.highlight,
    }"
    :disabled="disabled"
    @mouseup.left.prevent="actions.openCell(cell)"
    @mousedown.middle.prevent="actions.highlightSurroundingCells(cell)"
    @mouseup.middle.prevent="actions.openSurroundingCells(cell)"
    @contextmenu.prevent="actions.markCell(cell)"
  >
    <span v-if="cell.state === CellState.Open" class="text-black">
      <template v-if="cell.mine">
        <span v-if="disabled" text="color-red-500">💥</span>
        <span v-else text="color-red-500">💣</span>
      </template>

      <template v-else-if="value > 0">{{ value }}</template>
    </span>

    <span v-else-if="cell.state === CellState.Questionmark" class>❓</span>

    <span v-else-if="cell.state === CellState.Flag" class>🚩</span>
  </button>
</template>

<style scoped lang="postcss">
.questionmark {}

.flag {
  @apply bg-red-800 hover:bg-red-800;
}

.highlight {
  @apply bg-gray-400 border-gray-400;
}

.open {
  @apply btn-outline;
}
</style>
