import { describe, it, expect } from 'bun:test';
import fc from 'fast-check';

import { Position, BOARD_WIDTH, BOARD_HEIGHT, BOARD_SIZE } from './position';
import arbitrary from './arbitrary';

const arb = { ...fc, ...arbitrary };

describe('Position', () => {

  describe('fromIndex', () => {
    it('is an inverse for toIndex', () => {
      fc.assert(fc.property(arb.integer({ min: 0, max: BOARD_SIZE - 1 }), (index) => {
        return Position.fromIndex(index).toIndex() === index;
      }));
    });

    it('throws an error when index is negative', () => {
      fc.assert(fc.property(arb.integer({ max: -1 }), (index) => {
        expect(() => Position.fromIndex(index)).toThrow();
      }));
    });

    it('throws an error when index is too large', () => {
      fc.assert(fc.property(arb.integer({ min: BOARD_SIZE }), (index) => {
        expect(() => Position.fromIndex(index)).toThrow();
      }));
    });
  })

  describe('new', () => {
    const validRow = arb.integer({ min: 0, max: BOARD_HEIGHT - 1 });
    const invalidRow = arb.oneof(fc.integer({ max: -1 }), arb.integer({ min: BOARD_HEIGHT }));

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
