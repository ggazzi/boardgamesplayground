import { describe, it, expect } from 'bun:test';
import fc from 'fast-check';

import { BoardState } from './board';
import { BOARD_SIZE } from './position';
import arbitrary from './arbitrary';

const arb = { ...fc, ...arbitrary };

describe('BoardState', () => {

  describe('fromArray', () => {
    it('is an inverse for toArray', () => {
      fc.assert(fc.property(arb.array(arb.cellState(), { minLength: BOARD_SIZE, maxLength: BOARD_SIZE }), (cells) => {
        expect(BoardState.fromArray(cells).toArray()).toEqual(cells);
      }));
    })

    it('throws an error when the array is too small', () => {
      fc.assert(fc.property(arb.array(arb.cellState(), { maxLength: BOARD_SIZE - 1 }), (cells) => {
        expect(() => BoardState.fromArray(cells)).toThrow();
      }));
    });

    it('throws an error when the array is too large', () => {
      fc.assert(fc.property(arb.array(arb.cellState(), { minLength: BOARD_SIZE + 1 }), (cells) => {
        expect(() => BoardState.fromArray(cells)).toThrow();
      }));
    });
  });

  describe('get', () => {
    it('returns the cell state at the given position', () => {
      fc.assert(fc.property(arb.boardState(), arb.position(), (state, pos) => {
        expect(state.get(pos)).toBe(state.toArray()[pos.toIndex()]);
      }));
    });
  });

  describe('set', () => {
    it('leaves the original board state unchanged', () => {
      fc.assert(fc.property(arb.boardState(), arb.position(), arb.cellState(), (state, pos, cell) => {
        const originalState = state.toArray();
        state.set(pos, cell);
        expect(state.toArray()).toEqual(originalState);
      }));
    });

    it('sets the cell state at the given position', () => {
      fc.assert(fc.property(arb.boardState(), arb.position(), arb.cellState(), (state, pos, cell) => {
        const newState = state.set(pos, cell);
        expect(newState.get(pos)).toBe(cell);
      }));
    });
  });

});
