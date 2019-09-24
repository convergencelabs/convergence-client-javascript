const types: {[key: string]: string}  = {
  OBJECT: "object",
  ARRAY: "array",
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  NULL: "null",
  DATE: "date"
};

Object.freeze(types);

/**
 * @hidden
 * @internal
 */
export const DataValueType: any = types;


export interface DataValue {
  id: string;
  type: string;
}

/**
 * @hidden
 * @internal
 */
export interface NullValue extends DataValue {

}

/**
 * @hidden
 * @internal
 */
export interface StringValue extends DataValue {
  value: string;
}

/**
 * @hidden
 * @internal
 */
export interface NumberValue extends DataValue {
  value: number;
}

/**
 * @hidden
 * @internal
 */
export interface BooleanValue extends DataValue {
  value: boolean;
}

export interface ObjectValue extends DataValue {
  children: {[key: string]: DataValue};
}

/**
 * @hidden
 * @internal
 */
export interface ArrayValue extends DataValue {
  children: DataValue[];
}

/**
 * @hidden
 * @internal
 */
export interface DateValue extends DataValue {
  value: Date;
}
