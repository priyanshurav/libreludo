import { describe, it, expect, assert, vi } from 'vitest';
import { expandTokenPath, getIntegersBetween } from '../../src/game/tokens/paths';
import type { TCoordinate, TPlayer, TToken, TTokenPath } from '../../src/types';
import { playerSequences } from '../../src/game/players/constants';
import { genLockedTokens } from '../../src/game/tokens/factory';
import {
  applyAlignmentData,
  defaultTokenAlignmentData,
  getTokenAlignmentData,
  tokenAlignmentData,
} from '../../src/game/tokens/alignment';
import { TOKEN_LOCKED_COORDINATES } from '../../src/game/tokens/constants';
import { DUMMY_PLAYERS } from '../fixtures/players.dummy';
import {
  getAvailableSteps,
  isAnyTokenActiveOfColour,
  isTokenMovable,
  tokensWithCoord,
} from '../../src/game/tokens/logic';
import { cloneDeep } from 'lodash-es';
import { DUMMY_TOKEN } from '../fixtures/token.dummy';
import { getHomeCoordForColour } from '../../src/game/coords/logic';

describe('Test tokens/paths', () => {
  describe('getIntegersBetween', () => {
    it('should return inclusive range from a to b when a < b', () => {
      expect(getIntegersBetween(2, 5)).toEqual([2, 3, 4, 5]);
    });

    it('should return inclusive range from a to b when a > b', () => {
      expect(getIntegersBetween(5, 2)).toEqual([5, 4, 3, 2]);
    });

    it('should return array with single element when a equals b', () => {
      expect(getIntegersBetween(3, 3)).toEqual([3]);
    });

    it('should handle inclusive negative ranges correctly', () => {
      expect(getIntegersBetween(-3, 0)).toEqual([-3, -2, -1, 0]);
    });
  });
  describe('expandTokenPath', () => {
    it('should expand a horizontal path into coordinates with the same y value', () => {
      const expected: TCoordinate[] = [
        { x: 5, y: 13 },
        { x: 4, y: 13 },
        { x: 3, y: 13 },
        { x: 2, y: 13 },
        { x: 1, y: 13 },
      ];
      expect(
        expandTokenPath([{ startCoords: { x: 5, y: 13 }, endCoords: { x: 1, y: 13 } }])
      ).toEqual(expected);
      expect(
        expandTokenPath([{ startCoords: { x: 1, y: 13 }, endCoords: { x: 5, y: 13 } }])
      ).toEqual([...expected].reverse());
    });
    it('should expand a vertical path into coordinates with the same x value', () => {
      const expected: TCoordinate[] = [
        { x: 1, y: 9 },
        { x: 1, y: 10 },
        { x: 1, y: 11 },
        { x: 1, y: 12 },
        { x: 1, y: 13 },
      ];
      expect(
        expandTokenPath([{ startCoords: { x: 1, y: 9 }, endCoords: { x: 1, y: 13 } }])
      ).toEqual(expected);
      expect(
        expandTokenPath([{ startCoords: { x: 1, y: 13 }, endCoords: { x: 1, y: 9 } }])
      ).toEqual([...expected].reverse());
    });
    it('should handle multiple token paths and concatenate the results', () => {
      const tokenPaths: TTokenPath[] = [
        {
          startCoords: { x: 6, y: 13 },
          endCoords: { x: 6, y: 9 },
        },
        {
          startCoords: { x: 5, y: 8 },
          endCoords: { x: 1, y: 8 },
        },
      ];
      const expected: TCoordinate[] = [
        { x: 6, y: 13 },
        { x: 6, y: 12 },
        { x: 6, y: 11 },
        { x: 6, y: 10 },
        { x: 6, y: 9 },
        { x: 5, y: 8 },
        { x: 4, y: 8 },
        { x: 3, y: 8 },
        { x: 2, y: 8 },
        { x: 1, y: 8 },
      ];
      expect(expandTokenPath(tokenPaths)).toEqual(expected);
    });
    it('should return an empty array for an empty input', () => {
      expect(expandTokenPath([])).toEqual([]);
    });
  });
});

describe('Test tokens/factory', () => {
  describe('genLockedTokens', () => {
    it.each(playerSequences.four)('should generate locked tokens for %s player', (colour) => {
      const lockedTokens = genLockedTokens(colour);
      expect(lockedTokens).toHaveLength(4);

      lockedTokens.forEach((t, i) => {
        const coordinateList = TOKEN_LOCKED_COORDINATES[colour];
        expect(t.colour).toBe(colour);
        expect(t.id).toBe(i);
        expect(t.hasTokenReachedHome).toBe(false);
        expect(t.isActive).toBe(false);
        expect(t.isLocked).toBe(true);
        expect(t.tokenAlignmentData).toEqual(defaultTokenAlignmentData);
        expect(t.coordinates).toBe(coordinateList[i]);
        expect(t.initialCoords).toBe(coordinateList[i]);
      });
    });
    it('should throw error if player colour is invalid', () => {
      expect(() => genLockedTokens('white' as never)).toThrowError();
    });
  });
});

