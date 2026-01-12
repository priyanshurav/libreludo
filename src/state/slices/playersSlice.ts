import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { genLockedTokens } from '../../game/tokens/factory';
import { ERRORS } from '../../utils/errors';
import { TOKEN_START_COORDINATES } from '../../game/tokens/constants';
import { getAvailableSteps, isTokenMovable } from '../../game/tokens/logic';
import type {
  TPlayer,
  TPlayerColour,
  TPlayerNameAndColour,
  TCoordinate,
  TPlayerInitData,
  TPlayerCount,
} from '../../types';
import type { TToken, TTokenColourAndId, TTokenAlignmentData } from '../../types';
import { playerSequences } from '../../game/players/constants';

type TPlayerState = {
  players: TPlayer[];
  playerInitData: TPlayerInitData[];
  currentPlayerColour: TPlayerColour | null;
  playerSequence: TPlayerColour[];
  isAnyTokenMoving: boolean;
  isGameEnded: boolean;
  playerFinishOrder: TPlayerNameAndColour[];
};

export const initialState: TPlayerState = {
  players: [],
  playerInitData: [],
  currentPlayerColour: null,
  playerSequence: [],
  isAnyTokenMoving: false,
  isGameEnded: false,
  playerFinishOrder: [],
};

export function getPlayer(state: TPlayerState, colour: TPlayerColour) {
  const playerIndex = state.players.findIndex((p) => p.colour === colour);
  const player = state.players[playerIndex];
  if (!player) throw new Error(ERRORS.playerDoesNotExist(colour));
  return player;
}

export function getToken(state: TPlayerState, colour: TPlayerColour, id: number): TToken {
  const player = getPlayer(state, colour);
  const token = player.tokens.find((t) => t.id === id);
  if (!token) throw new Error(ERRORS.tokenDoesNotExist(player.colour, id));
  return token;
}

