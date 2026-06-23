import { useCallback } from 'react';
import { useStore, useDispatch } from 'react-redux';
import { areCoordsEqual } from '../game/coords/logic';
import { applyAlignmentData } from '../game/tokens/alignment';
import { tokensWithCoord } from '../game/tokens/logic';
import { tokenPaths } from '../game/tokens/paths';
import { updateTokenCoordinatesAndDirection } from '../state/slices/playersSlice';
import type { RootState, AppDispatch } from '../state/store';
import type { TPlayerColour, TCoordinate, TTokenDirection } from '../types';

type TUpdateTokenPositionAndAlignmentParams = {
  colour: TPlayerColour;
  id: number;
  newCoords: TCoordinate;
  direction: TTokenDirection;
};

export const useUpdateTokenPositionAndAlignment = () => {
  const store = useStore<RootState>();
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    ({ colour, id, newCoords, direction }: TUpdateTokenPositionAndAlignmentParams) => {
      dispatch(updateTokenCoordinatesAndDirection({ colour, id, newCoords, direction }));
      const players = store.getState().players.players;
      const tokenPath = tokenPaths[colour];
      const currentCoordIndex = tokenPath.findIndex((c) => areCoordsEqual(c, newCoords));
      const previousCoord =
        currentCoordIndex === 0 ? { x: -1, y: -1 } : tokenPath[currentCoordIndex - 1];
      const tokensInCurrentCoord = tokensWithCoord(newCoords, players);
      const tokensInPrevCoord = tokensWithCoord(previousCoord, players);
      if (tokensInCurrentCoord.length !== 0) applyAlignmentData(tokensInCurrentCoord, dispatch);
      if (tokensInPrevCoord.length !== 0) applyAlignmentData(tokensInPrevCoord, dispatch);
    },
    [dispatch, store]
  );
};