describe('Test tokens/alignment', () => {
  describe('getTokenAlignmentData', () => {
    it('returns alignment data array matching the number of tokens requested', () => {
      expect(getTokenAlignmentData(3)).toEqual(tokenAlignmentData[3]);
      expect(getTokenAlignmentData(7)).toEqual(tokenAlignmentData[7]);
      expect(getTokenAlignmentData(16)).toEqual(tokenAlignmentData[16]);
    });
    it('throws error for invalid token count', () => {
      expect(() => getTokenAlignmentData(17)).toThrowError();
      expect(() => getTokenAlignmentData(0)).toThrowError();
      expect(() => getTokenAlignmentData(-1)).toThrowError();
    });
  });
  describe('applyAlignmentData', () => {
    it('should throw an error if not all tokens have the same coordinate', () => {
      const tokens: TToken[] = [
        { ...DUMMY_TOKEN, colour: 'blue', id: 0, coordinates: { x: 6, y: 11 } },
        { ...DUMMY_TOKEN, colour: 'blue', id: 1, coordinates: { x: 8, y: 13 } },
        { ...DUMMY_TOKEN, colour: 'green', id: 0, coordinates: { x: 11, y: 8 } },
      ];
      expect(() => applyAlignmentData(tokens, vi.fn())).toThrowError();
    });
  });
});

describe('Test tokens/logic', () => {
  describe('isAnyTokenActiveOfColour', () => {
    it('returns true if any player has an active token of the specified colour', () => {
      const players = cloneDeep(DUMMY_PLAYERS);
      const player = players.find((p) => p.colour === 'blue');
      player!.tokens[0].isActive = true;
      expect(isAnyTokenActiveOfColour('blue', players)).toBe(true);
    });
    it('returns false if no player has an active token of the specified colour', () => {
      const players = DUMMY_PLAYERS;
      expect(isAnyTokenActiveOfColour('blue', players)).toBe(false);
    });
    it('returns false if the specified player is missing or has no tokens', () => {
      expect(isAnyTokenActiveOfColour('white' as never, DUMMY_PLAYERS)).toBe(false);
      (cloneDeep(DUMMY_PLAYERS).find((p) => p.colour === 'blue')!.tokens as unknown as undefined) =
        undefined;
      expect(isAnyTokenActiveOfColour('blue', DUMMY_PLAYERS)).toBe(false);
    });
  });

  describe('tokensWithCoord', () => {
    it('returns all tokens from all players with the specified coordinate', () => {
      const players = cloneDeep(DUMMY_PLAYERS);
      const bluePlayerTokens = (players.find((p) => p.colour === 'blue') as TPlayer).tokens;
      const greenPlayerTokens = (players.find((p) => p.colour === 'green') as TPlayer).tokens;
      const commonCoord = { x: 6, y: 11 };

      bluePlayerTokens[0].coordinates = commonCoord;
      bluePlayerTokens[1].coordinates = commonCoord;
      greenPlayerTokens[2].coordinates = commonCoord;

      const expected = [bluePlayerTokens[0], bluePlayerTokens[1], greenPlayerTokens[2]];

      assert.sameDeepMembers(tokensWithCoord(commonCoord, players), expected);
    });
    it('returns an empty array if no tokens match the specified coordinate', () => {
      expect(tokensWithCoord({ x: 7, y: 10 }, DUMMY_PLAYERS)).toEqual([]);
    });
    it('returns an empty array if players array is empty', () => {
      expect(tokensWithCoord({ x: 7, y: 10 }, [])).toEqual([]);
    });
  });
  describe('getAvailableSteps', () => {
    it('returns the correct number of available steps for a token at a given coordinate and colour', () => {
      const token: TToken = { ...DUMMY_TOKEN, colour: 'blue', coordinates: { x: 7, y: 13 } };
      expect(getAvailableSteps(token)).toBe(5);
    });
    it('returns zero if the token is at a position with no available moves', () => {
      const token: TToken = {
        ...DUMMY_TOKEN,
        colour: 'blue',
        coordinates: getHomeCoordForColour('blue'),
      };
      expect(getAvailableSteps(token)).toBe(0);
    });
  });
  describe('isTokenMovable', () => {
    it.each([
      [true, false, false, { x: 6, y: 9 }],
      [false, true, false, { x: 6, y: 9 }],
      [false, false, true, { x: 6, y: 9 }],
      [false, false, false, { x: 7, y: 9 }],
    ])(
      'return %s if isLocked is %s and hasTokenReachedHome is %s and token is at coordinate %o',
      (expected, isLocked, hasTokenReachedHome, coordinates) => {
        const token: TToken = {
          ...DUMMY_TOKEN,
          colour: 'blue',
          coordinates,
          isLocked,
          hasTokenReachedHome,
        };
        expect(isTokenMovable(token, 5)).toBe(expected);
      }
    );
  });
});
