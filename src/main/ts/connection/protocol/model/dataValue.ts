export interface DataValue {
  id: string;
  type: string;
}

export interface NullValue extends DataValue {

}

export interface StringValue extends DataValue {
  value: string;
}

export interface NumberValue extends DataValue {
  value: number;
}

export interface BooleanValue extends DataValue {
  value: boolean;
}

export interface ObjectValue extends DataValue {
  children: {[key: string]: DataValue};
}

export interface ArrayValue extends DataValue {
  children: DataValue[];
}
