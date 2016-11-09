const types: {[key: string]: string}  = {
  COMPOUND: "compound",
  ARRAY_INSERT: "ArrayInsert",
  ARRAY_REORDER: "ArrayReorder",
  ARRAY_REMOVE: "ArrayRemove",
  ARRAY_SET: "ArraySet",
  ARRAY_VALUE: "ArrayValue",
  BOOLEAN_VALUE: "BooleanValue",
  NUMBER_ADD: "NumberAdd",
  NUMBER_VALUE: "NumberValue",
  OBJECT_ADD: "ObjectAdd",
  OBJECT_REMOVE: "ObjectRemove",
  OBJECT_SET: "ObjectSet",
  OBJECT_VALUE: "ObjectValue",
  STRING_INSERT: "StringInsert",
  STRING_REMOVE: "StringRemove",
  STRING_VALUE: "StringValue"
};

Object.freeze(types);

export var OperationType: any = types;
