import React from 'react';

import { Board as BoardState, Position, Mark } from '../../models/board';

import './styles.css';


const Cell = ({ onClick, mark }: CellProps) => {
  return (
    <div className={`board-cell mark-${mark || 'none'}`} onClick={onClick} />
  );
};

type CellProps = {
  mark: Mark;
  onClick?: () => void;
}

const Board = ({ state, onClick }: BoardProps) => {
  return (
    <div className="board">
      {Position.all().map((pos) => (
        <Cell key={pos.toIndex()} onClick={onClick ? () => onClick(pos) : undefined} mark={state.get(pos)} />
      ))
      }
    </div>
  );
}

type BoardProps = {
  state: BoardState;
  onClick?: (pos: Position) => void;
}

export default Board;
