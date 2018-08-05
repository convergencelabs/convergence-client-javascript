export interface QuillDelta {
  ops: QuillDeltaOperation[];
}

export type QuillDeltaOperation =
  ({ insert: any } | { delete: number } | { retain: number }) & { attributes?: { [key: string]: any } };
