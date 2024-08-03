import { describe, it, test, expect } from 'bun:test';
import fc from 'fast-check';

import { Position, BOARD_WIDTH, CellState, BoardState } from './board';
import player from './player.test';
import { Player } from './player';

const BOARD_ARRAY_SIZE = BOARD_WIDTH * BOARD_WIDTH;

const arbi = { ...fc, ...player };

function arbPosition(): fc.Arbitrary<Position> {
  return arbi.nat(BOARD_ARRAY_SIZE - 1).map(Position.fromIndex);
}

function arbCellState(): fc.Arbitrary<CellState> {
  return arbi.constantFrom(Player.Black, Player.White, null);
}

const arbitrary = {
  position: arbPosition,
  cellState: arbCellState,
};

export default arbitrary;
const arb = { ...arbi, ...arbitrary };

describe('Position', () => {

  describe('fromIndex', () => {
    it('is an inverse for toIndex', () => {
      fc.assert(fc.property(arb.integer({ min: 0, max: BOARD_WIDTH * BOARD_WIDTH - 1 }), (index) => {
        return Position.fromIndex(index).toIndex() === index;
      }));
    });

    it('throws an error when index is negative', () => {
      fc.assert(fc.property(arb.integer({ max: -1 }), (index) => {
        expect(() => Position.fromIndex(index)).toThrow();
      }));
    });

    it('throws an error when index is too large', () => {
      fc.assert(fc.property(arb.integer({ min: BOARD_WIDTH * BOARD_WIDTH }), (index) => {
        expect(() => Position.fromIndex(index)).toThrow();
      }));
    });
  })

  describe('new', () => {
    const validRow = arb.integer({ min: 0, max: BOARD_WIDTH - 1 });
    const invalidRow = arb.oneof(fc.integer({ max: -1 }), arb.integer({ min: BOARD_WIDTH }));

    const validCol = arb.integer({ min: 0, max: BOARD_WIDTH - 1 });
    const invalidCol = arb.oneof(fc.integer({ max: -1 }), arb.integer({ min: BOARD_WIDTH }));

    it('creates a position from the row and column', () => {
      fc.assert(fc.property(validRow, validCol, (row, col) => {
        const pos = Position.new(row, col);
        expect(pos.row).toBe(row);
        expect(pos.col).toBe(col);
      }));
    });

    it('throws an error when row is invalid', () => {
      fc.assert(fc.property(invalidRow, validCol, (row, col) => {
        expect(() => Position.new(row, col)).toThrow();
      }));
    });

    it('throws an error when col is invalid', () => {
      fc.assert(fc.property(validRow, invalidCol, (row, col) => {
        expect(() => Position.new(row, col)).toThrow();
      }));
    });
  });

  describe('toArray', () => {
    it('returns the row and column as an array', () => {
      fc.assert(fc.property(arb.position(), (pos: Position) => {
        expect(pos.toArray()).toEqual([pos.row, pos.col]);
      }));
    });
  });

});

describe('BoardState', () => {

  describe('fromArray', () => {
    const ARRAY_SIZE = BOARD_WIDTH * BOARD_WIDTH;
    it('is an inverse for toArray', () => {
      fc.assert(fc.property(arb.array(arb.cellState(), { minLength: ARRAY_SIZE, maxLength: ARRAY_SIZE }), (cells) => {
        expect(BoardState.fromArray(cells).toArray()).toEqual(cells);
      }));
    })

    it('throws an error when the array is too small', () => {
      fc.assert(fc.property(arb.array(arb.cellState(), { maxLength: ARRAY_SIZE - 1 }), (cells) => {
        expect(() => BoardState.fromArray(cells)).toThrow();
      }));
    });

    it('throws an error when the array is too large', () => {
      fc.assert(fc.property(arb.array(arb.cellState(), { minLength: ARRAY_SIZE + 1 }), (cells) => {
        expect(() => BoardState.fromArray(cells)).toThrow();
      }));
    });
  });

});
