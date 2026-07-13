import { generateRollBag } from '../../state/slices/diceSlice';
import type { TPlayerColour, TToken } from '../../types';
import { playerSequences } from '../players/constants';
import { playerCountToWord } from '../players/logic';
import { TOKEN_LOCKED_COORDINATES } from '../tokens/constants';
import { retrieveSaveFromStorage } from './storage';
import { validateStoredState } from './validator';
import type { RootState } from '../../state/store';
import { initialState as initialDiceState } from '../../state/slices/diceSlice';
import { defaultTokenAlignmentData, getTokenAlignmentData } from '../tokens/alignment';
import { tokensWithCoord } from '../tokens/logic';
import type { TResult } from '../../types/storage';

export const retrieveState = (currentState: RootState): TResult<RootState, Error> => {
  const { success, data, error } = validateStoredState(retrieveSaveFromStorage());

  if (!success) return { success: false, error, data: null };

  const numberOfPlayers = data.players.length;
  const playerSequence = playerSequences[playerCountToWord(numberOfPlayers)];

  const newState: RootState = {
    board: { ...currentState.board },
    dice: structuredClone(initialDiceState),
    players: {
      currentPlayerColour: data.currentPlayerColour,
      players: [],
      playerSequence,
      isAnyTokenMoving: false,
      isGameEnded: false,
      playerFinishOrder: [],
    },
    session: {
      ...data.session,
      gameInactiveTime: Date.now() - data.saveTime + data.session.gameInactiveTime,
    },
  };

  for (const d of data.dice) {
    newState.dice.dice.push({
      ...d,
      isPlaceholderShowing: false,
    });
  }

  for (const key of Object.keys(newState.dice.rollBag)) {
    newState.dice.rollBag[key as TPlayerColour] = generateRollBag();
  }

  for (const p of data.players) {
    const tokens: TToken[] = p.tokens.map((t, i) => {
      return {
        ...t,
        colour: p.colour,
        initialCoords: TOKEN_LOCKED_COORDINATES[p.colour][i],
        direction: null,
        tokenAlignmentData: defaultTokenAlignmentData,
      };
    });
    newState.players.players.push({
      ...p,
      tokens,
    });
  }

  const allTokens = newState.players.players.flatMap((p) => p.tokens);
  const uniqueCoords = [
    ...new Set(allTokens.map(({ coordinates }) => `${coordinates.x},${coordinates.y}`)),
  ].map((c) => {
    const [x, y] = c.split(',');
    return { x: parseFloat(x), y: parseFloat(y) };
  });

  for (const coord of uniqueCoords) {
    const tokensInCoord = tokensWithCoord(coord, newState.players.players);
    const algData = getTokenAlignmentData(tokensInCoord.length);
    tokensInCoord.forEach((t, i) => (t.tokenAlignmentData = algData[i]));
  }

  for (const colour of data.playerFinishOrder) {
    newState.players.playerFinishOrder.push({
      colour,
      name: newState.players.players.find((p) => p.colour === colour)?.name as string,
    });
  }
  return { success: true, data: newState, error: null };
};
