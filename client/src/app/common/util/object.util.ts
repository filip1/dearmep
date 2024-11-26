// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export class ObjectUtil {
  /**
   * Rebuild the hierarchical strucutre of an object that was flattened.
   * Example: { "A": 1, "B.X": 2, "B.Y": 3 } => { "A": 1, "B": { "X": 2, "Y": 3 } }
   */
  public static UnflattenObject(flattened?: Record<string, unknown>): unknown {
    if (!flattened) {
      return flattened;
    }

    const unflattened: Record<string, unknown> = {};

    for (const key of Object.keys(flattened)) {
      const keySections = key.split('.');
      const value = flattened[key];
      this.applyValueRec(unflattened, keySections, value);
    }

    return unflattened;
  }

  private static applyValueRec(
    obj: Record<string, unknown>,
    keySectins: string[],
    value: unknown
  ) {
    if (keySectins.length === 0) {
      return;
    }
    const key = keySectins[0];

    if (keySectins.length === 1) {
      // last key-section reached => set value
      if (!Array.isArray(obj)) {
        obj[key] = value;
      } else {
        const arr = obj as unknown[];
        const index = parseInt(key);
        arr[index] = value;
      }
      return;
    } else {
      // not the last key-section => add empty object or array
      if (!(key in obj)) {
        const nextKey = keySectins[1];
        obj[key] = this.isInt(nextKey) ? [] : {};
      }
    }

    const remainingKeySections = keySectins.slice(1, undefined);
    this.applyValueRec(
      obj[key] as Record<string, unknown>,
      remainingKeySections,
      value
    );
  }

  private static isInt(str: string): boolean {
    const n = parseInt(str, 10);
    return !Number.isNaN(n);
  }
}
