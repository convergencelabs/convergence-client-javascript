export declare class CodeMap {
  private _map;
  private _reverse;

  constructor(map?: {
    [key: string]: number;
  });

  put(code: number, value: string): void;

  code(value: string): number;

  value(code: number): string;
}
