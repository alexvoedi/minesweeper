<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { CellState } from './interfaces/CellState';
import { Cell } from './interfaces/Cell';
import { GameTimer } from './interfaces/GameTimer';
import { Settings } from './interfaces/Settings';
import DifficultyButtons from './components/DifficultyButtons.vue';
import StatsBar from './components/StatsBar.vue';
import CellButton from './components/CellButton.vue';

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
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      cells.value[y * width + x] = {
        x, y,
        mine: false,
        highlight: false,
        state: CellState.Close
      };
    }
  }
};

const checkWinCondition = () => {
  const openCells = cells.value.filter((cell) => cell.state === CellState.Open);

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
  if (cell.state !== CellState.Close) return;

  cell.state = CellState.Open;

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

const tick = () => timer.value.current = new Date()

const populateMines = () => {
  firstCell.value = false;

  const closedCells = cells.value.filter((cell) => cell.state !== CellState.Open);

  let i = 0;
  while (i < settings.mines) {
    const randomCell =
      closedCells[Math.floor(Math.random() * closedCells.length)];

    if (randomCell.mine) continue;

    randomCell.mine = true;
    i++;
  }
};

const openAllCells = () => {
  cells.value.forEach((cell) => (cell.state = CellState.Open));
};

const markCell = (cell: Cell) => {
  if (cell.state === CellState.Open) return;

  if (cell.state === CellState.Close) cell.state = CellState.Flag
  else if (cell.state === CellState.Flag) cell.state = CellState.Questionmark
  else if (cell.state === CellState.Questionmark) cell.state = CellState.Close
};

const getAdjacentCells = (cell: Cell) => {
  const { x, y } = cell

  const adjacentCells: Cell[] = [];

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if ((i !== 0 || j !== 0) && checkIfInBounds(x + i, y + j)) {
        const cell = getCell(x + i, y + j);

        adjacentCells.push(cell);
      }
    }
  }

  return adjacentCells;
};

const markedCellsCount = computed(
  () => cells.value.filter((cell) => cell.state === CellState.Flag).length
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
    .filter((cell) => cell.state === CellState.Close || cell.state === CellState.Questionmark)
    .forEach((cell) => (cell.highlight = true));
};

const checkIfInBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < settings.width && y < settings.height

const openSurroundingCells = (cell: Cell) => {
  cells.value.forEach((cell) => (cell.highlight = false));

  if (cell.state !== CellState.Open) return;

  const adjacentCells = getAdjacentCells(cell);

  const flaggedAdjacentCells = adjacentCells.filter(
    (cell) => cell.state === CellState.Flag
  );
  const adjacentCellsWithMines = adjacentCells.filter((cell) => cell.mine);

  if (flaggedAdjacentCells.length === adjacentCellsWithMines.length) {
    const { x, y } = cell

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;

        if (checkIfInBounds(x + i, y + i)) {
          const cell = getCell(x + i, y + j);

          if (!(cell.state === CellState.Flag) && !(cell.state === CellState.Open)) openCell(cell);
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
          @click.prevent
          @mousedown.middle.prevent
          @mouseup.middle.prevent
          @contextmenu.prevent
        >
          <template v-for="cell in cells" :key="cell.id">
            <CellButton
              :cell="cell"
              :actions="{
                openCell,
                highlightSurroundingCells,
                openSurroundingCells,
                markCell
              }"
              :disabled="gameOver"
              :value="getAdjacentCellsMineCount(cell)"
            ></CellButton>
          </template>
        </div>
      </div>

      <StatsBar
        :elapsedTime="elapsedTime"
        :markedCellsCount="markedCellsCount"
        :mines="settings.mines"
      ></StatsBar>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
</style>
