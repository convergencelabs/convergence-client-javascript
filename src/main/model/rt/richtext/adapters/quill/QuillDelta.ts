/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

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
