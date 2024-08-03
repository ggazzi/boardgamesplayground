import { useState } from 'react'

import { Player } from '../../models/player';
import { Position } from '../../models/position';
import { BoardState } from '../../models/board';
import Board from '../Board';

import './styles.css';

const INITIAL_BOARD = BoardState.empty()
  .set(Position.new(0, 0), { type: 'man', player: Player.White })
  .set(Position.new(3, 0), { type: 'king', player: Player.Black })

const INITIAL_PLAYER = Player.White;

function Game() {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [nextPlayer, setPlayer] = useState<Player | null>(INITIAL_PLAYER);

  const restart = () => {
    setBoard(INITIAL_BOARD);
    setPlayer(INITIAL_PLAYER);
  };

  const gameStatus = `Next player: ${nextPlayer}`;

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
