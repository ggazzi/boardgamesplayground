import React, { useState } from 'react'

import { Board as BoardState, Position, Player, opponent } from '../../models/board';
import Board from '../Board';

import './styles.css';

function Game(props: GameProps) {
  const [board, setBoard] = useState(BoardState.empty);
  const [nextPlayer, setPlayer] = useState<Player | null>(Player.X);

  const restart = () => {
    setBoard(BoardState.empty);
    setPlayer(Player.X);
  }

  const handleCellClick = (pos: Position) => {
    if (nextPlayer === null) {
      return;
    }
    if (board.get(pos) !== null) {
      return;
    }

    const nextBoard = board.set(pos, nextPlayer);
    setBoard(nextBoard);
    setPlayer(nextBoard.hasEnded() ? null : opponent(nextPlayer));
  }

  const winner = board.winner;

  const gameStatus =
    winner ? `${winner} wins!` :
    board.isTie() ? 'It\'s a tie!' :
    board.hasEnded() ? 'Game ended (but why?!?)' :
      `Next player: ${nextPlayer}`;

  return (
    <div className={`game next-player-${nextPlayer || 'none'}`}>
      <Board state={board} onClick={handleCellClick} />
      <div className="game-info">
        <div>{gameStatus}</div>
        <button onClick={restart}>Restart</button>
      </div>
    </div>
  );
}

type GameProps = object;

export default Game;
