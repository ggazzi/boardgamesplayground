import { describe, it, expect } from 'bun:test';
import fc from 'fast-check';

import { Player, opponent } from './player';

export default {
  player(): fc.Arbitrary<Player> {
    return fc.constantFrom(Player.Black, Player.White);
  }
};

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
