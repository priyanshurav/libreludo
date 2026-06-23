import { compressToBase64, decompressFromBase64 } from 'lz-string';
import type { TStoredStateSchema } from './schema';
import { SAVE_GAME_KEY } from './constants';

export const storeSaveInStorage = (state: TStoredStateSchema): void => {
  const json = JSON.stringify(state);
  const compressed = compressToBase64(json);
  localStorage.setItem(SAVE_GAME_KEY, compressed);
};

export const retrieveSaveFromStorage = (): unknown => {
  try {
    const rawState = localStorage.getItem(SAVE_GAME_KEY);
    if (!rawState) return null;
    const uncompressed = decompressFromBase64(rawState);
    if (!uncompressed) return null;
    return JSON.parse(uncompressed);
  } catch {
    return null;
  }
};

export const deleteSaveFromStorage = (): void => {
  localStorage.removeItem(SAVE_GAME_KEY);
};

export const saveExists = (): boolean => {
  return localStorage.getItem(SAVE_GAME_KEY) !== null;
};
