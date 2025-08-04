import { describe, it, expect } from 'vitest';
import playersReducer, {
  activateTokens,
  changeCoordsOfToken,
  changeTurn,
  deactivateAllTokens,
  getPlayer,
  getToken,
  incrementNumberOfConsecutiveSix,
  initialState,
  lockToken,
  registerNewPlayer,
  resetNumberOfConsecutiveSix,
  setIsAnyTokenMoving,
  setPlayerSequence,
  setTokenDirection,
  unlockToken,
} from '../../src/state/slices/playersSlice';
import { cloneDeep } from 'lodash';
import { DUMMY_PLAYERS } from '../fixtures/players.dummy';
import { playerSequences } from '../../src/game/players/constants';
import type { TPlayerCount } from '../../src/types';
import { TOKEN_START_COORDINATES } from '../../src/game/tokens/constants';

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

      // Should not be activated
      player.tokens[0].isLocked = true;
      player.tokens[0].hasTokenReachedHome = true;

      // Should not be activated
      player.tokens[1].isLocked = false;
      player.tokens[1].hasTokenReachedHome = false;
      player.tokens[1].coordinates = { x: 7, y: 3 };

      // Should not be activated
      player.tokens[2].isLocked = true;
      player.tokens[2].hasTokenReachedHome = false;

      // Should be activated
      player.tokens[3].isLocked = false;
      player.tokens[3].hasTokenReachedHome = false;
      player.tokens[3].coordinates = { x: 6, y: 3 };

      const newState = playersReducer(
        initState,
        activateTokens({ all: false, colour: 'blue', diceNumber: 5 })
      );

      const newPlayer = getPlayer(newState, 'blue');

      expect(newPlayer.tokens[0].isActive).toBe(false);
      expect(newPlayer.tokens[1].isActive).toBe(false);
      expect(newPlayer.tokens[2].isActive).toBe(false);
      expect(newPlayer.tokens[3].isActive).toBe(true);
    });
    it('should not activate any tokens if none meet the movement criteria', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const newState = playersReducer(
        initState,
        activateTokens({ all: false, colour: 'blue', diceNumber: 5 })
      );
      const newPlayer = getPlayer(newState, 'blue');
      newPlayer.tokens.forEach((t) => {
        expect(t.isActive).toBe(false);
      });
    });
    it('should activate tokens only for the player with the specified colour', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      getPlayer(initState, 'blue').tokens.forEach((t) => {
        t.isLocked = false;
        t.hasTokenReachedHome = false;
        t.coordinates = TOKEN_START_COORDINATES['blue'];
      });
      const newState = playersReducer(
        initState,
        activateTokens({ all: false, colour: 'blue', diceNumber: 5 })
      );

      const allTokens = newState.players.flatMap((p) => p.tokens);

      allTokens.forEach((t) => {
        if (t.colour === 'blue') expect(t.isActive).toBe(true);
        else expect(t.isActive).toBe(false);
      });
    });
  });
  describe('deactivateAllTokens', () => {
    it('should deactivate all tokens for the specified player colour', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      getPlayer(initState, 'blue').tokens.forEach((t) => (t.isActive = true));
      const newState = playersReducer(initState, deactivateAllTokens('blue'));
      const newTokens = getPlayer(newState, 'blue').tokens;
      expect(newTokens).toHaveLength(4);
      expect(newTokens.every((t) => !t.isActive)).toBe(true);
    });
  });
  describe('unlockToken', () => {
    it('should unlock the specified token and set its coordinates to the start position', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const newState = playersReducer(initState, unlockToken({ colour: 'blue', id: 0 }));
      const newToken = getToken(newState, 'blue', 0);
      expect(newToken.isLocked).toBe(false);
      expect(newToken.coordinates).toBe(TOKEN_START_COORDINATES['blue']);
    });
    it('should throw an error if the token is already unlocked', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      getToken(initState, 'blue', 0).isLocked = false;
      expect(() =>
        playersReducer(initState, unlockToken({ colour: 'blue', id: 0 }))
      ).toThrowError();
    });
  });
  describe('lockToken', () => {
    it('should lock the specified token and reset its coordinates to initial position', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const token = getToken(initState, 'blue', 0);
      token.isLocked = false;
      token.coordinates = { x: 6, y: 5 };
      const newState = playersReducer(initState, lockToken({ colour: 'blue', id: 0 }));
      const newToken = getToken(newState, 'blue', 0);
      expect(newToken.isLocked).toBe(true);
      expect(newToken.coordinates).toEqual(token.initialCoords);
    });
    it('should throw an error if the token is already locked', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const token = getToken(initState, 'blue', 0);
      token.isLocked = true;
      expect(() => playersReducer(initState, lockToken({ colour: 'blue', id: 0 }))).toThrowError();
    });
  });
  describe('setTokenDirection', () => {
    it('should update the direction of the specified token based on isForward value', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const token = getToken(initState, 'blue', 0);
      token.isDirectionForward = false;
      const newState = playersReducer(
        initState,
        setTokenDirection({ colour: 'blue', id: 0, isForward: true })
      );
      expect(getToken(newState, 'blue', 0).isDirectionForward).toBe(true);
    });
  });
  describe('incrementNumberOfConsecutiveSix', () => {
    it('should increment numberOfConsecutiveSix for the specified player', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      getPlayer(initState, 'blue').numberOfConsecutiveSix = 0;
      const newState = playersReducer(initState, incrementNumberOfConsecutiveSix('blue'));
      expect(getPlayer(newState, 'blue').numberOfConsecutiveSix).toBe(1);
    });
  });
  describe('resetNumberOfConsecutiveSix', () => {
    it('should reset numberOfConsecutiveSix to zero for the specified player', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      getPlayer(initState, 'blue').numberOfConsecutiveSix = 3;
      const newState = playersReducer(initState, resetNumberOfConsecutiveSix('blue'));
      expect(getPlayer(newState, 'blue').numberOfConsecutiveSix).toBe(0);
    });
  });
  describe('setIsAnyTokenMoving', () => {
    it('should set isAnyTokenMoving to the provided boolean value', () => {
      const initState = cloneDeep(initialState);
      initState.isAnyTokenMoving = false;
      const newState = playersReducer(initState, setIsAnyTokenMoving(true));
      expect(newState.isAnyTokenMoving).toBe(true);
    });
  });
});
