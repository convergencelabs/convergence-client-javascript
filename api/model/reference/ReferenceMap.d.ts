import {ModelReference} from "./ModelReference";
import {ReferenceFilter} from "./ReferenceFilter";
export declare class ReferenceMap {
  private _references;

  constructor();

  put(reference: ModelReference<any>): void;

  get(sessionId: string, key: string): ModelReference<any>;

  getAll(filter?: ReferenceFilter): ModelReference<any>[];

  removeAll(): void;

  remove(sessionId: string, key: string): ModelReference<any>;

  removeBySession(sessionId: string): void;

  removeByKey(key: string): void;
}
