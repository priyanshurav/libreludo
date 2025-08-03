import './Board.css';
import BoardImage from '../../../../assets/board.svg?react';
import Token from '../Token/Token';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../../state/store';
import { useEffect, useRef } from 'react';
import { resizeBoard } from '../../../../state/slices/boardSlice';
import { ERRORS } from '../../../../utils/errors';
import Dice from '../Dice/Dice';
import type { TPlayerColour } from '../../../../types';

type Props = {
  onDiceClick: (colour: TPlayerColour, diceNumber: number) => void;
};

function Board({ onDiceClick: onDiceRoll }: Props) {
  const players = useSelector((state: RootState) => state.players.players);
  const dice = useSelector((state: RootState) => state.dice);
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

  return (
    <div className="board" ref={boardRef}>
      {players.map((p, index1) =>
        p.tokens.map((t, index2) => (
          <Token colour={t.colour} id={t.id} key={`${index1}${index2}`} />
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