const reducers = {
  registerNewPlayer: (
    state: TPlayerState,
    action: PayloadAction<{
      name: string;
      colour: TPlayerColour;
      isBot: boolean;
    }>
  ) => {
    const player = state.players.find((p) => p.colour === action.payload.colour);
    if (player) throw new Error(ERRORS.playerAlreadyExists(action.payload.colour));
    state.players.push({
      name: action.payload.name,
      colour: action.payload.colour,
      isBot: action.payload.isBot,
      tokens: genLockedTokens(action.payload.colour),
      numberOfConsecutiveSix: 0,
      playerFinishTime: -1,
    });
  },

  changeCoordsOfToken: (
    state: TPlayerState,
    action: PayloadAction<{
      colour: TPlayerColour;
      id: number;
      newCoords: TCoordinate;
    }>
  ) => {
    const token = getToken(state, action.payload.colour, action.payload.id);

    token.coordinates = action.payload.newCoords;
  },

  changeTurn: (state: TPlayerState) => {
    const { currentPlayerColour, playerSequence } = state;
    if (!currentPlayerColour) {
      state.currentPlayerColour = 'blue';
      return;
    }
    const currentPlayerIndex = playerSequence.indexOf(currentPlayerColour);
    const nextPlayerIndex =
      currentPlayerIndex === playerSequence.length - 1 ? 0 : currentPlayerIndex + 1;

    state.currentPlayerColour = playerSequence[nextPlayerIndex];
  },

  setPlayerSequence: (
    state: TPlayerState,
    action: PayloadAction<{ playerCount: TPlayerCount }>
  ) => {
    state.playerSequence = playerSequences[action.payload.playerCount];
  },

  activateTokens: (
    state: TPlayerState,
    action: PayloadAction<{ all: boolean; colour: TPlayerColour; diceNumber: number }>
  ) => {
    const player = getPlayer(state, action.payload.colour);
    if (action.payload.all) {
      return player.tokens.forEach((t) => {
        if (
          (!t.hasTokenReachedHome && t.isLocked) ||
          (!t.isLocked && getAvailableSteps(t) >= action.payload.diceNumber)
        )
          t.isActive = true;
      });
    }
    player.tokens.forEach((t) => {
      if (isTokenMovable(t, action.payload.diceNumber)) t.isActive = true;
    });
  },

  deactivateAllTokens: (state: TPlayerState, action: PayloadAction<TPlayerColour>) => {
    const player = getPlayer(state, action.payload);
    player.tokens.forEach((t) => (t.isActive = false));
  },

  unlockToken: (state: TPlayerState, action: PayloadAction<TTokenColourAndId>) => {
    const token = getToken(state, action.payload.colour, action.payload.id);
    if (!token.isLocked)
      throw new Error(ERRORS.tokenAlreadyUnlocked(action.payload.colour, action.payload.id));
    token.isLocked = false;
    token.coordinates = TOKEN_START_COORDINATES[action.payload.colour];
  },
  lockToken: (state: TPlayerState, action: PayloadAction<TTokenColourAndId>) => {
    const token = getToken(state, action.payload.colour, action.payload.id);
    if (token.isLocked)
      throw new Error(ERRORS.tokenAlreadyLocked(action.payload.colour, action.payload.id));
    token.isLocked = true;
    token.coordinates = { ...token.initialCoords };
  },

  incrementNumberOfConsecutiveSix: (state: TPlayerState, action: PayloadAction<TPlayerColour>) => {
    const player = getPlayer(state, action.payload);
    player.numberOfConsecutiveSix++;
  },

  resetNumberOfConsecutiveSix: (state: TPlayerState, action: PayloadAction<TPlayerColour>) => {
    const player = getPlayer(state, action.payload);
    player.numberOfConsecutiveSix = 0;
  },

  setIsAnyTokenMoving: (state: TPlayerState, action: PayloadAction<boolean>) => {
    state.isAnyTokenMoving = action.payload;
  },
  markTokenAsReachedHome: (state: TPlayerState, action: PayloadAction<TTokenColourAndId>) => {
    if (state.isGameEnded) return;
    const token = getToken(state, action.payload.colour, action.payload.id);
    token.hasTokenReachedHome = true;
    token.isLocked = true;
    const player = getPlayer(state, action.payload.colour);
    const hasPlayerWon = player.tokens.every((t) => t.hasTokenReachedHome);
    if (!hasPlayerWon) return;
    player.playerFinishTime = Date.now();
    state.playerSequence = state.playerSequence.filter((p) => p !== action.payload.colour);
    state.playerFinishOrder.push({ name: player.name, colour: action.payload.colour });
    if (state.playerSequence.length === 1) {
      state.playerFinishOrder.push({
        name: getPlayer(state, state.playerSequence[0]).name,
        colour: state.playerSequence[0],
      });
      state.isGameEnded = true;
    }
  },
  setTokenAlignmentData: (
    state: TPlayerState,
    action: PayloadAction<{
      colour: TPlayerColour;
      id: number;
      newAlignmentData: TTokenAlignmentData;
    }>
  ) => {
    const token = getToken(state, action.payload.colour, action.payload.id);
    token.tokenAlignmentData = action.payload.newAlignmentData;
  },
  setPlayerInitData: (state: TPlayerState, action: PayloadAction<TPlayerInitData[]>) => {
    state.playerInitData = action.payload;
  },
  clearPlayersState: () => structuredClone(initialState),
};

const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers,
});

export const {
  registerNewPlayer,
  changeCoordsOfToken,
  setPlayerSequence,
  changeTurn,
  activateTokens,
  deactivateAllTokens,
  unlockToken,
  lockToken,
  incrementNumberOfConsecutiveSix,
  resetNumberOfConsecutiveSix,
  setIsAnyTokenMoving,
  markTokenAsReachedHome,
  setTokenAlignmentData,
  setPlayerInitData,
  clearPlayersState,
} = playersSlice.actions;

export default playersSlice.reducer;
