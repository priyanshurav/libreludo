import type { TPlayerColour } from '../../types';
import { ERRORS } from '../../utils/errors';
import {
  playerSequenceForTwoPlayers,
  playerSequenceForThreePlayers,
  playerSequenceForFourPlayers,
} from './constants';

export function getPlayerSequence(noOfPlayers: number): TPlayerColour[] {
  let playerSequence: TPlayerColour[] = [];
  switch (noOfPlayers) {
    case 2:
      playerSequence = playerSequenceForTwoPlayers;
      break;
    case 3:
      playerSequence = playerSequenceForThreePlayers;
      break;
    case 4:
      playerSequence = playerSequenceForFourPlayers;
      break;
    default:
      throw new Error(ERRORS.invalidNumberOfPlayers());
  }
  return [...playerSequence];
}
