const types: {[key: string]: string}  = {
  Object: "object",
  Array: "array",
  String: "string",
  Number: "number",
  Boolean: "boolean",
  Null: "null",
  Undefined: "undefined"
};

Object.freeze(types);

export const ModelElementType: any = types;
