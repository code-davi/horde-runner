/** Onde o progresso do jogador fica salvo. No subprojeto 3 ganha moedas e upgrades. */
export interface SaveStore {
  loadHighScore(): number;
  saveHighScore(score: number): void;
}

export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

const SAVE_KEY = 'horde-runner:save';
const SAVE_VERSION = 1;

interface SaveData {
  version: typeof SAVE_VERSION;
  highScore: number;
}

/** Save em localStorage (ou equivalente). Qualquer falha vira "sem save", nunca um erro. */
export class LocalStorageSaveStore implements SaveStore {
  private readonly storage: KeyValueStorage | null;

  constructor(storage: KeyValueStorage | null) {
    this.storage = storage;
  }

  loadHighScore(): number {
    return this.read()?.highScore ?? 0;
  }

  saveHighScore(score: number): void {
    const data: SaveData = { version: SAVE_VERSION, highScore: score };
    try {
      this.storage?.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // Storage cheio ou bloqueado (ex.: navegação privada): o jogo segue sem salvar (spec §7).
    }
  }

  private read(): SaveData | null {
    try {
      const parsed: unknown = JSON.parse(this.storage?.getItem(SAVE_KEY) ?? 'null');
      return isSaveData(parsed) ? parsed : null;
    } catch {
      // Storage bloqueado ou JSON corrompido: trata como save inexistente (spec §7).
      return null;
    }
  }
}

function isSaveData(value: unknown): value is SaveData {
  if (typeof value !== 'object' || value === null) return false;
  const data = value as Record<string, unknown>;
  return data['version'] === SAVE_VERSION && typeof data['highScore'] === 'number';
}

/** Save do navegador; funciona mesmo quando o acesso ao localStorage é proibido. */
export function createBrowserSaveStore(): SaveStore {
  try {
    return new LocalStorageSaveStore(window.localStorage);
  } catch {
    // Alguns navegadores lançam erro só de acessar `window.localStorage`.
    return new LocalStorageSaveStore(null);
  }
}
