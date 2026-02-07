import BoardImage from '../../../../assets/board.svg?react';
import Token from '../Token/Token';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../../state/store';
import { useEffect, useRef, useState } from 'react';
import { NUMBER_OF_BLOCKS_IN_ONE_ROW, resizeBoard } from '../../../../state/slices/boardSlice';
import { ERRORS } from '../../../../utils/errors';
import Dice from '../Dice/Dice';
import type { TCoordinate, TPlayerColour } from '../../../../types';
import { getTokenDOMId, tokensWithCoord } from '../../../../game/tokens/logic';
import type { TTokenClickData } from '../../../../types/tokens';
import styles from './Board.module.css';

type Props = {
  onDiceClick: (colour: TPlayerColour, diceNumber: number) => void;
};

function Board({ onDiceClick: onDiceRoll }: Props) {
  const { players, currentPlayerColour } = useSelector((state: RootState) => state.players);
  const { boardTileSize, boardSideLength } = useSelector((state: RootState) => state.board);
  const { dice } = useSelector((state: RootState) => state.dice);
  const [tokenClickData, setTokenClickData] = useState<TTokenClickData | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const boardNode = boardRef.current;
    if (!boardNode) throw new Error(ERRORS.boardDoesNotExist());
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        const boardSideLength = boardNode.getBoundingClientRect().width;
        dispatch(resizeBoard(boardSideLength));
      });
    }
    const resizeObserver = resizeObserverRef.current;
    resizeObserver.observe(boardNode);
    return () => {
      resizeObserver.unobserve(boardNode);
    };
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, []);

  const handleBoardClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (players.find((p) => p.colour === currentPlayerColour)?.isBot) return;
    const boardNode = boardRef.current;
    if (!boardNode) throw new Error(ERRORS.boardDoesNotExist());
    const { top, left } = boardNode.getBoundingClientRect();
    const boardX = e.clientX - left;
    const boardY = e.clientY - top;
    const tileStartCoords = Array(NUMBER_OF_BLOCKS_IN_ONE_ROW)
      .fill(null)
      .map((_, i) => (i + 1) * boardTileSize);

    if (boardX > boardSideLength || boardY > boardSideLength || boardX < 0 || boardY < 0) return;

    const coordX = tileStartCoords.findIndex((v) => boardX < v);
    const coordY = tileStartCoords.findIndex((v) => boardY < v);

    const coords: TCoordinate = { x: coordX, y: coordY };

    const tokenToMove = tokensWithCoord(coords, players).filter(
      (t) => t.colour === currentPlayerColour
    )[0];

    if (!tokenToMove || tokenToMove.isLocked) return;

    setTokenClickData({
      timestamp: Date.now(),
      colour: tokenToMove.colour,
      id: tokenToMove.id,
    });
  };

  return (
    <div className={styles.board} ref={boardRef} onClick={handleBoardClick}>
      {players.map((p) =>
        p.tokens.map((t) => (
          <Token
            colour={t.colour}
            id={t.id}
            tokenClickData={tokenClickData}
            key={getTokenDOMId(t.colour, t.id)}
          />
        ))
      )}
      {dice.map((d) => (
        <Dice
          colour={d.colour}
          onDiceClick={onDiceRoll}
          playerName={players.find((p) => p.colour === d.colour)?.name as string}
          key={d.colour}
        />
      ))}
      <BoardImage className={styles.boardImage} aria-hidden="true" />
    </div>
  );
}

export default Board;
