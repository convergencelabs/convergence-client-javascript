import {ModelReference} from "./ModelReference";
import {ReferenceFilter} from "./ReferenceFilter";

export class ReferenceMap {

  // stored by sessionId first, then key.
  private _references: {[key: string]: {[key: string]: ModelReference<any>}};

  constructor() {
    this._references = {};
  }

  put(reference: ModelReference<any>): void {
    const sessionId: string = reference.sessionId();
    const key: string = reference.key();

    let sessionModels: {[key: string]: ModelReference<any>} = this._references[sessionId];
    if (sessionModels === undefined) {
      sessionModels = {};
      this._references[sessionId] = sessionModels;
    }

    if (sessionModels[key] !== undefined) {
      throw new Error("Model reference already exists");
    }

    sessionModels[key] = reference;
  }

  get(sessionId: string, key: string): ModelReference<any> {
    const sessionModels: {[key: string]: ModelReference<any>} = this._references[sessionId];
    if (sessionModels !== undefined) {
      return sessionModels[key];
    } else {
      return;
    }
  }

  getAll(filter?: ReferenceFilter): ModelReference<any>[] {
    if (typeof filter === "undefined") {
      filter = {};
    }

    const refs: ModelReference<any>[] = [];

    let sessionIds: string[];
    if (filter.sessionId !== undefined && filter.sessionId !== null) {
      sessionIds = [filter.sessionId];
    } else {
      sessionIds = Object.getOwnPropertyNames(this._references);
    }

    sessionIds.forEach((sid: string) => {
      const sessionRefs: {[key: string]: ModelReference<any>} = this._references[sid];
      const keys: string[] = filter.key !== undefined ? [filter.key] : Object.getOwnPropertyNames(sessionRefs);
      keys.forEach((k: string) => {
        const r: ModelReference<any> = sessionRefs[k];
        if (r !== undefined) {
          refs.push(r);
        }
      });
    });

    return refs;
  }

  removeAll(): void {
    this._references = {};
  }

  remove(sessionId: string, key: string): ModelReference<any> {
    const sessionModels: {[key: string]: ModelReference<any>} = this._references[sessionId];
    if (sessionModels !== undefined) {
      const current: ModelReference<any> = sessionModels[key];
      delete sessionModels[key];
      return current;
    } else {
      return;
    }
  }

  removeBySession(sessionId: string): void {
    delete this._references[sessionId];
  }

  removeByKey(key: string): void {
    var sessionIds: string[] = Object.getOwnPropertyNames(this._references);
    sessionIds.forEach((sessionId: string) => {
      delete this._references[sessionId][key];
    });
  }
}
