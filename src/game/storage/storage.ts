import LZString from 'lz-string';
import type { TStoredStateSchema } from './schema';
import { SAVE_GAME_KEY } from './constants';

export const storeSaveInStorage = (state: TStoredStateSchema): void => {
  try {
    const json = JSON.stringify(state);
    const compressed = LZString.compressToBase64(json);
    localStorage.setItem(SAVE_GAME_KEY, compressed);
  } catch (e) {
    console.error(e);
  }
};

export const retrieveSaveFromStorage = (): unknown => {
  try {
    const rawState = localStorage.getItem(SAVE_GAME_KEY);
    if (!rawState) return null;
    const uncompressed = LZString.decompressFromBase64(rawState);
    if (!uncompressed) return null;
    return JSON.parse(uncompressed);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const deleteSaveFromStorage = (): void => {
  try {
    localStorage.removeItem(SAVE_GAME_KEY);
  } catch (e) {
    console.error(e);
  }
};

export const saveExists = (): boolean => {
  try {
    return localStorage.getItem(SAVE_GAME_KEY) !== null;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const isStorageSupported = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};
