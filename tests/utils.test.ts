import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sleep } from '../src/utils/sleep';

describe('Test utility functions', () => {
  describe('utils/sleep', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns a Promise', () => {
      const result = sleep(500);
      expect(result).toBeInstanceOf(Promise);
    });

    it('resolves after the specified milliseconds', async () => {
      const callback = vi.fn();
      const promise = sleep(1000).then(callback);
      vi.advanceTimersByTime(999);
      await Promise.resolve(); // flush microtasks
      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      await Promise.resolve();
      expect(callback).toHaveBeenCalledOnce();
      await expect(promise).resolves.toBeUndefined();
    });

    it('resolves immediately when ms is 0', async () => {
      const callback = vi.fn();
      const promise = sleep(0).then(callback);
      vi.advanceTimersByTime(0);
      await Promise.resolve();
      expect(callback).toHaveBeenCalledOnce();
      await expect(promise).resolves.toBeUndefined();
    });
  });
});
