import { Navigate } from 'react-router-dom';
import Game from './components/Game/Game';
import { useSelector } from 'react-redux';
import type { RootState } from '../../state/store';
import { useEffect } from 'react';

function Play() {
  useEffect(() => {
    document.title = 'Play LibreLudo';
  }, []);
  const initData = useSelector((state: RootState) => state.players.playerInitData);
  return initData.length !== 0 ? <Game initData={initData} /> : <Navigate to="/setup" />;
}

export default Play;
