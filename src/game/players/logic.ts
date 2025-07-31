import type { TPlayerCount } from '../../types';
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
      throw new Error(ERRORS.invalidNumberOfPlayers());
  }
}
