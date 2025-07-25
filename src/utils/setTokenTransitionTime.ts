export function setTokenTransitionTime(transitionTime: number) {
  const game = document.querySelector<HTMLDivElement>('.game');
  if (!game) return;
  game.style.setProperty('--token-transition-time', `${transitionTime}ms`);
}
