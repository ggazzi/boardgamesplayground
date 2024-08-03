import { describe, it, test, expect } from 'bun:test';
import fc from 'fast-check';

import { Position, Board, opponent, Player, Line, Mark } from './board';

function arbitraryPlayer(): fc.Arbitrary<Player> {
  return fc.constantFrom(Player.X, Player.O);
}

function arbitraryMark(): fc.Arbitrary<Mark> {
  return fc.constantFrom(Player.X, Player.O, null);
}

function arbitraryPosition(): fc.Arbitrary<Position> {
  return fc.tuple(fc.nat(2), fc.nat(2)).map(([row, col]) => Position.new(row, col));
}

function arbitraryBoard(options: { includeOnly?: Mark[] } = {}): fc.Arbitrary<Board> {
  const markGenerator = options?.includeOnly ? fc.constantFrom(...options.includeOnly) : arbitraryMark();
  return fc.array(markGenerator, { minLength: 9, maxLength: 9 }).map(Board.fromArray);
}

function arbitraryLine(): fc.Arbitrary<Line> {
  return fc.oneof(
    fc.nat(2).map((row) => [0, 1, 2].map((col) => Position.new(row, col)) as Line),
    fc.nat(2).map((col) => [0, 1, 2].map((row) => Position.new(row, col)) as Line),
    fc.boolean().map((isAscending) => {
      return [0, 1, 2].map((row) => Position.new(row, isAscending ? 2 - row : row)) as Line;
    })
  );
}

describe('Player', () => {
  describe('opponent', () => {
    it('returns the opponent of a player', () => {
      expect(opponent(Player.X)).toEqual(Player.O);
      expect(opponent(Player.O)).toEqual(Player.X);
    });
  });
});

describe('Position', () => {
  const validPositions = [0, 1, 2].flatMap((row) => [0, 1, 2].map((col): [number, number] => [row, col]));

  describe('new', () => {
    it.each(validPositions)('creates a new Position (%d, %d)', (row: number, col: number) => {
      const position = Position.new(row, col);
      expect(position.row).toEqual(row);
      expect(position.col).toEqual(col);
    });

    it('throws an error if the row is invalid', () => {
      const invalidRow = fc.oneof(fc.integer({ min: -100, max: -1 }), fc.integer({ min: 3, max: 100 }));
      fc.assert(
        fc.property(invalidRow, fc.integer(), (row, col) => {
          expect(() => Position.new(row, col)).toThrow();
        }),
      );
    });
  });

  describe('toArray', () => {
    it.each(validPositions)('returns the row and column as an array (%d, %d)', (row: number, col: number) => {
      const position = Position.new(row, col);
      expect(position.toArray()).toEqual([row, col]);
    });
  })

  describe('all', () => {
    it('returns all possible positions', () => {
      const positions = Position.all();
      expect(positions).toHaveLength(validPositions.length);
      expect(positions.map(pos => pos.toArray()))
        .toEqual(expect.arrayContaining(validPositions));
    });
  });

  describe('fromIndex', () => {
    it.each(Position.all())('is inverse of toIndex (%s)', (pos: Position) => {
      const index = pos.toIndex();
      expect(Position.fromIndex(index)).toEqual(pos);
    });

    it('throws an error if the index is invalid', () => {
      const invalidIndex = fc.oneof(fc.integer({ min: -100, max: -1 }), fc.integer({ min: 9, max: 100 }));
      fc.assert(
        fc.property(invalidIndex, (index) => {
          expect(() => Position.fromIndex(index)).toThrow();
        }),
      );
    });
  });

});

