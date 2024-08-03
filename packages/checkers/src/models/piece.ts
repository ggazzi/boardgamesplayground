import { Player } from "./player";

export type Piece = {
  type: 'man' | 'king';
  player: Player;
};
