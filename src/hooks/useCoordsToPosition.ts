import { useSelector } from 'react-redux';
import type { TCoordinate } from '../types';
import type { TTokenAlignmentData } from '../types';
import type { RootState } from '../state/store';
import { useCallback, useEffect, useRef } from 'react';

export const useCoordsToPosition = (): ((
  coords: TCoordinate,
  tokenAlignmentData: TTokenAlignmentData
) => { x: string; y: string }) => {
  const boardState = useSelector((state: RootState) => state.board);
  const boardStateRef = useRef(boardState);
  useEffect(() => {
    boardStateRef.current = boardState;
  }, [boardState]);
  return useCallback((coords: TCoordinate, tokenAlignmentData: TTokenAlignmentData) => {
    const { boardTileSize, tokenHeight, tokenWidth } = boardStateRef.current;
    const { xOffset, yOffset } = tokenAlignmentData;
    const tileCenterX = coords.x * boardTileSize + boardTileSize / 2;
    const tileCenterY = coords.y * boardTileSize + boardTileSize / 2;
    const x = `${tileCenterX - tokenWidth / 2 + xOffset * boardTileSize}px`;
    const y = `${tileCenterY - tokenHeight / 2 + yOffset * boardTileSize}px`;
    return { x, y };
  }, []);
};
