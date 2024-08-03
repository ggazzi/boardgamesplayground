import { Player } from "./player";

export type CellState = Piece | { type: null };

export type Piece = {
  type: 'man' | 'king';
  player: Player;
};

export const BOARD_WIDTH = 4;

export class Position {
  #index: number;

  private constructor(index: number) {
    this.#index = index;
  }

  /** Return an array of all possible board positions.
   *
   * The positions are sorted from the top left to the bottom right,
   * and grouped by row.
   */
  static all(): Position[] {
    return Array(BOARD_WIDTH * BOARD_WIDTH)
      .fill(null)
      .map((_, index) => new Position(index));
  }

  static fromIndex(index: number): Position {
    if (index < 0 || index >= BOARD_WIDTH * BOARD_WIDTH) {
      throw new Error(`Invalid index ${index}, must be between 0 and ${BOARD_WIDTH * BOARD_WIDTH}`);
    }
    return new Position(index);
  }

  toIndex(): number {
    return this.#index;
  }

  static new(row: number, col: number): Position {
    if (row < 0 || row >= BOARD_WIDTH) {
      throw new Error(`Invalid row ${row}, must be between 0 and ${BOARD_WIDTH}`);
    }
    if (col < 0 || col >= BOARD_WIDTH) {
      throw new Error(`Invalid col ${col}, must be between 0 and ${BOARD_WIDTH}`);
    } return new Position(row * BOARD_WIDTH + col);
  }

  get row(): number {
    return Math.floor(this.#index / BOARD_WIDTH);
  }

  get col(): number {
    return this.#index % BOARD_WIDTH;
  }

  toArray(): [number, number] {
    return [this.row, this.col];
  }

  equals(other: Position): boolean {
    return this.#index === other.#index;
  }

  toString(): string {
    return `(${this.row}, ${this.col})`;
  }
}

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

