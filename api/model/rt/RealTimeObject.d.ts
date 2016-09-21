import {RealTimeValue} from "./RealTimeValue";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {ModelReference} from "../reference/ModelReference";
import {LocalPropertyReference} from "../reference/LocalPropertyReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";

export declare class RealTimeObject extends RealTimeValue<Map<string, any>> implements RealTimeContainerValue<Map<string, any>> {

  static Events: any;

  get(key: string): RealTimeValue<any>;

  set(key: string, value: any): RealTimeValue<any>;

  remove(key: string): void;

  keys(): string[];

  hasKey(key: string): boolean;

  forEach(callback: (model: RealTimeValue<any>, key?: string) => void): void;

  elementAt(pathArgs: any): RealTimeValue<any>;

  propertyReference(key: string): LocalPropertyReference;

  reference(sessionId: string, key: string): ModelReference<any>;

  references(filter: ReferenceFilter): ModelReference<any>[];
}
