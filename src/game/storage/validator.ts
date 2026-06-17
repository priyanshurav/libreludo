import * as z from 'zod';
import { type TStoredStateSchema, schema } from './schema';

type TSchemaValidatorResult =
  | { success: true; result: TStoredStateSchema }
  | { success: false; result: z.ZodError };

export const validateStoredState = (state: unknown): TSchemaValidatorResult => {
  const { success, data, error } = z.safeParse(schema, state);
  if (success) {
    return { success: true, result: data };
  } else {
    return { success: false, result: error };
  }
};
