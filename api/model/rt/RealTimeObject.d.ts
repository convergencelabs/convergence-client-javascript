import {RealTimeElement} from "./RealTimeElement";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {ModelReference} from "../reference/ModelReference";
import {LocalPropertyReference} from "../reference/LocalPropertyReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";

export declare class RealTimeObject extends RealTimeElement<Map<string, any>> implements RealTimeContainerElement<Map<string, any>> {

  static Events: any;

  get(key: string): RealTimeElement<any>;

  set(key: string, value: any): RealTimeElement<any>;

  remove(key: string): RealTimeElement<any>;

  keys(): string[];

  hasKey(key: string): boolean;

  forEach(callback: (element: RealTimeElement<any>, key?: string) => void): void;

  elementAt(pathArgs: any): RealTimeElement<any>;

  propertyReference(key: string): LocalPropertyReference;

  reference(sessionId: string, key: string): ModelReference<any>;

  references(filter: ReferenceFilter): ModelReference<any>[];
}
