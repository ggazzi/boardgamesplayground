import fc from 'fast-check';

import { BOARD_SIZE, Position } from './position';
import { Player } from './player';
import { Piece } from './piece';
import { BoardState, CellState } from './board';

function position(): fc.Arbitrary<Position> {
  return fc.nat(BOARD_SIZE - 1).map(Position.fromIndex);
}

function player(): fc.Arbitrary<Player> {
  return fc.constantFrom(Player.Black, Player.White);
}

function piece(): fc.Arbitrary<Piece> {
  return fc.record({
    type: fc.constantFrom('man', 'king'),
    player: player(),
  });
}

function cellState(): fc.Arbitrary<CellState> {
  return fc.oneof(piece(), fc.constant(null));
}

function boardState(): fc.Arbitrary<BoardState> {
  return fc.array(cellState(), { minLength: BOARD_SIZE, maxLength: BOARD_SIZE }).map(BoardState.fromArray);
}

export default {
  position,
  player,
  piece,
  cellState,
  boardState,
};
