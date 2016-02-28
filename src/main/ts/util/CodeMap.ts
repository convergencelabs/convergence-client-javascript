export class CodeMap {
  private _map: {[key: string]: number};
  private _reverse: {[key: number]: string};

  constructor(map: {[key: string]: number} = {}) {
    this._map = {};
    this._reverse = {};

    Object.getOwnPropertyNames(map).forEach((item: string) => {
      this._map[item] = map[item];
      this._reverse[this._map[item]] = item;
    });
  }

  put(code: number, value: string): void {
    this._map[value] = code;
    this._reverse[code] = value;
  }

  code(value: string): number {
    return this._map[value];
  }

  value(code: number): string {
    return this._reverse[code];
  }
}
