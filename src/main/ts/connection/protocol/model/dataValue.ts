import {CodeMap} from "../../../util/CodeMap";
import {DataValueType} from "../../../model/dataValue";
import {DataValue} from "../../../model/dataValue";
import {ObjectValue} from "../../../model/dataValue";
import {StringValue} from "../../../model/dataValue";
import {NumberValue} from "../../../model/dataValue";
import {BooleanValue} from "../../../model/dataValue";
import {ArrayValue} from "../../../model/dataValue";

var DataValueTypeCodes: CodeMap = new CodeMap();
DataValueTypeCodes.put(0, DataValueType.OBJECT);
DataValueTypeCodes.put(1, DataValueType.ARRAY);
DataValueTypeCodes.put(2, DataValueType.STRING);
DataValueTypeCodes.put(3, DataValueType.NUMBER);
DataValueTypeCodes.put(4, DataValueType.BOOLEAN);
DataValueTypeCodes.put(5, DataValueType.NULL);

export var DataValueSerializer: (dv: DataValue) => any = (dv: DataValue) => {
  var result: any = {i: dv.id, "?": "" + DataValueTypeCodes.code(dv.type)};

  switch (dv.type) {
    case DataValueType.OBJECT:
      var objVal: ObjectValue = <ObjectValue>dv;
      var mapped: any = {};
      Object.getOwnPropertyNames(objVal.children).forEach((prop: string) => {
        mapped[prop] = DataValueSerializer(objVal.children[prop]);
      });
      result.c = mapped;
      break;
    case DataValueType.ARRAY:
      result.c = (<ArrayValue>dv).children.map((child: DataValue) => {
        return DataValueSerializer(child);
      });
      break;
    case DataValueType.STRING:
      result.v = (<StringValue>dv).value;
      break;
    case DataValueType.NUMBER:
      result.v = (<NumberValue>dv).value;
      break;
    case DataValueType.BOOLEAN:
      result.v = (<BooleanValue>dv).value;
      break;
    case DataValueType.NULL:
      // No Op
      break;
    default:
      throw new Error("Unknown data value type: " + dv.type);
  }
  return result;
};

export var DataValueDeserializer: (dv: any) => DataValue = (dv: any) => {
  var id: string = dv["?"];
  var type: string = DataValueTypeCodes.value(Number(dv.c));

  switch (type) {
    case DataValueType.OBJECT:
      var objectChildren: {[key: string]: DataValue} = {};
      Object.getOwnPropertyNames(dv.c).forEach((prop: string) => {
        objectChildren[prop] = DataValueDeserializer(dv.c[prop]);
      });
      return <ObjectValue>{
        id: id,
        type: type,
        children: objectChildren
      };
    case DataValueType.ARRAY:
      var arrayChildren: DataValue[] = dv.c.map((child: any) => {
        return DataValueDeserializer(child);
      });
      return <ArrayValue>{
        id: id,
        type: type,
        children: arrayChildren
      };
    case DataValueType.STRING:
    case DataValueType.NUMBER:
    case DataValueType.BOOLEAN:
      return <DataValue>{
        id: id,
        type: type,
        value: dv.v
      };
    case DataValueType.NULL:
      return <DataValue>{
        id: id,
        type: type
      };
    default:
      throw new Error("Unknown data value type: " + dv.type);
  }
};
