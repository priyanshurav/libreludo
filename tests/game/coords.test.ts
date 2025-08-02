import { describe, it, expect } from 'vitest';
import {
  areCoordsEqual,
  areTokensOnOverlappingPaths,
  getDistanceBetweenTokens,
  getDistanceInTokenPath,
  getHomeCoordForColour,
  isAheadInTokenPath,
  isCoordASafeSpot,
  isCoordInHomeEntryPathForColour,
} from '../../src/game/coords/logic';
import { playerSequences } from '../../src/game/players/constants';
import { tokenPaths } from '../../src/game/tokens/paths';
import { TOKEN_SAFE_COORDINATES } from '../../src/game/tokens/constants';
import { DUMMY_TOKEN } from '../fixtures/token.dummy';
import type { TToken } from '../../src/types';

describe('coords/logic', () => {
  describe('areCoordsEqual', () => {
    it('returns true when coordinates are equal', () => {
      expect(areCoordsEqual({ x: 3, y: 5 }, { x: 3, y: 5 })).toBe(true);
    });
    it('returns false when coordinates are not equal', () => {
      expect(areCoordsEqual({ x: 3, y: 5 }, { x: 4, y: 7 })).toBe(false);
    });
  });
  describe('getHomeCoordForColour', () => {
    it.each(playerSequences.four)('returns correct home coordinate for %s player', (colour) => {
      const tokenPath = tokenPaths[colour];
      expect(getHomeCoordForColour(colour)).to.deep.equal(tokenPath[tokenPath.length - 1]);
    });
    it('throws an error for invalid player colour', () => {
      expect(() => getHomeCoordForColour('black' as never)).toThrowError();
    });
  });
  describe('isCoordASafeSpot', () => {
    it.each(TOKEN_SAFE_COORDINATES)('returns true for safe spot at %o', (coord) => {
      expect(isCoordASafeSpot(coord)).toBe(true);
    });
    it.each([
      { x: 6, y: 4 },
      { x: 11, y: 8 },
      { x: 10, y: 6 },
    ])('returns false for non-safe spot at %o', (coord) => {
      expect(isCoordASafeSpot(coord)).toBe(false);
    });
  });
  describe('isAheadInTokenPath', () => {
    it('returns true if token1 is ahead of token2', () => {
      const token1: TToken = { ...DUMMY_TOKEN, colour: 'blue', coordinates: { x: 8, y: 1 } };
      const token2: TToken = { ...DUMMY_TOKEN, colour: 'green', coordinates: { x: 12, y: 6 } };
      expect(isAheadInTokenPath(token1, token2)).toBe(true);
    });
    it('returns false if token1 is behind token2', () => {
      const token1: TToken = { ...DUMMY_TOKEN, colour: 'blue', coordinates: { x: 8, y: 1 } };
      const token2: TToken = { ...DUMMY_TOKEN, colour: 'green', coordinates: { x: 12, y: 6 } };
      expect(isAheadInTokenPath(token2, token1)).toBe(false);
    });
    it('returns false if token1 is the same as token2', () => {
      const token1: TToken = { ...DUMMY_TOKEN, colour: 'blue', coordinates: { x: 8, y: 1 } };
      expect(isAheadInTokenPath(token1, token1)).toBe(false);
    });
    it('returns false when token coordinates do not overlap across token paths', () => {
      expect(
        isAheadInTokenPath(
          { ...DUMMY_TOKEN, colour: 'green', coordinates: { x: 2, y: 8 } },
          { ...DUMMY_TOKEN, colour: 'red', coordinates: { x: 0, y: 6 } }
        )
      ).toBe(false);
    });
  });
  describe('areTokenCoordsOverlapping', () => {
    it('returns true when token1 and token2 have overlapping coordinates in their remaining paths', () => {
      const token1: TToken = { ...DUMMY_TOKEN, colour: 'blue', coordinates: { x: 8, y: 1 } };
      const token2: TToken = { ...DUMMY_TOKEN, colour: 'green', coordinates: { x: 12, y: 6 } };
      expect(areTokensOnOverlappingPaths(token1, token2)).toBe(true);
    });
    it('returns false when token1 and token2 do not share any coordinates in their remaining paths', () => {
      const token1: TToken = { ...DUMMY_TOKEN, colour: 'green', coordinates: { x: 2, y: 8 } };
      const token2: TToken = { ...DUMMY_TOKEN, colour: 'red', coordinates: { x: 0, y: 6 } };
      expect(areTokensOnOverlappingPaths(token2, token1)).toBe(false);
    });
    it('returns true when token1 and token2 are currently on the same coordinate', () => {
      const token1: TToken = { ...DUMMY_TOKEN, colour: 'green', coordinates: { x: 2, y: 8 } };
      const token2: TToken = { ...DUMMY_TOKEN, colour: 'red', coordinates: { x: 2, y: 8 } };
      expect(areTokensOnOverlappingPaths(token2, token1)).toBe(true);
    });
    it('returns false when one token has no remaining path and paths do not overlap', () => {
      const token1: TToken = {
        ...DUMMY_TOKEN,
        colour: 'green',
        coordinates: getHomeCoordForColour('green'),
      };
      const token2: TToken = { ...DUMMY_TOKEN, colour: 'red', coordinates: { x: 2, y: 8 } };
      expect(areTokensOnOverlappingPaths(token2, token1)).toBe(false);
    });
  });
  describe('isCoordInHomeEntryPathForColour', () => {
    it('returns true when the coordinate is in the home entry path for the given colour', () => {
      expect(isCoordInHomeEntryPathForColour({ x: 7, y: 2 }, 'blue')).toBe(true);
    });
    it('returns false when the coordinate is not in the home entry path for the given colour', () => {
      expect(isCoordInHomeEntryPathForColour({ x: 6, y: 2 }, 'blue')).toBe(false);
    });
    it("returns false when the coordinate is in another colour's home entry path", () => {
      expect(isCoordInHomeEntryPathForColour({ x: 7, y: 2 }, 'green')).toBe(false);
    });
  });
  describe('getDistanceBetweenTokens', () => {
    it('returns 0 when both tokens are on the same coordinate', () => {
      const token1: TToken = { ...DUMMY_TOKEN, colour: 'green', coordinates: { x: 0, y: 6 } };
      const token2: TToken = { ...DUMMY_TOKEN, colour: 'red', coordinates: { x: 0, y: 6 } };
      expect(getDistanceBetweenTokens(token1, token2)).toBe(0);
    });
    it('returns correct positive distance when token1 is ahead of token2, including wrapped paths', () => {
      const token1: TToken = { ...DUMMY_TOKEN, colour: 'green', coordinates: { x: 0, y: 7 } };
      const token2: TToken = { ...DUMMY_TOKEN, colour: 'red', coordinates: { x: 5, y: 6 } };
      expect(getDistanceBetweenTokens(token1, token2)).toBe(6);
      expect(getDistanceBetweenTokens(token2, token1)).toBe(6);
    });
    it('returns -1 when tokens are on separate paths with no shared coordinates', () => {
      const token1: TToken = { ...DUMMY_TOKEN, colour: 'green', coordinates: { x: 2, y: 8 } };
      const token2: TToken = { ...DUMMY_TOKEN, colour: 'red', coordinates: { x: 0, y: 6 } };
      expect(getDistanceBetweenTokens(token1, token2)).toBe(-1);
      expect(getDistanceBetweenTokens(token2, token1)).toBe(-1);
    });
  });
  describe('getDistanceInTokenPath', () => {
    it('returns correct positive distance between initial and target coords', () => {
      const initialCoord = { x: 8, y: 3 };
      const targetCoord = { x: 7, y: 0 };
      expect(getDistanceInTokenPath('blue', initialCoord, targetCoord)).toBe(4);
      expect(getDistanceInTokenPath('blue', targetCoord, initialCoord)).toBe(4);
    });
    it('returns -1 if the initial, target, or both coordinates are invalid', () => {
      expect(getDistanceInTokenPath('blue', { x: 45, y: 3 }, { x: 7, y: 0 })).toBe(-1);
      expect(getDistanceInTokenPath('blue', { x: 6, y: 3 }, { x: 47, y: 0 })).toBe(-1);
      expect(getDistanceInTokenPath('blue', { x: 45, y: 3 }, { x: 47, y: 0 })).toBe(-1);
    });
  });
});
