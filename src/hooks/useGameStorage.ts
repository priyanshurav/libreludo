import type { RootState } from '../state/store';
import { validateStoredState } from '../game/storage/validator';
import {
  type TStoredPlayerSchema,
  type TStoredStateSchema,
  type TStoredTokenSchema,
} from '../game/storage/schema';
import type { Store } from '@reduxjs/toolkit';
import type { TPlayerColour, TToken } from '../types';
import { useStore } from 'react-redux';
import { SAVE_VERSION } from '../game/storage/constants';
import { playerSequences } from '../game/players/constants';
import { playerCountToWord } from '../game/players/logic';
import { generateRollBag, initialState as initialDiceState } from '../state/slices/diceSlice';
import { cloneDeep } from 'lodash-es';
import { TOKEN_LOCKED_COORDINATES } from '../game/tokens/constants';
import { useCallback } from 'react';
import {
  deleteSaveFromStorage,
  retrieveSaveFromStorage,
  storeSaveInStorage,
} from '../game/storage/storage';

const saveGameState = (store: Store<RootState>): void => {
  const state = store.getState();
  if (state.players.isAnyTokenMoving) throw new Error('Cannot save while tokens are moving');
  const players = state.players.players;
  const dice = state.dice.dice;
  const toBeStored: TStoredStateSchema = {
    saveTime: Date.now(),
    version: SAVE_VERSION,
    dice: [],
    players: [],
    session: { ...state.session },
    currentPlayerColour: state.players.currentPlayerColour as TPlayerColour,
    playerFinishOrder: state.players.playerFinishOrder.map((p) => p.colour),
  };

  for (const p of players) {
    const tokensToBeStored: TStoredTokenSchema[] = p.tokens.map((t) => {
      return {
        id: t.id,
        coordinates: t.coordinates,
        isLocked: t.isLocked,
        isActive: t.isActive,
        hasTokenReachedHome: t.hasTokenReachedHome,
        tokenAlignmentData: t.tokenAlignmentData,
      };
    });

    const playerToBeStored: TStoredPlayerSchema = {
      colour: p.colour,
      isBot: p.isBot,
      name: p.name,
      numberOfConsecutiveSix: p.numberOfConsecutiveSix,
      playerFinishTime: p.playerFinishTime,
      tokens: tokensToBeStored,
    };

    toBeStored.players.push(playerToBeStored);
  }

  for (const d of dice) {
    toBeStored.dice.push({
      colour: d.colour,
      diceNumber: d.diceNumber,
    });
  }

  storeSaveInStorage(toBeStored);
};

type TRetrievedStateResult =
  | { success: true; result: RootState }
  | { success: false; result: Error };

const retrieveGameState = (store: Store<RootState>): TRetrievedStateResult => {
  const { success, result } = validateStoredState(retrieveSaveFromStorage());
  if (!success) {
    return { success: false, result: result };
  }

  const oldState = store.getState();
  const numberOfPlayers = result.players.length;
  const playerSequence = playerSequences[playerCountToWord(numberOfPlayers)];

  const newState: RootState = {
    board: { ...oldState.board },
    dice: cloneDeep(initialDiceState),
    players: {
      currentPlayerColour: result.currentPlayerColour,
      players: [],
      playerSequence,
      isAnyTokenMoving: false,
      isGameEnded: false,
      playerFinishOrder: [],
    },
    session: {
      ...result.session,
      gameInactiveTime: Date.now() - result.saveTime + result.session.gameInactiveTime,
    },
  };

  for (const d of result.dice) {
    newState.dice.dice.push({
      ...d,
      isPlaceholderShowing: false,
    });
  }

  for (const key of Object.keys(newState.dice.rollBag)) {
    newState.dice.rollBag[key as TPlayerColour] = generateRollBag();
  }

  for (const p of result.players) {
    const tokens: TToken[] = p.tokens.map((t, i) => {
      return {
        ...t,
        colour: p.colour,
        initialCoords: TOKEN_LOCKED_COORDINATES[p.colour][i],
      };
    });
    newState.players.players.push({
      ...p,
      tokens,
    });
  }

  for (const colour of result.playerFinishOrder) {
    newState.players.playerFinishOrder.push({
      colour,
      name: newState.players.players.find((p) => p.colour === colour)?.name as string,
    });
  }
  return { success: true, result: newState };
};

export const useGameStorage = () => {
  const store = useStore<RootState>();
  return {
    saveState: useCallback(() => saveGameState(store), [store]),
    retrieveState: useCallback(() => retrieveGameState(store), [store]),
    deleteState: useCallback(() => deleteSaveFromStorage(), []),
  };
};
