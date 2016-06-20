import {ModelReference} from "./ModelReference";

export class ReferenceMap {

  // stored by sessionId first, then key.
  private _references: {[key: string]: {[key: string]: ModelReference<any>}};

  constructor() {
    this._references = {};
  }

  put(reference: ModelReference<any>): void {
    var sessionId: string = reference.sessionId();
    var key: string = reference.key();

    var sessionModels: {[key: string]: ModelReference<any>} = this._references[sessionId];
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
    var sessionModels: {[key: string]: ModelReference<any>} = this._references[sessionId];
    if (sessionModels !== undefined) {
      return sessionModels[key];
    } else {
      return;
    }
  }

  getAll(sessionId?: string, key?: string): ModelReference<any>[] {
    var refs: ModelReference<any>[] = [];

    var sessionIds: string[];
    if (sessionId !== undefined && sessionId !== null) {
      sessionIds = [sessionId];
    } else {
      sessionIds = Object.getOwnPropertyNames(this._references);
    }

    sessionIds.forEach((sid: string) => {
      var sessionRefs: {[key: string]: ModelReference<any>} = this._references[sid];
      var keys: string[] = key !== undefined ? [key] : Object.getOwnPropertyNames(sessionRefs);
      keys.forEach((k: string) => {
        refs.push(sessionRefs[k]);
      });
    });

    return refs;
  }

  removeAll(): void {
    this._references = {};
  }

  remove(sessionId: string, key: string): ModelReference<any> {
    var sessionModels: {[key: string]: ModelReference<any>} = this._references[sessionId];
    if (sessionModels !== undefined) {
      var current: ModelReference<any> = sessionModels[key];
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
