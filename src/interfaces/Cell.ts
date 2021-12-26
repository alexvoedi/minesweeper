import { CellState } from './CellState';

export interface Cell {
  x: number;
  y: number;
  mine: boolean;
  highlight: boolean;
  state: CellState
}
