import type { RootState } from '../../state/store';
import type { TCoordinate, TSequenceCalculationResult, TToken } from '../../types';
import playersReducer, {
  changeTurn,
  deactivateAllTokens,
  lockToken,
  markTokenAsReachedHome,
  setTokenAlignmentData,
  updateTokenCoordinatesAndDirection,
} from '../../state/slices/playersSlice';
import { areCoordsEqual } from '../coords/logic';
import { defaultTokenAlignmentData, getTokenAlignmentData } from '../tokens/alignment';
import { TOKEN_SAFE_COORDINATES } from '../tokens/constants';
import { tokensWithCoord } from '../tokens/logic';
import { tokenPaths } from '../tokens/paths';

export const calculateSequence = (
  state: RootState,
  token: TToken,
  diceNumber: number
): TSequenceCalculationResult => {
  const { coordinates, colour, id, direction } = token;
  const nextState = structuredClone(state);
  const captureData: TSequenceCalculationResult['captureData'] = [];

  const tokenPath = tokenPaths[token.colour];
  const initialCoordIndex = tokenPath.findIndex((v) => areCoordsEqual(v, coordinates));
  const finalCoordIndex = initialCoordIndex + diceNumber;
  const moveSequence: TSequenceCalculationResult['moveSequence'] = tokenPath.slice(
    initialCoordIndex,
    finalCoordIndex + 1
  );

  const finalCoordinate = tokenPath[finalCoordIndex];
  const hasTokenReachedHome = areCoordsEqual(finalCoordinate, tokenPath[tokenPath.length - 1]);

  nextState.players = playersReducer(nextState.players, deactivateAllTokens(token.colour));

  nextState.players = playersReducer(
    nextState.players,
    updateTokenCoordinatesAndDirection({
      colour,
      id,
      newCoords: finalCoordinate,
      direction: direction ?? 'forward',
    })
  );
  const clonedPlayers = nextState.players.players;

  const isSafeTile = TOKEN_SAFE_COORDINATES.some((c) => areCoordsEqual(c, finalCoordinate));

  if (!isSafeTile) {
    clonedPlayers.forEach((p) => {
      if (p.colour !== token.colour) {
        p.tokens.forEach((t) => {
          if (areCoordsEqual(t.coordinates, finalCoordinate)) {
            nextState.players = playersReducer(
              nextState.players,
              lockToken({ colour: t.colour, id: t.id })
            );
            nextState.players = playersReducer(
              nextState.players,
              setTokenAlignmentData({
                colour: t.colour,
                id: t.id,
                newAlignmentData: defaultTokenAlignmentData,
              })
            );
            const idx = tokenPaths[t.colour].findIndex((c) => areCoordsEqual(c, t.coordinates));
            const moveSequence = tokenPaths[t.colour].slice(0, idx + 1).reverse();
            captureData.push({ token: t, moveSequence });
          }
        });
      }
    });
  }

  const allTokens = nextState.players.players.flatMap((p) => p.tokens);
  const uniqueCoords = [
    ...new Set(allTokens.map(({ coordinates }) => `${coordinates.x},${coordinates.y}`)),
  ].map((c) => {
    const [x, y] = c.split(',');
    return { x: parseFloat(x), y: parseFloat(y) } as TCoordinate;
  });

  for (const coord of uniqueCoords) {
    const tokensInCoord = tokensWithCoord(coord, nextState.players.players);
    const algData = getTokenAlignmentData(tokensInCoord.length);
    tokensInCoord.forEach((t, i) => {
      nextState.players = playersReducer(
        nextState.players,
        setTokenAlignmentData({
          colour: t.colour,
          id: t.id,
          newAlignmentData: algData[i],
        })
      );
    });
  }

  if (hasTokenReachedHome) {
    nextState.players = playersReducer(
      nextState.players,
      markTokenAsReachedHome({ colour: token.colour, id: token.id })
    );
  }

  const updatedPlayer = nextState.players.players.find((p) => p.colour === token.colour);
  const hasPlayerWon = updatedPlayer
    ? updatedPlayer.tokens.every((t) => t.hasTokenReachedHome)
    : false;
  if (hasPlayerWon || (captureData.length === 0 && !hasTokenReachedHome && diceNumber !== 6)) {
    nextState.players = playersReducer(nextState.players, changeTurn());
  }

  return { nextState, moveSequence, captureData };
};
