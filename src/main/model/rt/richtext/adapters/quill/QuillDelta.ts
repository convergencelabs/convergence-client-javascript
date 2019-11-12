/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
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
