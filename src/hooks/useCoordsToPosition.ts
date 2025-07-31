import { useSelector } from 'react-redux';
import type { TCoordinate } from '../types';
import type { TTokenAlignmentData } from '../types';
import type { RootState } from '../gameStateStore';
import { useCallback, useRef } from 'react';

export const useCoordsToPosition = (): ((
  coords: TCoordinate,
  tokenAlignmentData: TTokenAlignmentData
) => { x: string; y: string }) => {
  const boardData = useSelector((state: RootState) => state.board);
  const boardDataRef = useRef(boardData);
  boardDataRef.current = boardData;
  return useCallback((coords: TCoordinate, tokenAlignmentData: TTokenAlignmentData) => {
    const { xOffset, yOffset } = tokenAlignmentData;
    const { boardBlockSize, boardSideLength, tokenHeight, tokenWidth } = boardDataRef.current;

    const tileCenterX = coords.x * boardBlockSize + boardBlockSize / 2;
    const tileCenterY = boardSideLength - ((coords.y + 1) * boardBlockSize - boardBlockSize / 2);

    const x = `${tileCenterX - tokenWidth / 2 + xOffset * boardBlockSize}px`;
    const y = `${tileCenterY - tokenHeight / 2 + yOffset * boardBlockSize}px`;
    return { x, y };
  }, []);
};
