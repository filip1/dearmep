// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ObjectUtil } from './object.util';

describe('ObjectUtil', () => {
  describe('UnflattenObject', () => {
    it('should handle undefined', () => {
      expect(ObjectUtil.UnflattenObject(undefined)).toBe(undefined);
    });
    it('should handle empty object', () => {
      expect(ObjectUtil.UnflattenObject({})).toEqual({});
    });
    it('should unflatten simple object', () => {
      const simpleObj = {
        A: 'X',
        B: 'Y',
        C: 'Z',
      };
      expect(ObjectUtil.UnflattenObject(simpleObj)).toEqual(simpleObj);
    });
    it('should unflatten nested object', () => {
      const flattenedNested = {
        A: 1,
        'B.X': 2,
        'B.Y': 3,
        'C.X.Y': 4,
      };
      const nested = {
        A: 1,
        B: {
          X: 2,
          Y: 3,
        },
        C: { X: { Y: 4 } },
      };
      expect(ObjectUtil.UnflattenObject(flattenedNested)).toEqual(nested);
    });
    it('should unflatten object with array', () => {
      const flattenedNested = {
        A: 1,
        'B.0': 2,
        'B.1': 3,
        'B.2.X': 4,
        'B.2.Y': 5,
        'B.2.Z.0': 6,
        'B.2.Z.1': 7,
      };
      const nested = {
        A: 1,
        B: [
          2,
          3,
          {
            X: 4,
            Y: 5,
            Z: [6, 7],
          },
        ],
      };
      expect(ObjectUtil.UnflattenObject(flattenedNested)).toEqual(nested);
    });
  });
});
