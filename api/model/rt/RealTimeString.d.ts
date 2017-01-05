import {RealTimeElement} from "./RealTimeElement";
import {ModelReference} from "../reference/ModelReference";
import {LocalIndexReference} from "../reference/LocalIndexReference";
import {LocalRangeReference} from "../reference/LocalRangeReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {ObservableString, ObservableStringEvents} from "../observable/ObservableString";

export interface RealTimeStringEvents extends ObservableStringEvents {
}

export declare class RealTimeString extends RealTimeElement<string> implements ObservableString {

  public static readonly Events: RealTimeStringEvents;

  public insert(index: number, value: string): void;

  public remove(index: number, length: number): void;

  public length(): number;

  public indexReference(key: string): LocalIndexReference;

  public rangeReference(key: string): LocalRangeReference;

  public reference(sessionId: string, key: string): ModelReference<any>;

  public references(filter?: ReferenceFilter): ModelReference<any>[];
}
