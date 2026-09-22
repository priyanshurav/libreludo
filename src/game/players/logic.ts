import type { TPlayerColour, TPlayerCount, TPlayerNameAndColour } from '../../types';
import { ERRORS } from '../../utils/errors';

export function playerCountToWord(playerCount: number): TPlayerCount {
  switch (playerCount) {
    case 2:
      return 'two';
    case 3:
      return 'three';
    case 4:
      return 'four';
    default:
      throw new Error(ERRORS.invalidNumberOfPlayers(playerCount));
  }
}

export function getNextPlayer(
  playerSequence: TPlayerColour[],
  finishedPlayers: TPlayerNameAndColour[],
  currentPlayerColour: TPlayerColour
): TPlayerColour | null {
  const currentPlayerIndex = playerSequence.indexOf(currentPlayerColour);
  const finishedPlayersColours = finishedPlayers.map((p) => p.colour);
  let i = currentPlayerIndex;
  let iterations = 0;
  while (iterations < playerSequence.length) {
    i = (i + 1) % playerSequence.length;
    iterations++;
    if (!finishedPlayersColours.includes(playerSequence[i])) return playerSequence[i];
  }
  return null;
}
