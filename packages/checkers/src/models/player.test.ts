import { describe, it, expect } from 'bun:test';

import { Player, opponent } from './player';

describe('Player', () => {
  const PLAYERS = [Player.Black, Player.White];

  describe('opponent', () => {
    it.each(PLAYERS)('opponent should be involutive (%s)', (player: Player) => {
      expect(opponent(opponent(player))).toBe(player);
    });

    it.each(PLAYERS)('opponent should be different from player (%s)', (player: Player) => {
      expect(opponent(player)).not.toBe(player);
    });
  });
});
