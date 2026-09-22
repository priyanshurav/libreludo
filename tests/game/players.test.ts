import { describe, expect, it } from 'vitest';
import { getNextPlayer, playerCountToWord } from '../../src/game/players/logic';
import type { TPlayerColour, TPlayerNameAndColour } from '../../src/types';

describe('Test players/logic', () => {
  describe('playerCountToWord', () => {
    it('should return correct word for player counts 2, 3, and 4', () => {
      expect(playerCountToWord(2)).toBe('two');
      expect(playerCountToWord(3)).toBe('three');
      expect(playerCountToWord(4)).toBe('four');
    });
    it('should throw error for unsupported player counts', () => {
      expect(() => playerCountToWord(1)).toThrow();
      expect(() => playerCountToWord(5)).toThrow();
      expect(() => playerCountToWord(6)).toThrow();
    });
  });
  describe('getNextPlayer', () => {
    const fourPlayers: TPlayerColour[] = ['blue', 'red', 'green', 'yellow'];
    const threePlayers: TPlayerColour[] = ['blue', 'red', 'green'];
    const twoPlayers: TPlayerColour[] = ['blue', 'green'];

    it('advances to the immediately next player when no players are finished', () => {
      expect(getNextPlayer(fourPlayers, [], 'blue')).toBe('red');
      expect(getNextPlayer(fourPlayers, [], 'red')).toBe('green');
    });

    it('wraps around to the beginning of the sequence', () => {
      expect(getNextPlayer(fourPlayers, [], 'yellow')).toBe('blue');
      expect(getNextPlayer(twoPlayers, [], 'green')).toBe('blue');
    });

    it('skips a single finished player in the middle of the sequence', () => {
      const finished: TPlayerNameAndColour[] = [{ name: 'Player 2', colour: 'red' }];
      expect(getNextPlayer(fourPlayers, finished, 'blue')).toBe('green');
    });

    it('skips multiple consecutive finished players', () => {
      const finished: TPlayerNameAndColour[] = [
        { name: 'Player 2', colour: 'red' },
        { name: 'Player 3', colour: 'green' },
      ];
      expect(getNextPlayer(fourPlayers, finished, 'blue')).toBe('yellow');
    });

    it('wraps around the sequence boundary while skipping finished players', () => {
      const finished: TPlayerNameAndColour[] = [
        { name: 'Player 1', colour: 'blue' },
        { name: 'Player 2', colour: 'red' },
      ];
      expect(getNextPlayer(fourPlayers, finished, 'yellow')).toBe('green');
    });

    it('correctly advances when the current player has just finished their own game', () => {
      const finished: TPlayerNameAndColour[] = [{ name: 'Player 1', colour: 'blue' }];
      expect(getNextPlayer(fourPlayers, finished, 'blue')).toBe('red');
    });

    it('returns the current player if they are the only one left not finished', () => {
      const finished: TPlayerNameAndColour[] = [
        { name: 'Player 2', colour: 'red' },
        { name: 'Player 3', colour: 'green' },
        { name: 'Player 4', colour: 'yellow' },
      ];
      expect(getNextPlayer(fourPlayers, finished, 'blue')).toBe('blue');
    });

    it('handles variable player counts seamlessly', () => {
      const finished: TPlayerNameAndColour[] = [{ name: 'Player 2', colour: 'red' }];
      expect(getNextPlayer(threePlayers, finished, 'blue')).toBe('green');
      expect(getNextPlayer(threePlayers, finished, 'green')).toBe('blue');
    });

    it('returns null if all players in the sequence are finished', () => {
      const finished: TPlayerNameAndColour[] = [
        { name: 'Player 1', colour: 'blue' },
        { name: 'Player 2', colour: 'red' },
        { name: 'Player 3', colour: 'green' },
        { name: 'Player 4', colour: 'yellow' },
      ];
      expect(getNextPlayer(fourPlayers, finished, 'blue')).toBeNull();
    });
  });
});
