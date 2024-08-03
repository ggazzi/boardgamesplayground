export enum Player {
  Black = 'b',
  White = 'w',
}

export function opponent(player: Player): Player {
  return player === Player.Black ? Player.White : Player.Black;
}
