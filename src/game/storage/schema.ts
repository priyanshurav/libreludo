import * as z from 'zod';
import type { TPlayerColour } from '../../types';
import { MAX_PLAYER_NAME_LENGTH } from '../players/constants';

const coloursSchema = z.literal(['blue', 'red', 'green', 'yellow'] satisfies TPlayerColour[]);

const tokenSchema = z.object({
  id: z.number(),
  coordinates: z.object({ x: z.number(), y: z.number() }),
  isLocked: z.boolean(),
  isActive: z.boolean(),
  hasTokenReachedHome: z.boolean(),
});

const diceSchema = z.object({
  diceNumber: z.number(),
  colour: coloursSchema,
});

const playerSchema = z.object({
  name: z.string().max(MAX_PLAYER_NAME_LENGTH).min(1),
  colour: coloursSchema,
  isBot: z.boolean(),
  numberOfConsecutiveSix: z.number(),
  playerFinishTime: z.number(),
  tokens: tokenSchema.array().length(4),
});

export const schema = z.object({
  version: z.number(),
  saveTime: z.number(),
  currentPlayerColour: coloursSchema,
  playerFinishOrder: coloursSchema.array().max(4),
  players: playerSchema.array().max(4).min(2),
  dice: diceSchema.array().max(4).min(2),
  session: z.object({
    gameStartTime: z.number(),
    gameInactiveTime: z.number(),
  }),
});

export type TStoredStateSchema = z.infer<typeof schema>;
export type TStoredTokenSchema = z.infer<typeof tokenSchema>;
export type TStoredPlayerSchema = z.infer<typeof playerSchema>;
