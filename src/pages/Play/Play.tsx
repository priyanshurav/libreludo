import { Navigate, useBlocker, useLocation, useNavigate, useNavigation } from 'react-router-dom';
import Game from './components/Game/Game';
import { useDispatch } from 'react-redux';
import { useOnPageExit } from '../../hooks/useOnPageExit';
import { clearPlayersState } from '../../state/slices/playersSlice';
import { clearDiceState } from '../../state/slices/diceSlice';
import { clearBoardState } from '../../state/slices/boardSlice';
import { useEffect, useRef, useState } from 'react';
import type { TPlayerInitData } from '../../types';
import { useCleanup } from '../../hooks/useCleanup';

function Play() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cleanup = useCleanup();
  // const [initData, setInitData] = useState<TPlayerInitData[]>([]);
  // const cleared = useRef(false);
  const initData =
    location.state ||
    [
      // { name: 'Player 1', isBot: false },
      // { name: 'Player 2', isBot: false },
    ];
  // useEffect(() => {
  //   if (location.state) {
  //     setInitData(location.state);
  //     navigate(location.pathname, { replace: true });
  //   }
  //   // if (!cleared.current && location.state) {
  //   //   cleared.current = true;
  //   //   setInitData(location.state);
  //   //   navigate(location.pathname, { replace: true });
  //   // }
  // }, [location.pathname, location.state, navigate]);

  // useOnPageExit(() => {
  //   confirm('Are you sure you want to exit, any progress made will be lost?');
  //   cleanup();
  // });
  // useOnPageExit(() => {
  //   const shouldExit = window.confirm(
  //     'Are you sure you want to exit? Any progress made will be lost.'
  //   );

  //   if (shouldExit) cleanup();

  //   return !shouldExit;
  // });
  // useEffect(() => {
  //   const handler = (e: BeforeUnloadEvent) => {
  //     console.log(e.defaultPrevented);

  //     e.preventDefault();
  //     e.returnValue = '';
  //     cleanup();
  //     // const shouldBlock = callback();
  //   };
  //   window.addEventListener('beforeunload', handler);
  //   return () => window.removeEventListener('beforeunload', handler);
  // }, []);
  return initData.length !== 0 ? <Game initData={initData} /> : <Navigate to="/setup" />;
}

export default Play;
