import { FORWARD_TOKEN_TRANSITION_TIME } from '../game/tokens/constants';
import type { TToken } from '../types';

export function setTokenTransitionTime(transitionTime: number, { colour, id }: TToken) {
  const token = document.getElementById(`${colour}_${id}`);
  const game = document.querySelector<HTMLDivElement>('.game');
  const timingFn = transitionTime === FORWARD_TOKEN_TRANSITION_TIME ? 'ease-in-out' : 'linear';
  [token, game].forEach((e) => {
    if (!e) return;
    e.style.setProperty('--token-transition-time', `${transitionTime}ms`);
    e.style.setProperty('--token-transition-timing-fn', timingFn);
  });
}
