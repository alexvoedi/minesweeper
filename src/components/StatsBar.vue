<script setup lang="ts">
defineProps({
  elapsedTime: {
    type: Number,
    required: true,
  },
  markedCellsCount: {
    type: Number,
    required: true,
  },
  mines: {
    type: Number,
    required: true,
  }
})
</script>

<template>
  <div class="stats w-full">
    <div class="stat place-items-center place-content-center gap-x-0">
      <div class="stat-title">Time</div>
      <div class="stat-value text-center font-mono">{{ elapsedTime.toFixed(2) }}</div>
      <div class="stat-desc">Seconds</div>
    </div>

    <div class="stat place-items-center place-content-center gap-x-0">
      <div class="stat-title">Marked</div>
      <div
        class="stat-value text-center font-mono"
        :class="[markedCellsCount <= mines ? 'text-success' : 'text-error']"
      >{{ markedCellsCount }}</div>
      <div class="stat-desc">Mines</div>
    </div>
  </div>
</template>

<style>
</style>
