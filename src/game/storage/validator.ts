import * as z from 'zod';
import { type TStoredStateSchema, schema } from './schema';
import type { TResult } from '../../types/storage';
import { SAVE_VERSION } from './constants';

const versionSchema = z.looseObject({ version: z.number().int() });

export const validateStoredState = (state: unknown): TResult<TStoredStateSchema, string> => {
  const versionPayload = z.safeParse(versionSchema, state);

  if (!versionPayload.success) {
    console.error(versionPayload.error);
    return { success: false, data: null, error: 'Unable to load save file' };
  }

  if (versionPayload.data.version !== SAVE_VERSION)
    return {
      success: false,
      data: null,
      error: `Save version mismatch. Found: v${versionPayload.data.version} Expected: v${SAVE_VERSION}`,
    };

  const payload = z.safeParse(schema, state);

  if (payload.success) {
    return { success: true, data: payload.data, error: null };
  } else {
    console.error(payload.error);
    return { success: false, data: null, error: 'Unable to load save file' };
  }
};
