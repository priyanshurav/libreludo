import type { TPlayerColour } from '../../types';
import { SAVE_VERSION } from './constants';
import type { TStoredStateSchema, TStoredTokenSchema, TStoredPlayerSchema } from './schema';
import { storeSaveInStorage } from './storage';
import type { RootState } from '../../state/store';

export const saveState = (currentState: RootState): void => {
  if (currentState.players.isAnyTokenMoving) throw new Error('Cannot save while tokens are moving');
  const players = currentState.players.players;
  const dice = currentState.dice.dice;
  const toBeStored: TStoredStateSchema = {
    saveTime: Date.now(),
    version: SAVE_VERSION,
    dice: [],
    players: [],
    session: { ...currentState.session },
    currentPlayerColour: currentState.players.currentPlayerColour as TPlayerColour,
    playerFinishOrder: currentState.players.playerFinishOrder.map((p) => p.colour),
  };

  for (const p of players) {
    const tokensToBeStored: TStoredTokenSchema[] = p.tokens.map((t) => {
      return {
        id: t.id,
        coordinates: t.coordinates,
        isLocked: t.isLocked,
        isActive: t.isActive,
        hasTokenReachedHome: t.hasTokenReachedHome,
        tokenAlignmentData: t.tokenAlignmentData,
      };
    });

    const playerToBeStored: TStoredPlayerSchema = {
      colour: p.colour,
      isBot: p.isBot,
      name: p.name,
      numberOfConsecutiveSix: p.numberOfConsecutiveSix,
      playerFinishTime: p.playerFinishTime,
      tokens: tokensToBeStored,
    };

    toBeStored.players.push(playerToBeStored);
  }

  for (const d of dice) {
    toBeStored.dice.push({
      colour: d.colour,
      diceNumber: d.diceNumber,
    });
  }

  storeSaveInStorage(toBeStored);
};
