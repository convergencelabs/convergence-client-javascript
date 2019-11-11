/**
 * @hidden
 * @internal
 */
export interface QuillDelta {
  ops: QuillDeltaOperation[];
}

/**
 * @hidden
 * @internal
 */
export type QuillDeltaOperation =
  ({ insert: any } | { delete: number } | { retain: number }) & { attributes?: { [key: string]: any } };
