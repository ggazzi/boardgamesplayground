import React from 'react';

import { Board as BoardState, Position, Mark } from '../../models/board';

import './styles.css';


const Cell = ({ mark }: CellProps) => {
  return (
    <div className={`board-cell mark-${mark || 'none'}`}/>
  );
};

type CellProps = {
  mark: Mark;
}

const Board = ({ state }: BoardProps) => {
  return (
    <div className="board">
      {Position.all().map((pos) => (
        <Cell key={pos.toIndex()} mark={state.get(pos)} />
      ))
      }
    </div>
  );
}

type BoardProps = {
  state: BoardState;
}

export default Board;
