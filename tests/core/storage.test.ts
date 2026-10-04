import { describe, expect, it } from 'vitest';
import { LocalStorageSaveStore, type KeyValueStorage } from '../../src/platform/storage';

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

const throwing: KeyValueStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('LocalStorageSaveStore', () => {
  it('starts with a zero high score', () => {
    expect(new LocalStorageSaveStore(memoryStorage()).loadHighScore()).toBe(0);
  });

  it('remembers a saved high score', () => {
    const store = new LocalStorageSaveStore(memoryStorage());

    store.saveHighScore(120);

    expect(store.loadHighScore()).toBe(120);
  });

  it('reads zero when storage throws, without throwing', () => {
    expect(new LocalStorageSaveStore(throwing).loadHighScore()).toBe(0);
  });

  it('ignores write errors', () => {
    expect(() => new LocalStorageSaveStore(throwing).saveHighScore(10)).not.toThrow();
  });

  it('reads zero from invalid JSON', () => {
    const storage = memoryStorage({ 'horde-runner:save': '{not json' });

    expect(new LocalStorageSaveStore(storage).loadHighScore()).toBe(0);
  });

  it('reads zero from an unknown save version', () => {
    const storage = memoryStorage({ 'horde-runner:save': '{"version":2,"highScore":99}' });

    expect(new LocalStorageSaveStore(storage).loadHighScore()).toBe(0);
  });

  it('works without any storage at all', () => {
    const store = new LocalStorageSaveStore(null);

    expect(() => store.saveHighScore(5)).not.toThrow();
    expect(store.loadHighScore()).toBe(0);
  });
});
