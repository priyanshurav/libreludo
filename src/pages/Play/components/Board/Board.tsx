import './Board.css';
import BoardImage from '../../../../assets/board.svg?react';
import Token from '../Token/Token';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../../state/store';
import { useEffect, useRef, useState } from 'react';
import { NUMBER_OF_BLOCKS_IN_ONE_ROW, resizeBoard } from '../../../../state/slices/boardSlice';
import { ERRORS } from '../../../../utils/errors';
import Dice from '../Dice/Dice';
import type { TCoordinate, TPlayerColour } from '../../../../types';
import { tokensWithCoord } from '../../../../game/tokens/logic';
import type { TTokenClickData } from '../../../../types/tokens';

type Props = {
  onDiceClick: (colour: TPlayerColour, diceNumber: number) => void;
};

function Board({ onDiceClick: onDiceRoll }: Props) {
  const { players, currentPlayerColour } = useSelector((state: RootState) => state.players);
  const boardBlockSize = useSelector((state: RootState) => state.board.boardBlockSize);
  const dice = useSelector((state: RootState) => state.dice);
  const [tokenClickData, setTokenClickData] = useState<TTokenClickData | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const boardNode = boardRef.current;
    if (!boardNode) throw new Error(ERRORS.boardDoesNotExist());
    const resizeObserver = new ResizeObserver(() => {
      const boardSideLength = boardNode.getBoundingClientRect().width;
      dispatch(resizeBoard(boardSideLength));
    });
    resizeObserver.observe(boardNode);
    return () => {
      resizeObserver.unobserve(boardNode);
      resizeObserver.disconnect();
    };
  }, [dispatch]);

  const handleBoardClick = (e: MouseEvent) => {
    if (players.find((p) => p.colour === currentPlayerColour)?.isBot) return;
    const boardNode = boardRef.current;
    if (!boardNode) throw new Error(ERRORS.boardDoesNotExist());
    const { left, bottom } = boardNode.getBoundingClientRect();
    const boardX = e.clientX - left;
    const boardY = bottom - e.clientY;
    const tileStartCoords = Array(NUMBER_OF_BLOCKS_IN_ONE_ROW)
      .fill(null)
      .map((_, i) => (i + 1) * boardBlockSize);

    const coordX = tileStartCoords.findIndex((v) => boardX < v);
    const coordY = tileStartCoords.findIndex((v) => boardY < v);

    const coords: TCoordinate = { x: coordX, y: coordY };

    const tokenToMove = tokensWithCoord(coords, players).filter(
      (t) => t.colour === currentPlayerColour
    )[0];

    if (!tokenToMove || tokenToMove.isLocked) return;

    setTokenClickData({
      colour: tokenToMove.colour,
      id: tokenToMove.id,
      coords,
    });
  };

  useEffect(() => {
    const boardNode = boardRef.current;
    if (!boardNode) throw new Error(ERRORS.boardDoesNotExist());
    boardNode.addEventListener('click', handleBoardClick);
    return () => boardNode.removeEventListener('click', handleBoardClick);
  });

  return (
    <div className="board" ref={boardRef}>
      {players.map((p, index1) =>
        p.tokens.map((t, index2) => (
          <Token
            colour={t.colour}
            id={t.id}
            tokenClickData={tokenClickData}
            key={`${index1}${index2}`}
          />
        ))
      )}
      {dice.map((d, i) => (
        <Dice
          colour={d.colour}
          onDiceClick={onDiceRoll}
          playerName={players.find((p) => p.colour === d.colour)?.name as string}
          key={i}
        />
      ))}
      <BoardImage className="board-image" />
    </div>
  );
}

export default Board;
