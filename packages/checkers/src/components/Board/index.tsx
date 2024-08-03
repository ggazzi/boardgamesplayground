import React from 'react';

import { Position, BOARD_WIDTH, BOARD_HEIGHT } from '../../models/position';
import { BoardState, CellState } from '../../models/board';

import './styles.css';

function Board({ state }: BoardProps) {
  const style = {
    '--num-rows': BOARD_HEIGHT,
    '--num-columns': BOARD_WIDTH,
  } as React.CSSProperties;

  return (
    <div className="board" style={style}>
      {Position.all().map((pos) => (
        <Cell key={pos.toIndex()} position={pos} state={state.get(pos)} />
      ))
      }
    </div>
  );
}

type BoardProps = {
  state: BoardState;
}

function Cell({ position, state }: CellProps) {
  const parityClass = `board-cell-${(position.row + position.col) % 2 === 0 ? 'even' : 'odd'}`;
  const pieceClass = state ? `piece piece-type-${state.type} piece-player-${state.player}` : '';


  return (
    <div className={`board-cell ${parityClass} ${pieceClass}`} />
  );
}

type CellProps = {
  position: Position;
  state: CellState;
}

export default Board;
