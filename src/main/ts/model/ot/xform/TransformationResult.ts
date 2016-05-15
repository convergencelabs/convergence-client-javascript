export interface TransformationResult {
  obsolete?: boolean;
}

export interface IndexTransformation extends TransformationResult {
  index?: number;
}

export interface RangeTransformation extends TransformationResult {
  fromIndex?: number;
  toIndex?: number;
}

export interface TransformationResultPair<S, C> {
  server?: S;
  client?: C;
}
