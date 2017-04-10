import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {Path, PathElement} from "../Path";
import {ModelReference} from "../reference/ModelReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {ObservableElement, ObservableElementEvents} from "../observable/ObservableElement";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";
import {RealTimeModel} from "./RealTimeModel";

export interface RealTimeElementEvents extends ObservableElementEvents {
}

export declare abstract class RealTimeElement<T>
  extends ConvergenceEventEmitter<ConvergenceEvent> implements ObservableElement<T> {

  public static readonly Events: RealTimeElementEvents;

  public model(): RealTimeModel;

  public id(): string;

  public type(): string;

  public path(): Path;

  public relativePath(): PathElement;

  public parent(): RealTimeContainerElement<any>;

  public removeFromParent(): void;

  public isAttached(): boolean;

  public isDetached(): boolean;

  public value(): T;
  public value(value: T): void;

  public reference(sessionId: string, key: string): ModelReference<any>;

  public references(filter?: ReferenceFilter): Array<ModelReference<any>>;

  public toJSON(): any;
}
