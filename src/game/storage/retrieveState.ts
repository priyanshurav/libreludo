import { generateRollBag } from '../../state/slices/diceSlice';
import type { TPlayerColour, TToken } from '../../types';
import { playerSequences } from '../players/constants';
import { playerCountToWord } from '../players/logic';
import { TOKEN_LOCKED_COORDINATES } from '../tokens/constants';
import { retrieveSaveFromStorage } from './storage';
import { validateStoredState } from './validator';
import type { RootState } from '../../state/store';
import { initialState as initialDiceState } from '../../state/slices/diceSlice';

type TRetrievedStateResult =
  | { success: true; result: RootState }
  | { success: false; result: Error };

export const retrieveState = (currentState: RootState): TRetrievedStateResult => {
  const { success, result } = validateStoredState(retrieveSaveFromStorage());
  if (!success) {
    return { success: false, result: result };
  }

  const numberOfPlayers = result.players.length;
  const playerSequence = playerSequences[playerCountToWord(numberOfPlayers)];

  const newState: RootState = {
    board: { ...currentState.board },
    dice: structuredClone(initialDiceState),
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
        direction: null,
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
