
export enum Player {
  X = 'X',
  O = 'O',
}

export function opponent(player: Player): Player {
  return player === Player.X ? Player.O : Player.X;
}

export type Mark = Player | null;

export class Position {
  #row: number;
  #col: number;

  private constructor(row: number, col: number) {
    this.#row = row;
    this.#col = col;
  }

  get row(): number {
    return this.#row;
  }

  get col(): number {
    return this.#col;
  }

  toArray(): [number, number] {
    return [this.#row, this.#col];
  }

  static all(): Position[] {
    return [0, 1, 2].flatMap((row) => [0, 1, 2].map((col) => new Position(row, col)));
  }

  static new(row: number, col: number): Position {
    if (row < 0 || row > 2) {
      throw new Error(`Invalid row ${row}, must be 0, 1 or 2`);
    }
    if (col < 0 || col > 2) {
      throw new Error(`Invalid col ${col}, must be 0, 1 or 2`);
    }
    return new Position(row, col);
  }

  equals(other: Position): boolean {
    return this.#row === other.#row && this.#col === other.#col;
  }

  toString(): string {
    return `(${this.#row}, ${this.#col})`;
  }

  toIndex(): number {
    return this.#row * 3 + this.#col;
  }

  static fromIndex(index: number): Position {
    if (index < 0 || index > 8) {
      throw new Error(`Invalid index ${index}, must be between 0 and 8`);
    }
    return Position.new(Math.floor(index / 3), index % 3);
  }
}

export type Line = [Position, Position, Position];

const WINNING_LINES: Line[] = [
  // rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  // columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  // diagonals
  [0, 4, 8],
  [2, 4, 6],
].map((line) => line.map(Position.fromIndex) as Line);

export class Board {
  #cells: (Mark)[];

  private constructor(cells: (Mark)[]) {
    this.#cells = cells;
  }

  static get empty(): Board {
    return new Board(Array(9).fill(null));
  }

  static fromArray(cells: (Mark)[]): Board {
    if (cells.length !== 9) {
      throw new Error('Invalid board size');
    }
    return new Board(cells);
  }

  toArray(): (Mark)[] {
    return [...this.#cells];
  }

  toString(): string {
    return this.#cells.map((mark) => mark ?? '.').join('');
  }

  get(pos: Position): Mark {
    return this.#cells[pos.toIndex()];
  }

  set(pos: Position, mark: Player): Board {
    const cells = [...this.#cells];
    cells[pos.toIndex()] = mark;
    return new Board(cells);
  }

  isFull(): boolean {
    return this.#cells.every((cell) => cell !== null);
  }

  hasEnded(): boolean {
    return this.isFull() || this.hasWinner();
  }

  isTie(): boolean {
    return this.isFull() && !this.hasWinner();
  }

  hasWinner(): boolean {
    return this.winner !== null;
  }

  emptyCells(): Position[] {
    return Position.all().filter((pos) => this.get(pos) === null);
  }

  winningLines(): Line[] {
    return WINNING_LINES.filter((line) => {
      const [firstMark, ...otherMarks] = line.map((pos) => this.get(pos));
      return otherMarks.every((mark) => mark === firstMark) && firstMark !== null;
    });
  }

  get winner(): Player | null {
    const winnerAtLine = (ps: Position[]): Mark => {
      const [firstMark, ...otherMarks] = ps.map((p) => this.get(p));
      return otherMarks.every((mark) => mark === firstMark) ? firstMark : null;
    }

    const winners = WINNING_LINES.map(winnerAtLine).filter((mark) => mark !== null);
    return winners.length === 1 ? winners[0] : null;
  }
}
