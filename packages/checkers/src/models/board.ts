import { Player } from "./player";

export type CellState = Player | null;

export const BOARD_WIDTH = 3;

export class Position {
  #index: number;

  private constructor(index: number) {
    this.#index = index;
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
    }
    return new Position(row * BOARD_WIDTH + col);
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
}

