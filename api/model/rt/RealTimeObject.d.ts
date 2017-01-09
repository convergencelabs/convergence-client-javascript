import {RealTimeElement} from "./RealTimeElement";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {ModelReference} from "../reference/ModelReference";
import {LocalPropertyReference} from "../reference/LocalPropertyReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {ObservableObject, ObservableObjectEvents} from "../observable/ObservableObject";

export interface RealTimeObjectEvents extends ObservableObjectEvents {
}

export declare class RealTimeObject extends RealTimeElement<{[key: string]: any}>
  implements RealTimeContainerElement<{[key: string]: any}>, ObservableObject {

  public static readonly Events: RealTimeObjectEvents;

  public get(key: string): RealTimeElement<any>;

  public set(key: string, value: any): RealTimeElement<any>;

  public remove(key: string): RealTimeElement<any>;

  public keys(): string[];

  public hasKey(key: string): boolean;

  public forEach(callback: (element: RealTimeElement<any>, key?: string) => void): void;

  public elementAt(pathArgs: any): RealTimeElement<any>;

  public propertyReference(key: string): LocalPropertyReference;

  public reference(sessionId: string, key: string): ModelReference<any>;

  public references(filter: ReferenceFilter): Array<ModelReference<any>>;
}
