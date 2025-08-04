import { describe, it, expect } from 'vitest';
import playersReducer, {
  activateTokens,
  changeCoordsOfToken,
  changeTurn,
  getPlayer,
  getToken,
  initialState,
  registerNewPlayer,
  setPlayerSequence,
} from '../../src/state/slices/playersSlice';
import { cloneDeep } from 'lodash';
import { DUMMY_PLAYERS } from '../fixtures/players.dummy';
import { playerSequences } from '../../src/game/players/constants';
import type { TPlayerCount } from '../../src/types';

describe('Test players slice reducers', () => {
  describe('registerNewPlayer', () => {
    it('should add a new player when the colour is not already taken', () => {
      const playerInitData = { name: 'Player 1', colour: 'blue', isBot: false };
      const newState = playersReducer(initialState, registerNewPlayer(playerInitData as never));
      expect(newState.players).toHaveLength(1);
      const player = getPlayer(newState, 'blue');
      expect(player.name).toBe(playerInitData.name);
      expect(player.colour).toBe(playerInitData.colour);
      expect(player.isBot).toBe(false);
      expect(player.tokens).toHaveLength(4);
      expect(player.numberOfConsecutiveSix).toBe(0);
    });
    it('should throw an error if a player with the same colour already exists', () => {
      const playerInitData = { name: 'Player 1', colour: 'blue', isBot: false };
      const newState = playersReducer(initialState, registerNewPlayer(playerInitData as never));
      expect(() =>
        playersReducer(newState, registerNewPlayer(playerInitData as never))
      ).toThrowError();
    });
  });
  describe('changeCoordsOfToken', () => {
    it('should update the coordinates of the specified token for the given player colour', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const newCoords = { x: 8, y: 3 };
      const newState = playersReducer(
        initState,
        changeCoordsOfToken({ colour: 'blue', id: 0, newCoords })
      );
      const token = getToken(newState, 'blue', 0);
      expect(token.coordinates).toEqual(newCoords);
    });
  });
  describe('changeTurn', () => {
    it("should set currentPlayerColour to 'blue' if no turn has started", () => {
      const newState = playersReducer(initialState, changeTurn());
      expect(initialState.currentPlayerColour).toBeNull();
      expect(newState.currentPlayerColour).toBe('blue');
    });
    it('should update currentPlayerColour to the next in playerSequence', () => {
      const initData = cloneDeep(initialState);
      initData.playerSequence = playerSequences.four;
      initData.currentPlayerColour = initData.playerSequence[0];
      const newState = playersReducer(initData, changeTurn());
      expect(newState.currentPlayerColour).toBe(initData.playerSequence[1]);
    });
    it('should cycle to the first player if current player is the last in sequence', () => {
      const initData = cloneDeep(initialState);
      initData.playerSequence = playerSequences.four;
      initData.currentPlayerColour = initData.playerSequence[initData.playerSequence.length - 1];
      const newState = playersReducer(initData, changeTurn());
      expect(newState.currentPlayerColour).toBe(initData.playerSequence[0]);
    });
  });
  describe('setPlayerSequence', () => {
    it.each(Object.keys(playerSequences) as TPlayerCount[])(
      'should set correct playerSequence for player count %s',
      (playerCount) => {
        expect(
          playersReducer(initialState, setPlayerSequence({ playerCount })).playerSequence
        ).toEqual(playerSequences[playerCount]);
      }
    );
  });
  describe('activateTokens', () => {
    it("should activate all eligible tokens when 'all' is true and movement is possible", () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const player = getPlayer(initState, 'blue');

      // Should not be activated
      player.tokens[0].isLocked = true;
      player.tokens[0].hasTokenReachedHome = true;

      // Should not be activated
      player.tokens[1].isLocked = false;
      player.tokens[1].hasTokenReachedHome = false;
      player.tokens[1].coordinates = { x: 7, y: 3 };

      // Should be activated
      player.tokens[2].isLocked = true;
      player.tokens[2].hasTokenReachedHome = false;

      // Should be activated
      player.tokens[3].isLocked = false;
      player.tokens[3].hasTokenReachedHome = false;
      player.tokens[3].coordinates = { x: 6, y: 3 };

      const newState = playersReducer(
        initState,
        activateTokens({ all: true, colour: 'blue', diceNumber: 5 })
      );

      const newPlayer = getPlayer(newState, 'blue');

      expect(newPlayer.tokens[0].isActive).toBe(false);
      expect(newPlayer.tokens[1].isActive).toBe(false);
      expect(newPlayer.tokens[2].isActive).toBe(true);
      expect(newPlayer.tokens[3].isActive).toBe(true);
    });
    it("should activate only tokens that can move based on dice number when 'all' is false", () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const player = getPlayer(initState, 'blue');

      // player.tokens[0].
    });
    it('should not activate any tokens if none meet the movement criteria', () => {});
    it('should activate tokens only for the player with the specified colour', () => {});
  });
});
