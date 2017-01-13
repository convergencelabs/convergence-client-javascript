import {DataValue} from "../../dataValue";
export interface Change {
  type: string;
}

export interface DiscreteChange extends Change {
  id: string;
}

export interface BatchChange extends Change {
  ops: DiscreteChange[];
}

export interface ArrayInsert extends DiscreteChange {
  index: number;
  value: DataValue;
}

export interface ArrayMove extends DiscreteChange {
  fromIndex: number;
  toIndex: number;
}

export interface ArrayRemove extends DiscreteChange {
  index: number;
}

export interface ArrayReplace extends DiscreteChange {
  index: number;
  value: DataValue;
}

export interface ArraySet extends DiscreteChange {
  value: DataValue[];
}

export interface BooleanSet extends DiscreteChange {
  value: boolean;
}

export interface NumberAdd extends DiscreteChange {
  value: number;
}

export interface NumberSet extends DiscreteChange {
  value: number;
}

export interface ObjectAddProperty extends DiscreteChange {
  prop: string;
  value: DataValue;
}

export interface ObjectRemoveProperty extends DiscreteChange {
  prop: string;
}

export interface ObjectSetProperty extends DiscreteChange {
  prop: string;
  value: DataValue;
}

export interface ObjectSet extends DiscreteChange {
  value: {[key: string]: DataValue};
}

export interface StringInsert extends DiscreteChange {
  index: number;
  value: string;
}

export interface StringRemove extends DiscreteChange {
  index: number;
  value: string;
}

export interface StringSet extends DiscreteChange {
  noOp: boolean;
  value: string;
}

export interface DateSet extends DiscreteChange {
  noOp: boolean;
  value: Date;
}
