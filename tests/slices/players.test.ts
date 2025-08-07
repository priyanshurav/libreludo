import { describe, it, expect } from 'vitest';
import playersReducer, {
  activateTokens,
  changeCoordsOfToken,
  changeTurn,
  clearPlayersState,
  deactivateAllTokens,
  getPlayer,
  getToken,
  incrementNumberOfConsecutiveSix,
  initialState,
  lockToken,
  markTokenAsReachedHome,
  registerNewPlayer,
  resetNumberOfConsecutiveSix,
  setIsAnyTokenMoving,
  setPlayerInitData,
  setPlayerSequence,
  setTokenAlignmentData,
  setTokenDirection,
  unlockToken,
} from '../../src/state/slices/playersSlice';
import { cloneDeep } from 'lodash';
import { DUMMY_PLAYERS } from '../fixtures/players.dummy';
import { playerSequences } from '../../src/game/players/constants';
import type {
  TPlayerCount,
  TPlayerInitData,
  TTokenAlignmentData,
  TTokenColourAndId,
} from '../../src/types';
import { TOKEN_START_COORDINATES } from '../../src/game/tokens/constants';
import { defaultTokenAlignmentData } from '../../src/game/tokens/alignment';

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
      const newCoords = { x: 8, y: 11 };
      const tokenColourAndId: TTokenColourAndId = { colour: 'blue', id: 0 };
      const newState = playersReducer(
        initState,
        changeCoordsOfToken({ ...tokenColourAndId, newCoords })
      );
      const token = getToken(newState, tokenColourAndId.colour, tokenColourAndId.id);
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
      player.tokens[1].coordinates = { x: 7, y: 11 };

      // Should be activated
      player.tokens[2].isLocked = true;
      player.tokens[2].hasTokenReachedHome = false;

      // Should be activated
      player.tokens[3].isLocked = false;
      player.tokens[3].hasTokenReachedHome = false;
      player.tokens[3].coordinates = { x: 6, y: 11 };

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
      player.tokens[1].coordinates = { x: 7, y: 11 };

      // Should not be activated
      player.tokens[2].isLocked = true;
      player.tokens[2].hasTokenReachedHome = false;

      // Should be activated
      player.tokens[3].isLocked = false;
      player.tokens[3].hasTokenReachedHome = false;
      player.tokens[3].coordinates = { x: 6, y: 11 };

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
      const tokenColourAndId: TTokenColourAndId = { colour: 'blue', id: 0 };
      const newState = playersReducer(initState, unlockToken(tokenColourAndId));
      const newToken = getToken(newState, tokenColourAndId.colour, tokenColourAndId.id);
      expect(newToken.isLocked).toBe(false);
      expect(newToken.coordinates).toBe(TOKEN_START_COORDINATES['blue']);
    });
    it('should throw an error if the token is already unlocked', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const token = getToken(initState, 'blue', 0);
      token.isLocked = false;
      expect(() =>
        playersReducer(initState, unlockToken({ colour: token.colour, id: token.id }))
      ).toThrowError();
    });
  });
  describe('lockToken', () => {
    it('should lock the specified token and reset its coordinates to initial position', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const token = getToken(initState, 'blue', 0);
      token.isLocked = false;
      token.coordinates = { x: 6, y: 9 };
      const newState = playersReducer(initState, lockToken({ colour: token.colour, id: token.id }));
      const newToken = getToken(newState, token.colour, token.id);
      expect(newToken.isLocked).toBe(true);
      expect(newToken.coordinates).toEqual(token.initialCoords);
    });
    it('should throw an error if the token is already locked', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const token = getToken(initState, 'blue', 0);
      token.isLocked = true;
      expect(() =>
        playersReducer(initState, lockToken({ colour: token.colour, id: token.id }))
      ).toThrowError();
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
        setTokenDirection({ colour: token.colour, id: token.id, isForward: true })
      );
      expect(getToken(newState, token.colour, token.id).isDirectionForward).toBe(true);
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
  describe('markTokenAsReachedHome', () => {
    it('should mark the specified token as having reached home and lock it', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const token = getToken(initState, 'blue', 0);
      token.isLocked = false;
      token.hasTokenReachedHome = false;

      const newState = playersReducer(
        initState,
        markTokenAsReachedHome({ colour: token.colour, id: token.id })
      );

      const newToken = getToken(newState, 'blue', 0);

      expect(newToken.isLocked).toBe(true);
      expect(newToken.hasTokenReachedHome).toBe(true);
    });
    it('should not update anything if the game has already ended', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      initState.isGameEnded = true;
      const token = getToken(initState, 'blue', 0);
      token.isLocked = false;
      token.hasTokenReachedHome = false;

      const newState = playersReducer(
        initState,
        markTokenAsReachedHome({ colour: token.colour, id: token.id })
      );

      const newToken = getToken(newState, 'blue', 0);
      expect(newState.isGameEnded).toBe(true);
      expect(newToken.isLocked).toBe(false);
      expect(newToken.hasTokenReachedHome).toBe(false);
    });
    it('should not change playerSequence or finishOrder if the player still has tokens not at home', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      initState.playerSequence = playerSequences.four;
      const token = getToken(initState, 'blue', 0);
      token.isLocked = false;
      token.hasTokenReachedHome = false;
      const newState = playersReducer(
        initState,
        markTokenAsReachedHome({ colour: token.colour, id: token.id })
      );
      const newToken = getToken(newState, 'blue', 0);

      expect(newToken.isLocked).toBe(true);
      expect(newToken.hasTokenReachedHome).toBe(true);
      expect(newState.playerSequence).toEqual(initState.playerSequence);
      expect(newState.playerFinishOrder).toEqual(initState.playerFinishOrder);
    });
    it('should remove the player from playerSequence and add them to finishOrder if all tokens reached home', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      initState.playerSequence = playerSequences.four;

      let newState = initState;
      const player = getPlayer(initState, 'blue');
      player.tokens.forEach(({ colour, id }) => {
        newState = playersReducer(newState, markTokenAsReachedHome({ colour, id }));
      });

      getPlayer(newState, 'blue').tokens.forEach((t) => {
        expect(t.isLocked).toBe(true);
        expect(t.hasTokenReachedHome).toBe(true);
      });

      expect(newState.playerFinishOrder).toEqual([{ name: player.name, colour: player.colour }]);
      expect(newState.playerSequence).toEqual(initState.playerSequence.filter((c) => c !== 'blue'));
    });
    it('should end the game and add the last remaining player to finishOrder when only one player is left', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      initState.playerSequence = playerSequences.two;

      expect(initState.isGameEnded).toBe(false);

      let newState = initState;
      const player = getPlayer(initState, 'blue');
      const greenPlayer = getPlayer(initState, 'green');
      player.tokens.forEach(({ colour, id }) => {
        newState = playersReducer(newState, markTokenAsReachedHome({ colour, id }));
      });

      getPlayer(newState, 'blue').tokens.forEach((t) => {
        expect(t.isLocked).toBe(true);
        expect(t.hasTokenReachedHome).toBe(true);
      });

      expect(newState.playerFinishOrder).toEqual([
        { name: player.name, colour: player.colour },
        { name: greenPlayer.name, colour: greenPlayer.colour },
      ]);
      expect(newState.isGameEnded).toBe(true);
      expect(newState.playerSequence).toEqual(initState.playerSequence.filter((c) => c !== 'blue'));
    });
  });
  describe('setTokenAlignmentData', () => {
    it("should update the token's alignment data with the provided value", () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const token = getToken(initState, 'blue', 0);
      expect(token.tokenAlignmentData).toEqual(defaultTokenAlignmentData);
      const newAlignmentData: TTokenAlignmentData = { xOffset: 10, yOffset: 5, scaleFactor: 5 };
      const newState = playersReducer(
        initState,
        setTokenAlignmentData({ colour: token.colour, id: token.id, newAlignmentData })
      );
      const newToken = getToken(newState, token.colour, token.id);
      expect(newToken.tokenAlignmentData).toEqual(newAlignmentData);
    });
  });
  describe('setPlayerInitData', () => {
    it('should set playerInitData to the provided array of player initialization data', () => {
      const playerInitData: TPlayerInitData[] = [
        { name: 'Player 1', isBot: false },
        { name: 'Player 2', isBot: true },
        { name: 'Player 3', isBot: false },
      ];
      const newState = playersReducer(initialState, setPlayerInitData(playerInitData));
      expect(newState.playerInitData).toEqual(playerInitData);
    });
  });
  describe('clearPlayersState', () => {
    it('should clear players state', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      initState.currentPlayerColour = 'yellow';
      initState.playerSequence = playerSequences.four;
      initState.isAnyTokenMoving = true;
      initState.isGameEnded = true;
      initState.playerInitData = [{ name: 'Player 1', isBot: false }];
      initState.playerFinishOrder = [{ colour: 'green', name: 'Player 3' }];

      const newState = playersReducer(initState, clearPlayersState());

      expect(newState).toEqual(initialState);
    });
  });
});

describe('Test players helpers', () => {
  describe('getPlayer', () => {
    it('should return the player with the specified colour', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const player = getPlayer(initState, 'blue');
      expect(player.colour).toBe('blue');
    });
    it('should throw an error if the player with the specified colour does not exist', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      expect(() => getPlayer(initState, 'white' as never)).toThrowError();
    });
  });
  describe('getToken', () => {
    it('should return the token with the specified ID and colour if it exists', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      const token = getToken(initState, 'blue', 0);
      expect(token.colour).toBe('blue');
      expect(token.id).toBe(0);
    });
    it('should throw an error if the token with the specified ID does not exist for the player', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      expect(() => getToken(initState, 'blue', 15)).toThrowError();
    });
    it('should throw an error if the player with the specified colour does not exist', () => {
      const initState = cloneDeep(initialState);
      initState.players = cloneDeep(DUMMY_PLAYERS);
      expect(() => getToken(initState, 'white' as never, 0)).toThrowError();
    });
  });
});
