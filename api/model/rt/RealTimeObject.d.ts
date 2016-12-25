import {RealTimeElement} from "./RealTimeElement";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {ModelReference} from "../reference/ModelReference";
import {LocalPropertyReference} from "../reference/LocalPropertyReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";

export declare class RealTimeObject extends RealTimeElement<Map<string, any>>
  implements RealTimeContainerElement<Map<string, any>> {

  public static Events: any;

  public get(key: string): RealTimeElement<any>;

  public set(key: string, value: any): RealTimeElement<any>;

  public remove(key: string): RealTimeElement<any>;

  public keys(): string[];

  public hasKey(key: string): boolean;

  public forEach(callback: (element: RealTimeElement<any>, key?: string) => void): void;

  public elementAt(pathArgs: any): RealTimeElement<any>;

  public propertyReference(key: string): LocalPropertyReference;

  public reference(sessionId: string, key: string): ModelReference<any>;

  public references(filter: ReferenceFilter): ModelReference<any>[];
}
