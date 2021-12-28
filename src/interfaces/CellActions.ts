import { Cell } from './Cell';

export interface CellActions {
  openCell(cell: Cell): void;
  highlightSurroundingCells(cell: Cell): void;
  openSurroundingCells(cell: Cell): void;
  markCell(cell: Cell): void;
}
