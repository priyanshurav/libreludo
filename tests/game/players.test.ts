import { describe, expect, it } from 'vitest';
import { playerCountToWord } from '../../src/game/players/logic';

describe('players/logic', () => {
  describe('playerCountToWord', () => {
    it('should return correct word for player counts 2, 3, and 4', () => {
      expect(playerCountToWord(2)).toBe('two');
      expect(playerCountToWord(3)).toBe('three');
      expect(playerCountToWord(4)).toBe('four');
    });
    it('should throw error for unsupported player counts', () => {
      expect(() => playerCountToWord(1)).toThrowError();
      expect(() => playerCountToWord(5)).toThrowError();
      expect(() => playerCountToWord(6)).toThrowError();
    });
  });
});
