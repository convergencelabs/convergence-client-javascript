export declare class ConvergenceServerError extends Error {
  public readonly code: string;
  public readonly details: {[key: string]: any};

  constructor(m: string, code: string, details: {[key: string]: any});
}
