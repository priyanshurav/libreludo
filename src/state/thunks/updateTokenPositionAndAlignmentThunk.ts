import { changeCoordsOfToken } from '../slices/playersSlice';
import { type TPlayerColour, type TCoordinate } from '../../types';
import type { AppDispatch, RootState } from '../store';
import { areCoordsEqual } from '../../game/coords/logic';
import { tokensWithCoord } from '../../game/tokens/logic';
import { tokenPaths } from '../../game/tokens/paths';
import { applyAlignmentData } from '../../game/tokens/alignment';

export function updateTokenPositionAndAlignmentThunk({
  colour,
  id,
  newCoords,
}: {
  colour: TPlayerColour;
  id: number;
  newCoords: TCoordinate;
}) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(changeCoordsOfToken({ colour, id, newCoords }));
    const allTokens = getState().players.players.flatMap((p) => p.tokens);
    const tokenPath = tokenPaths[colour];
    const currentCoordIndex = tokenPath.findIndex((c) => areCoordsEqual(c, newCoords));
    const previousCoord =
      currentCoordIndex === 0 ? { x: -1, y: -1 } : tokenPath[currentCoordIndex - 1];
    const tokensInCurrentCoord = tokensWithCoord(newCoords, allTokens);
    const tokensInPrevCoord = tokensWithCoord(previousCoord, allTokens);
    applyAlignmentData(tokensInCurrentCoord, dispatch);
    applyAlignmentData(tokensInPrevCoord, dispatch);
  };
}
