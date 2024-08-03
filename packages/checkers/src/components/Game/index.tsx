import React, { useState } from 'react'

import { Player, opponent } from '../../models/player';
import { BoardState } from '../../models/board';
import Board from '../Board';

import './styles.css';

function Game() {
  const [board, setBoard] = useState(BoardState.empty);
  const [nextPlayer, setPlayer] = useState<Player | null>(Player.White);

  const restart = () => {
    setBoard(BoardState.empty);
    setPlayer(Player.White);
  };

  const gameStatus = "TODO";

  return (
    <div className={`game`}>
      <Board state={board} />
      <div className="game-info">
        <div>{gameStatus}</div>
        <button onClick={restart}>Restart</button>
      </div>
    </div>
  );
}

export default Game;
