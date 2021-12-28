<script setup lang="ts">
defineEmits([
  'init-game',
])

const options = [
  {
    title: 'Beginner',
    settings: { width: 9, height: 9, mines: 10 },
  },
  {
    title: 'Intermediate',
    settings: { width: 16, height: 16, mines: 40 },
  },
  {
    title: 'Expert',
    settings: { width: 30, height: 16, mines: 99 },
  },
]
</script>

<template>
  <div class="grid grid-cols-3 gap-5">
    <button
      v-for="{ title, settings } in options"
      :key="title"
      class="btn btn-primary transform hover:shadow-md btn-block block h-auto py-3"
      @click="$emit('init-game', settings)"
    >
      <div>{{ title }}</div>
      <div
        class="font-light normal-case"
      >{{ settings.width }}x{{ settings.height }} - {{ settings.mines }} Mines</div>
    </button>

    <!-- <button
          class="
            btn btn-secondary
            transform
            hover:shadow-md
            btn-block
            block
            h-auto
            py-3
          "
          disabled
        >
          <div>Custom</div>
          <div class="font-light normal-case">Define your own game</div>
    </button>-->
  </div>
</template>

<style>
</style>
