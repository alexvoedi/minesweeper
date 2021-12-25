<template>
  <div class="p-4 max-w-screen-lg mx-auto">
    <div class="grid grid-cols-1 gap-5">
      <div class="card bg-gray-600 text-white compact shadow-lg p-5">
        <div class="card-title">
          <h1 class="font-medium text-3xl">Minesweeper</h1>
          <h2 class="font-light">A simple Minesweeper game</h2>
        </div>
      </div>

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
          @click="initGame(9, 9, 10)"
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
          @click="initGame(16, 16, 40)"
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
          @click="initGame(30, 16, 99)"
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

      <div class="mx-auto">
        <div
          class="grid items-center justify-items-center cursor-pointer"
          :style="gridStyle"
          @click.prevent=""
          @mousedown.middle.prevent=""
          @mouseup.middle.prevent=""
          @contextmenu.prevent=""
        >
          <template v-for="(cell, index) in cells" :key="index">
            <button
              class="
                btn btn-sm btn-square
                rounded-none
                transition-none
                border-gray-500
              "
              :class="{
                open: cell.open,
                marked: cell.marked,
                highlight: cell.highlight,
              }"
              :disabled="gameOver"
              @mouseup.left.prevent="openCell(cell)"
              @mousedown.middle.prevent="highlightSurroundingCells(cell)"
              @mouseup.middle.prevent="openSurroundingCells(cell)"
              @contextmenu.prevent="markCell(cell)"
            >
              <span v-if="cell.open" class="text-black">
                <template v-if="!cell.mine">
                  <template v-if="getAdjacentCellsMineCount(cell) > 0">
                    {{ getAdjacentCellsMineCount(cell) }}
                  </template>
                </template>
                <template v-else>
                  <span text="color-red-500"> 💣 </span>
                </template>
              </span>
              <span v-else-if="cell.marked" class="">
                🚩
              </span>
            </button>
          </template>
        </div>
      </div>

      <div class="stats w-full">
        <div class="stat place-items-center place-content-center gap-x-0">
          <div class="stat-title">Time</div>
          <div class="stat-value text-center font-mono">
            {{ (timer.elapsed / 1000).toFixed(3) }}
          </div>
          <div class="stat-desc">Seconds</div>
        </div>

        <div class="stat place-items-center place-content-center gap-x-0">
          <div class="stat-title">Marked</div>
          <div
            class="stat-value text-center font-mono"
            :class="{
              'text-success': markedCellsCount <= settings.mines,
              'text-error': markedCellsCount > settings.mines,
            }"
          >
            {{ markedCellsCount }}
          </div>
          <div class="stat-desc">Mines</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";

interface Cell {
  id: number;
  open: boolean;
  mine: boolean;
  marked: boolean;
  highlight: boolean;
}

const settings = reactive({
  w: 9,
  h: 9,
  mines: 10,
});

const cells = ref<Cell[]>([]);
const firstCell = ref<boolean>(true);
const gameOver = ref<boolean>(false);
const timer = ref<{
  id: number;
  start: Date;
  current: Date;
  elapsed: number;
}>({
  id: 0,
  start: new Date(),
  current: new Date(),
  elapsed: 0,
});

const initGame = (w: number, h: number, mines: number) => {
  Object.assign(settings, { w, h, mines });

  firstCell.value = true;
  gameOver.value = false;

  timer.value.start = new Date();
  timer.value.current = new Date();
  timer.value.elapsed = 0;

  cells.value = [];
  for (let i = 0; i < settings.w; i++) {
    for (let j = 0; j < settings.h; j++) {
      cells.value[j * settings.w + i] = {
        id: j * settings.w + i,
        open: false,
        mine: false,
        marked: false,
        highlight: false,
      };
    }
  }
};

