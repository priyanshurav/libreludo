import { useSelector } from 'react-redux';
import type { TCoordinate } from '../types';
import type { TTokenAlignmentData } from '../types';
import type { RootState } from '../state/store';
import { useCallback } from 'react';

export const useCoordsToPosition = (): ((
  coords: TCoordinate,
  tokenAlignmentData: TTokenAlignmentData
) => { x: string; y: string }) => {
  const { boardTileSize, tokenHeight, tokenWidth } = useSelector((state: RootState) => state.board);
  return useCallback(
    (coords: TCoordinate, tokenAlignmentData: TTokenAlignmentData) => {
      const { xOffset, yOffset } = tokenAlignmentData;
      const tileCenterX = coords.x * boardTileSize + boardTileSize / 2;
      const tileCenterY = coords.y * boardTileSize + boardTileSize / 2;
      const x = `${tileCenterX - tokenWidth / 2 + xOffset * boardTileSize}px`;
      const y = `${tileCenterY - tokenHeight / 2 + yOffset * boardTileSize}px`;
      return { x, y };
    },
    [boardTileSize, tokenHeight, tokenWidth]
  );
};
