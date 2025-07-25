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
    const { xOffset, yOffset, scaleFactor } = tokenAlignmentData;
    const { boardBlockSize, boardSideLength, tokenHeight, tokenWidth } = boardDataRef.current;
    // console.log(boardBlockSize, boardSideLength, tokenHeight, tokenWidth);

    const x = `${
      coords.x * boardBlockSize +
      boardBlockSize / 2 -
      (tokenWidth * scaleFactor) / 2 +
      boardBlockSize * xOffset
    }px`;

    const y = `${
      boardSideLength -
      ((coords.y + 1) * boardBlockSize -
        boardBlockSize / 2 +
        (tokenHeight * scaleFactor) / 2 +
        boardBlockSize * yOffset)
    }px`;
    return { x, y };
  }, []);
};
