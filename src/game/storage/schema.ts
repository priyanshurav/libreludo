import * as z from 'zod';
import type { TPlayerColour } from '../../types';

const coloursSchema = z.union(
  (['blue', 'red', 'green', 'yellow'] satisfies TPlayerColour[]).map((s) => z.literal(s))
);

const coordsSchema = z.object({ x: z.number(), y: z.number() });

const tokenSchema = z.object({
  id: z.number(),
  coordinates: coordsSchema,
  isLocked: z.boolean(),
  isActive: z.boolean(),
  hasTokenReachedHome: z.boolean(),
  tokenAlignmentData: z.object({
    xOffset: z.number(),
    yOffset: z.number(),
    scaleFactor: z.number(),
  }),
});

const diceSchema = z.object({
  diceNumber: z.number(),
  colour: coloursSchema,
});

const playerSchema = z.object({
  name: z.string(),
  colour: coloursSchema,
  isBot: z.boolean(),
  numberOfConsecutiveSix: z.number(),
  playerFinishTime: z.number(),
  tokens: tokenSchema.array(),
});

export const schema = z.object({
  version: z.number(),
  saveTime: z.number(),
  currentPlayerColour: coloursSchema,
  playerFinishOrder: coloursSchema.array(),
  players: playerSchema.array(),
  dice: diceSchema.array(),
  session: z.object({
    gameStartTime: z.number(),
    gameInactiveTime: z.number(),
  }),
});

export type TStoredStateSchema = z.infer<typeof schema>;
export type TStoredTokenSchema = z.infer<typeof tokenSchema>;
export type TStoredPlayerSchema = z.infer<typeof playerSchema>;