describe('Board', () => {

  describe('fromArray', () => {
    it('is an inverse of toArray', () => {
      const arrayOfNineMarks = fc.array(arbitraryMark(), { minLength: 9, maxLength: 9 });
      fc.assert(
        fc.property(arrayOfNineMarks, (marks) => {
          const board = Board.fromArray(marks);
          expect(board.toArray()).toEqual(marks);
        }),
      );
    });

    it('throws an error if the array is not of length 9', () => {
      const arrayWithInvalidLength = fc.oneof(
        fc.array(arbitraryMark(), { minLength: 0, maxLength: 8 }),
        fc.array(arbitraryMark(), { minLength: 10 }),
      );
      fc.assert(
        fc.property(arrayWithInvalidLength, (marks) => {
          expect(() => Board.fromArray(marks)).toThrow();
        }),
      );
    });
  })

  describe('empty', () => {
    it('is a board with no marks', () => {
      const board = Board.empty;
      expect(board.toArray()).toEqual(Array(9).fill(null));
    });
  });

  describe('put', () => {
    test('does not change the original board', () => {
      fc.assert(
        fc.property(arbitraryBoard(), arbitraryPosition(), arbitraryPlayer(), (board, pos, mark) => {
          const boardBefore = board.toArray();
          board.set(pos, mark);
          expect(board.toArray()).toEqual(boardBefore);
        })
      );
    });

    test('changes exactly one cell', () => {
      fc.assert(
        fc.property(arbitraryBoard(), arbitraryPosition(), arbitraryPlayer(), (board, pos, mark) => {
          const newBoard = board.set(pos, mark);
          expect(newBoard.get(pos)).toEqual(mark);

          const unchangedPositions = Position.all().filter((other) => !pos.equals(other));
          for (const unchangedPos of unchangedPositions) {
            expect(newBoard.get(unchangedPos)).toEqual(board.get(unchangedPos));
          }
        })
      );
    });
  });

  describe('emptyCells', () => {
    test('all returned positions are empty', () => {
      fc.assert(
        fc.property(arbitraryBoard(), (board) => {
          const emptyCells = board.emptyCells();
          for (const pos of emptyCells) {
            expect(board.get(pos)).toBeNull();
          }
        })
      );
    });

    test('all non-returned positions have a player mark', () => {
      fc.assert(
        fc.property(arbitraryBoard(), (board) => {
          const emptyCells = board.emptyCells();
          const nonEmptyCells = Position.all().filter((p1) => !emptyCells.some((p2) => p1.equals(p2)));
          for (const pos of nonEmptyCells) {
            expect(board.get(pos)).not.toBeNull();
          }
        })
      );
    });
  });

  describe('isFull', () => {
    it('returns true if and only if no cell is empty', () => {
      fc.assert(
        fc.property(arbitraryBoard(), (board) => {
          expect(board.isFull()).toEqual(board.emptyCells().length === 0);
        })
      );
    });
  });

  describe('winningLines', () => {
    const normalizedLine = (line: Line): Line => line.sort((a: Position, b: Position) => {
      const rowDiff = a.row - b.row;
      return rowDiff === 0 ? a.col - b.col : rowDiff;
    });

    test('all returned lines are either a row, a column or a diagonal', () => {
      const isRow = ([first, ...rest]: Position[]) => rest.every((pos) => pos.row === first.row);
      const isColumn = ([first, ...rest]: Position[]) => rest.every((pos) => pos.col === first.col);
      const isDiagonal = ([p1, p2, p3]: Position[]) => {
        const [dRow, dCol] = [p2.row - p1.row, p2.col - p1.col];
        // p2 must be one row below from p1, and one column to the left or right
        if (dRow !== 1 && Math.abs(dCol) !== 1) return false;
        // p3 must be diagonally in the same direction from p2
        return p2.row + dRow === p3.row && p2.col + dCol === p3.col;
      }

      fc.assert(
        fc.property(arbitraryBoard(), fc.context(), (board, ctx) => {
          const winningLines = board.winningLines().map(normalizedLine);
          for (const line of winningLines) {
            ctx.log(`Line: ${line.map((pos) => pos.toString()).join(' ')}`);
            expect(isRow(line) || isColumn(line) || isDiagonal(line)).toBe(true);
          }
        })
      );
    });

    test('all returned lines are filled with the same mark', () => {
      fc.assert(
        fc.property(arbitraryBoard(), fc.context(), (board, ctx) => {
          const winningLines = board.winningLines().map(normalizedLine);
          for (const line of winningLines) {
            ctx.log(`Line: ${line.map((pos) => pos.toString()).join(' ')}`);
            const marks = line.map((pos) => board.get(pos));
            expect(marks.every((mark) => mark === marks[0])).toBe(true);
          }
        })
      );
    });
  });

  describe('winner', () => {

    function fillLine(board: Board, player: Player, line: Line): Board {
      for (const pos of line) {
        board = board.set(pos, player);
      }
      return board;
    }

    it('when no line is complete, returns null', () => {
      fc.assert(
        fc.property(arbitraryBoard(), (board) => {
          fc.pre(board.winningLines().length === 0);
          expect(board.winner).toBeNull();
        })
      );
    });

    it('when a single line is completed, returns the winning player', () => {
      fc.assert(
        fc.property(arbitraryBoard(), arbitraryPlayer(), arbitraryLine(), fc.context(), (startBoard, player, line, ctx) => {
          // Start with a board that doesn't have any winning lines
          fc.pre(startBoard.winningLines().length === 0);

          // Ensure we can't fill more than one line with the same player
          fc.pre(startBoard.toArray().every((mark: Mark) => mark !== player));

          const board = fillLine(startBoard, player, line);
          ctx.log(board.toString());
          expect(board.winner).toEqual(player);
        })
      );
    })

    it('returns null if multiple lines are complete with the same player', () => {
      fc.assert(
        fc.property(arbitraryBoard(), arbitraryPlayer(), arbitraryLine(), arbitraryLine(), fc.context(), (startBoard, player, line1, line2, ctx) => {
          // Start with a board that doesn't have any winning lines
          fc.pre(startBoard.winningLines().length === 0);


          // Ensure the lines are distinct
          fc.pre(!line1.every((pos, i) => pos.equals(line2[i])));

          const board = fillLine(fillLine(startBoard, player, line1), player, line2);
          ctx.log(board.toString());
          expect(board.winner).toBeNull();
        }),
      );
    });

    it('returns null if multiple lines are complete with different players', () => {
      fc.assert(
        fc.property(arbitraryBoard(), arbitraryPlayer(), arbitraryLine(), arbitraryLine(), fc.context(), (startBoard, player1, line1, line2, ctx) => {
          // Start with a board that doesn't have any winning lines
          fc.pre(startBoard.winningLines().length === 0);

          // Ensure the lines don't overlap
          fc.pre(!line1.some((pos) => line2.some((other) => pos.equals(other))));

          const board = fillLine(fillLine(startBoard, player1, line1), opponent(player1), line2);
          ctx.log(board.toString());
          expect(board.winner).toBeNull();
        }),
      );
    });
  });

  describe('hasWinner', () => {
    it('returns true if and only if there is a winner', () => {
      fc.assert(
        fc.property(arbitraryBoard(), (board) => {
          expect(board.hasWinner()).toEqual(board.winner !== null);
        })
      );
    });
  });

  describe('isTie', () => {
    it('returns true if and only if the board is full and there is no winner', () => {
      fc.assert(
        fc.property(arbitraryBoard(), (board) => {
          expect(board.isTie()).toEqual(board.isFull() && !board.hasWinner());
        })
      );
    });
  });

  describe('hasEnded', () => {
    it('is always true when isFull', () => {
      fc.assert(
        fc.property(arbitraryBoard(), (board) => {
          fc.pre(board.isFull());
          expect(board.hasEnded()).toBe(true);
        })
      );
    });

    it('is always true when hasWinner', () => {
      fc.assert(
        fc.property(arbitraryBoard(), (board) => {
          fc.pre(board.hasWinner());
          expect(board.hasEnded()).toBe(true);
        })
      );
    });

    it('is always true when isTie', () => {
      fc.assert(
        fc.property(arbitraryBoard(), (board) => {
          fc.pre(board.isTie());
          expect(board.hasEnded()).toBe(true);
        })
      );
    });

    it('is always false when not isFull, not hasWinner, and not isTie', () => {
      fc.assert(
        fc.property(arbitraryBoard(), (board) => {
          fc.pre(!board.isFull() && !board.hasWinner() && !board.isTie());
          expect(board.hasEnded()).toBe(false);
        })
      );
    });
  });
});
