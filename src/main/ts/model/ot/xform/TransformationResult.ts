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
