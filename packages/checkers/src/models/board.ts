import { Piece } from "./piece";
import { Position, BOARD_WIDTH } from "./position";

export type CellState = Piece | null;

export class BoardState {
  #cells: CellState[];

  private constructor(cells: CellState[]) {
    this.#cells = cells;
  }

  static empty(): BoardState {
    return new BoardState(Array(BOARD_WIDTH * BOARD_WIDTH).fill(null));
  }

  static fromArray(cells: CellState[]): BoardState {
    if (cells.length !== BOARD_WIDTH * BOARD_WIDTH) {
      throw new Error(`Invalid number of cells: ${cells.length}`);
    }
    return new BoardState(cells);
  }

  toArray(): CellState[] {
    return [...this.#cells];
  }

  get(pos: Position): CellState {
    return this.#cells[pos.toIndex()];
  }

  set(pos: Position, value: CellState): BoardState {
    const cells = [...this.#cells];
    cells[pos.toIndex()] = value;
    return new BoardState(cells);
  }
}

