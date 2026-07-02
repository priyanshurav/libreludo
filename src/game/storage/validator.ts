import * as z from 'zod';
import { type TStoredStateSchema, schema } from './schema';
import type { TResult } from '../../types/storage';

export const validateStoredState = (state: unknown): TResult<TStoredStateSchema, z.ZodError> => {
  const { success, data, error } = z.safeParse(schema, state);
  if (success) {
    return { success: true, data, error: null };
  } else {
    return { success: false, data: null, error };
  }
};
