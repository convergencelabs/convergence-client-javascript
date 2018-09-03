import {DataValue} from "../../dataValue";

/**
 * @hidden
 * @internal
 */
export interface Change {
  type: string;
}

/**
 * @hidden
 * @internal
 */
export interface DiscreteChange extends Change {
  id: string;
}

/**
 * @hidden
 * @internal
 */
export interface BatchChange extends Change {
  ops: DiscreteChange[];
}

/**
 * @hidden
 * @internal
 */
export interface ArrayInsert extends DiscreteChange {
  index: number;
  value: DataValue;
}

/**
 * @hidden
 * @internal
 */
export interface ArrayMove extends DiscreteChange {
  fromIndex: number;
  toIndex: number;
}

/**
 * @hidden
 * @internal
 */
export interface ArrayRemove extends DiscreteChange {
  index: number;
}

/**
 * @hidden
 * @internal
 */
export interface ArrayReplace extends DiscreteChange {
  index: number;
  value: DataValue;
}

/**
 * @hidden
 * @internal
 */
export interface ArraySet extends DiscreteChange {
  value: DataValue[];
}

/**
 * @hidden
 * @internal
 */
export interface BooleanSet extends DiscreteChange {
  value: boolean;
}

/**
 * @hidden
 * @internal
 */
export interface NumberAdd extends DiscreteChange {
  value: number;
}

/**
 * @hidden
 * @internal
 */
export interface NumberSet extends DiscreteChange {
  value: number;
}

/**
 * @hidden
 * @internal
 */
export interface ObjectAddProperty extends DiscreteChange {
  prop: string;
  value: DataValue;
}

/**
 * @hidden
 * @internal
 */
export interface ObjectRemoveProperty extends DiscreteChange {
  prop: string;
}

/**
 * @hidden
 * @internal
 */
export interface ObjectSetProperty extends DiscreteChange {
  prop: string;
  value: DataValue;
}

/**
 * @hidden
 * @internal
 */
export interface ObjectSet extends DiscreteChange {
  value: {[key: string]: DataValue};
}

/**
 * @hidden
 * @internal
 */
export interface StringInsert extends DiscreteChange {
  index: number;
  value: string;
}

export interface StringRemove extends DiscreteChange {
  index: number;
  value: string;
}

/**
 * @hidden
 * @internal
 */
export interface StringSet extends DiscreteChange {
  noOp: boolean;
  value: string;
}

/**
 * @hidden
 * @internal
 */
export interface DateSet extends DiscreteChange {
  noOp: boolean;
  value: Date;
}
