<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import DifficultyButtons from './components/DifficultyButtons.vue';
import StatsBar from './components/StatsBar.vue';
import { Cell } from './interfaces/Cell';
import { GameTimer } from './interfaces/GameTimer';
import { Settings } from './interfaces/Settings';

const settings = reactive<Settings>({
  width: 9,
  height: 9,
  mines: 10,
});

const cells = ref<Cell[]>([]);
const firstCell = ref<boolean>(true);
const gameOver = ref<boolean>(false);
const timer = ref<GameTimer>({
  id: 0,
  start: new Date(),
  current: new Date(),
});

const initGame = ({ width, height, mines }: Settings) => {
  Object.assign(settings, { width, height, mines });

  firstCell.value = true;
  gameOver.value = false;

  timer.value.start = new Date();
  timer.value.current = new Date();

  cells.value = [];
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      cells.value[j * width + i] = {
        id: j * width + i,
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

  if (openCells.length === (settings.width * settings.height - settings.mines)) {
    clearInterval(timer.value.id);
    openAllCells();
  }
};

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${settings.width}, min-content)`,
  gridTemplateRows: `repeat(${settings.height}, min-content)`,
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

  const x = cell.id % settings.width;
  const y = Math.floor(cell.id / settings.width);

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (
        (i !== 0 || j !== 0) &&
        x + i >= 0 &&
        x + i < settings.width &&
        y + j >= 0 &&
        y + j < settings.height
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
  return cells.value[y * settings.width + x];
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
    const x = cell.id % settings.width;
    const y = Math.floor(cell.id / settings.width);

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (
          (i !== 0 || j !== 0) &&
          x + i >= 0 &&
          x + i < settings.width &&
          y + j >= 0 &&
          y + j < settings.height
        ) {
          const cell = getCell(x + i, y + j);

          if (!cell.marked && !cell.open) openCell(cell);
        }
      }
    }
  }
};

const elapsedTime = computed(() => (timer.value.current.getTime() - timer.value.start.getTime()) / 1000)
</script>

<template>
  <div class="p-4 max-w-screen-lg mx-auto">
    <div class="grid grid-cols-1 gap-5">
      <div class="card bg-gray-600 text-white compact shadow-lg p-5">
        <div class="card-title">
          <h1 class="font-medium text-3xl">Minesweeper</h1>
          <h2 class="font-light">A simple Minesweeper game</h2>
        </div>
      </div>

      <DifficultyButtons @init-game="initGame"></DifficultyButtons>

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

      <StatsBar :elapsedTime="elapsedTime" :markedCellsCount="markedCellsCount" :mines="settings.mines"></StatsBar>
    </div>
  </div>
</template>

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
