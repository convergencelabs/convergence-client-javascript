import {RealTimeElement} from "./RealTimeElement";
import {ModelReference} from "../reference/ModelReference";
import {LocalIndexReference} from "../reference/LocalIndexReference";
import {LocalRangeReference} from "../reference/LocalRangeReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";

export declare class RealTimeString extends RealTimeElement<string> {

  static Events: any;

  insert(index: number, value: string): void;

  remove(index: number, length: number): void;

  length(): number;

  indexReference(key: string): LocalIndexReference;

  rangeReference(key: string): LocalRangeReference;

  reference(sessionId: string, key: string): ModelReference<any>;

  references(filter?: ReferenceFilter): ModelReference<any>[];

}
