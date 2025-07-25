import { changeCoordsOfToken, setTokenAlignmentData } from '../slices/playersSlice';
import { type TPlayerColour, type TCoordinate } from '../../types';
import type { AppDispatch, RootState } from '../../gameStateStore';
import { areCoordsEqual } from '../../utils/areCoordsEqual';
import { getTokenAlignmentData } from '../../game/tokens/alignment';
import { tokensWithCoord } from '../../game/tokens/logic';
import { tokenPaths } from '../../game/tokens/paths';

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
    // dispatch(changeCoordsOfToken({ colour, id, newCoords }));
    const allTokens = getState().players.players.flatMap((p) => p.tokens);
    const tokenPath = tokenPaths[colour];
    const currentCoordIndex = tokenPath.findIndex((c) => areCoordsEqual(c, newCoords));
    const previousCoord =
      currentCoordIndex === 0 ? { x: -1, y: -1 } : tokenPath[currentCoordIndex - 1];
    const tokensInCurrentCoord = tokensWithCoord(newCoords, allTokens);
    const tokensInPrevCoord = tokensWithCoord(previousCoord, allTokens);
    const currentTokenAlignmentData = getTokenAlignmentData(tokensInCurrentCoord.length);
    const prevTokenAlignmentData = getTokenAlignmentData(tokensInPrevCoord.length);
    tokensInCurrentCoord.forEach((t, i) => {
      dispatch(
        setTokenAlignmentData({
          colour: t.colour,
          id: t.id,
          newAlignmentData: currentTokenAlignmentData[i],
        })
      );
    });
    tokensInPrevCoord.forEach((t, i) => {
      dispatch(
        setTokenAlignmentData({
          colour: t.colour,
          id: t.id,
          newAlignmentData: prevTokenAlignmentData[i],
        })
      );
    });
  };
}
