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
export interface TransformationResult {
  obsolete?: boolean;
}

/**
 * @hidden
 * @internal
 */
export interface IndexTransformation extends TransformationResult {
  index?: number;
}

/**
 * @hidden
 * @internal
 */
export interface RangeTransformation extends TransformationResult {
  fromIndex?: number;
  toIndex?: number;
}

/**
 * @hidden
 * @internal
 */
export interface TransformationResultPair<S, C> {
  server?: S;
  client?: C;
}