const checkWinCondition = () => {
  const openCells = cells.value.filter((cell) => cell.open);

  if (openCells.length === settings.w * settings.h - settings.mines) {
    clearInterval(timer.value.id);
    openAllCells();
  }
};

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${settings.w}, min-content)`,
  gridTemplateRows: `repeat(${settings.h}, min-content)`,
}));

const openCell = (cell: Cell) => {
  if (cell.open || cell.marked) return;

  cell.open = true;

  if (firstCell.value) {
    populateMines();

    timer.value.start = new Date();
    timer.value.id = setInterval(tick, 10);
  }

  if (cell.mine) {
    clearTimeout(timer.value.id);
    openAllCells();
    gameOver.value = true;
    return;
  }

  const adjacentCells = getAdjacentCells(cell);

  const adjacentCellsWithMines = adjacentCells.filter((cell) => cell.mine);

  if (adjacentCellsWithMines.length === 0) {
    adjacentCells.forEach((cell) => openCell(cell));
  }

  checkWinCondition();
};

const tick = () => {
  timer.value.current = new Date();
  timer.value.elapsed =
    timer.value.current.getTime() - timer.value.start.getTime();
};

const populateMines = () => {
  firstCell.value = false;

  const closedCells = cells.value.filter((cell) => !cell.open);

  let i = 0;

  while (i < settings.mines) {
    const randomCell =
      closedCells[Math.floor(Math.random() * closedCells.length)];

    if (!randomCell.mine) {
      randomCell.mine = true;
      i++;
    }
  }
};

const openAllCells = () => {
  cells.value.forEach((cell) => (cell.open = true));
};

const markCell = (cell: Cell) => {
  if (cell.open) return;

  cell.marked = !cell.marked;
};

const getAdjacentCells = (cell: Cell) => {
  const adjacentCells: Cell[] = [];

  const x = cell.id % settings.w;
  const y = Math.floor(cell.id / settings.w);

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (
        (i !== 0 || j !== 0) &&
        x + i >= 0 &&
        x + i < settings.w &&
        y + j >= 0 &&
        y + j < settings.h
      ) {
        const cell = getCell(x + i, y + j);

        adjacentCells.push(cell);
      }
    }
  }

  return adjacentCells;
};

const markedCellsCount = computed(
  () => cells.value.filter((cell) => cell.marked).length
);

const getAdjacentCellsMineCount = (cell: Cell) => {
  const adjacentCells = getAdjacentCells(cell);

  const adjacentCellsWithMines = adjacentCells.filter((cell) => cell.mine);

  return adjacentCellsWithMines.length;
};

const getCell = (x: number, y: number): Cell => {
  return cells.value[y * settings.w + x];
};

const highlightSurroundingCells = (cell: Cell) => {
  const adjacentCells = getAdjacentCells(cell);

  adjacentCells
    .filter((cell) => !cell.marked)
    .forEach((cell) => (cell.highlight = true));
};

const openSurroundingCells = (cell: Cell) => {
  cells.value.forEach((cell) => (cell.highlight = false));

  if (!cell.open) return;

  const adjacentCells = getAdjacentCells(cell);

  const markedAdjacentCells = adjacentCells.filter(
    (cell) => cell.marked && !cell.open
  );
  const adjacentCellsWithMines = adjacentCells.filter((cell) => cell.mine);

  if (markedAdjacentCells.length === adjacentCellsWithMines.length) {
    const x = cell.id % settings.w;
    const y = Math.floor(cell.id / settings.w);

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (
          (i !== 0 || j !== 0) &&
          x + i >= 0 &&
          x + i < settings.w &&
          y + j >= 0 &&
          y + j < settings.h
        ) {
          const cell = getCell(x + i, y + j);

          if (!cell.marked && !cell.open) openCell(cell);
        }
      }
    }
  }
};
</script>

<style lang="postcss" scoped>
.marked {
  @apply bg-red-800 hover:bg-red-800;
}

.highlight {
  @apply bg-gray-400 border-gray-400;
}

.open {
  @apply btn-outline;
}
</style>
