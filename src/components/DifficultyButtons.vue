<script setup lang="ts">
defineEmits([
  'init-game',
])
</script>

<template>
  <div class="grid grid-cols-4 gap-5">
        <button
          class="
            btn btn-primary
            transform
            hover:shadow-md
            btn-block
            block
            h-auto
            py-3
          "
          @click="$emit('init-game', { width: 9, height: 9, mines: 10 })"
        >
          <div>Beginner</div>
          <div class="font-light normal-case">9x9 - 10 Mines</div>
        </button>
        <button
          class="
            btn btn-primary
            transform
            hover:shadow-md
            btn-block
            block
            h-auto
            py-3
          "
          @click="$emit('init-game', { width: 16, height: 16, mines: 40 })"
        >
          <div>Intermediate</div>
          <div class="font-light normal-case">16x16 - 40 Mines</div>
        </button>
        <button
          class="
            btn btn-primary
            transform
            hover:shadow-md
            btn-block
            block
            h-auto
            py-3
          "
          @click="$emit('init-game', { width: 30, height: 16, mines: 99 })"
        >
          <div>Expert</div>
          <div class="font-light normal-case">30x16 - 99 Mines</div>
        </button>
        <button
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
        </button>
      </div>
</template>

<style>

</style>
