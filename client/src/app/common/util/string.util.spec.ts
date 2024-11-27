// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { StringUtil } from './string.util';

const delimiter = ', ';
const lastDelimiter = ' and ';

const testCases = [
  { in: [], out: '' },
  { in: ['cats'], out: 'cats' },
  { in: ['cats', 'dogs'], out: 'cats and dogs' },
  { in: ['cats', 'dogs', 'mice'], out: 'cats, dogs and mice' },
  {
    in: ['cats', 'dogs', 'mice', 'hamsters'],
    out: 'cats, dogs, mice and hamsters',
  },
];

describe('StringUtil', () => {
  describe('JoinAnd', () => {
    for (const testCase of testCases) {
      it(`should transform ${JSON.stringify(testCase.in)} to "${testCase.out}"`, () => {
        expect(StringUtil.JoinAnd(testCase.in, delimiter, lastDelimiter)).toBe(
          testCase.out
        );
      });
    }
  });
});
