import { FORWARD_TOKEN_TRANSITION_TIME } from '../game/tokens/constants';

export function setTokenTransitionTime(transitionTime: number) {
  const game = document.querySelector<HTMLDivElement>('.game');
  if (!game) return;
  game.style.setProperty('--token-transition-time', `${transitionTime}ms`);
  const timingFn = transitionTime === FORWARD_TOKEN_TRANSITION_TIME ? 'ease-in-out' : 'linear';
  game.style.setProperty('--token-transition-timing-fn', timingFn);
}
