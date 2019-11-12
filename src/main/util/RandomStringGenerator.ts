/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
