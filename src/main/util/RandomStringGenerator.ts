/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

/**
 * @hidden
 * @internal
 */
export class RandomStringGenerator {
  public static UpperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  public static LowerCaseLetters = RandomStringGenerator.UpperCaseLetters.toLowerCase();
  public static Digits = "0123456789";
  public static AlphaNumeric =
    RandomStringGenerator.UpperCaseLetters + RandomStringGenerator.LowerCaseLetters + RandomStringGenerator.Digits;
  public static Base64 = RandomStringGenerator.AlphaNumeric + "/" + "+";

  private readonly _symbols: string;
  private readonly _length: number;

  constructor(
    length: number,
    symbols: string) {

    if (length < 1) {
      throw new Error();
    }

    if (symbols.length < 2) {
      throw new Error();
    }
    this._symbols = symbols;
    this._length = length;
  }

  public nextString(): string {
    let result = "";
    for (let i = 0; i < this._length; i++) {
      result += this._symbols.charAt(Math.floor(Math.random() * this._length));
    }

    return result;
  }
}
