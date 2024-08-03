import { describe, it, test, expect } from 'bun:test';
import fastCheck from 'fast-check';

import { Position, BOARD_WIDTH } from './board';

export const arbitrary = Object.freeze({
  position(): fc.Arbitrary<Position> {
    return fc.nat(BOARD_WIDTH * BOARD_WIDTH - 1).map(Position.fromIndex);
  }
})

const fc = { ...fastCheck, ...arbitrary };


describe('Position', () => {

  describe('fromIndex', () => {
    it('is an inverse for toIndex', () => {
      fc.assert(fc.property(fc.integer({ min: 0, max: BOARD_WIDTH * BOARD_WIDTH - 1 }), (index) => {
        return Position.fromIndex(index).toIndex() === index;
      }));
    });

    it('throws an error when index is negative', () => {
      fc.assert(fc.property(fc.integer({ max: -1 }), (index) => {
        expect(() => Position.fromIndex(index)).toThrow();
      }));
    });

    it('throws an error when index is too large', () => {
      fc.assert(fc.property(fc.integer({ min: BOARD_WIDTH * BOARD_WIDTH }), (index) => {
        expect(() => Position.fromIndex(index)).toThrow();
      }));
    });
  })

  describe('new', () => {
    const validRow = fc.integer({ min: 0, max: BOARD_WIDTH - 1 });
    const invalidRow = fc.oneof(fc.integer({ max: -1 }), fc.integer({ min: BOARD_WIDTH }));

    const validCol = fc.integer({ min: 0, max: BOARD_WIDTH - 1 });
    const invalidCol = fc.oneof(fc.integer({ max: -1 }), fc.integer({ min: BOARD_WIDTH }));

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
      fc.assert(fc.property(fc.position(), (pos: Position) => {
        expect(pos.toArray()).toEqual([pos.row, pos.col]);
      }));
    });
  });

});
