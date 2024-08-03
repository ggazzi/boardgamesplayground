import { describe, it, test, expect } from 'bun:test';
import fc from 'fast-check';

import { Position, Mark, Board, Player } from './board';

const arbitraryPlayer = fc.constantFrom(Player.X, Player.O);
const arbitraryMark = fc.constantFrom(Player.X, Player.O, null);
const arbitraryPosition = fc.tuple(fc.nat(2), fc.nat(2)).map(([row, col]) => Position.new(row, col));
const arbitraryBoard = fc.array(arbitraryMark, { minLength: 9, maxLength: 9 }).map(Board.fromArray);


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
      const arrayOfNineMarks = fc.array(arbitraryMark, { minLength: 9, maxLength: 9 });
      fc.assert(
        fc.property(arrayOfNineMarks, (marks) => {
          const board = Board.fromArray(marks);
          expect(board.toArray()).toEqual(marks);
        }),
      );
    });

    it('throws an error if the array is not of length 9', () => {
      const arrayWithInvalidLength = fc.oneof(
        fc.array(arbitraryMark, { minLength: 0, maxLength: 8 }),
        fc.array(arbitraryMark, { minLength: 10 }),
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
        fc.property(arbitraryBoard, arbitraryPosition, arbitraryPlayer, (board, pos, mark) => {
          const boardBefore = board.toArray();
          board.set(pos, mark);
          expect(board.toArray()).toEqual(boardBefore);
        })
      );
    });

    test('changes exactly one cell', () => {
      fc.assert(
        fc.property(arbitraryBoard, arbitraryPosition, arbitraryPlayer, (board, pos, mark) => {
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

});
