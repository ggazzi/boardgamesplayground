import React from 'react';

import { BOARD_WIDTH, BoardState, CellState, Position } from '../../models/board';

import './styles.css';

function Board({ state }: BoardProps) {
  const style = {
    '--num-rows': BOARD_WIDTH,
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
  const parity = (position.row + position.col) % 2 === 0 ? 'even' : 'odd';
  return (
    <div className={`board-cell board-cell-${parity} mark-${state}`} />
  );
}

type CellProps = {
  position: Position;
  state: CellState;
}

export default Board;
