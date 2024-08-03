import { describe, it, expect } from 'bun:test';
import fc from 'fast-check';

import { CellState, BoardState } from './board';
import { BOARD_WIDTH } from './position';
import { Piece } from './piece';

import position from './position.test';
import player from './player.test';

const BOARD_ARRAY_SIZE = BOARD_WIDTH * BOARD_WIDTH;

const arbi = { ...fc, ...player, ...position };

function arbPiece(): fc.Arbitrary<Piece> {
  return fc.record({
    type: fc.constantFrom('man', 'king'),
    player: arbi.player(),
  });
}

function arbCellState(): fc.Arbitrary<CellState> {
  return arbi.oneof(arbPiece(), arbi.constant(null));
}

function arbBoardState(): fc.Arbitrary<BoardState> {
  return arbi.array(arbCellState(), { minLength: BOARD_ARRAY_SIZE, maxLength: BOARD_ARRAY_SIZE }).map(BoardState.fromArray);
}

const arbitrary = {
  piece: arbPiece,
  cellState: arbCellState,
  boardState: arbBoardState,
};

export default arbitrary;
const arb = { ...arbi, ...arbitrary };

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
