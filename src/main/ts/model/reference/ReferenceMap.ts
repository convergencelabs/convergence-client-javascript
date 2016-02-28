import {ModelReference} from "./ModelReference";

export class ReferenceMap {

  // stored by sessionId first, then key.
  private _references: {[key: string]: {[key: string]: ModelReference}};

  constructor() {
    this._references = {};
  }

  put(reference: ModelReference): void {
    var sessionId: string = reference.sessionId();
    var key: string = reference.key();

    var sessionModels: {[key: string]: ModelReference} = this._references[sessionId];
    if (sessionModels === undefined) {
      sessionModels = {};
      this._references[sessionId] = sessionModels;
    }

    if (sessionModels[key] !== undefined) {
      throw new Error("Model reference already exists");
    }

    sessionModels[key] = reference;
  }

  get(sessionId: string, key: string): ModelReference {
    var sessionModels: {[key: string]: ModelReference} = this._references[sessionId];
    if (sessionModels !== undefined) {
      return sessionModels[key];
    } else {
      return;
    }
  }

  getAll(sessionId?: string, key?: string): ModelReference[] {
    var refs: ModelReference[] = [];

    var sessionIds: string[];
    if (sessionId !== undefined && sessionId !== null) {
      sessionIds = [sessionId];
    } else {
      sessionIds = Object.getOwnPropertyNames(this._references);
    }

    sessionIds.forEach((sid: string) => {
      var sessionRefs: {[key: string]: ModelReference} = this._references[sid];
      var keys: string[] = key !== undefined ? [key] : Object.getOwnPropertyNames(sessionRefs);
      keys.forEach((k: string) => {
        refs.push(sessionRefs[k]);
      });
    });

    return refs;
  }

  remove(sessionId: string, key: string): void {
    var sessionModels: {[key: string]: ModelReference} = this._references[sessionId];
    if (sessionModels !== undefined) {
      delete sessionModels[key];
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
