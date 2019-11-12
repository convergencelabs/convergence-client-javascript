/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {Deferred} from "../util/Deferred";
import {TypeChecker} from "../util/TypeChecker";
import {IFallbackAuthChallenge} from "../IFallbackAuthChallenge";

/**
 * @hidden
 * @internal
 */
export class FallbackAuthCoordinator {
  private _deferred: Deferred<void>;

  private _completed: boolean;

  private _password: string | null;
  private _jwt: string | null;
  private _displayName: string | null;
  private _canceled: boolean;

  constructor() {
    this._deferred = new Deferred<void>();
    this._canceled = false;
    this._password = null;
    this._jwt = null;
    this._displayName = null;
  }

  public challenge(): IFallbackAuthChallenge {
    return {
      password: (password: string | (() => string) | Promise<string>) => {
        this._handlePassword(password);
      },
      jwt: (jwt: string | (() => string) | Promise<string>) => {
        this._handleJwt(jwt);
      },
      anonymous: (displayName: string | (() => string) | Promise<string>) => {
        this._handleAnonymous(displayName);
      },
      cancel: () => {
        this._cancel();
      }
    };
  }

  public fulfilled(): Promise<void> {
    return this._deferred.promise();
  }

  public isCompleted(): boolean {
    return this._completed;
  }

  public isPassword(): boolean {
    return this._password !== null;
  }

  public isJwt(): boolean {
    return this._jwt !== null;
  }

  public isAnonymous(): boolean {
    return this._displayName !== null;
  }

  public isCanceled(): boolean {
    return this._canceled;
  }

  public getPassword(): string {
    return this._password;
  }

  public getJwt(): string {
    return this._jwt;
  }

  public getDisplayName(): string {
    return this._displayName;
  }

  private _handlePassword(password: string | (() => string) | Promise<string>): void {
    this._completed = true;
    this._resolveValue(password).then(p => {
      this._password = p;
      this._deferred.resolve();
    });
  }

  private _handleJwt(jwt: string | (() => string) | Promise<string>): void {
    this._completed = true;
    this._resolveValue(jwt).then(j => {
      this._jwt = j;
      this._deferred.resolve();
    });
  }

  private _handleAnonymous(displayName: string | (() => string) | Promise<string>): void {
    this._completed = true;
    this._resolveValue(displayName).then(d => {
      this._displayName = d;
      this._deferred.resolve();
    });
  }

  private _cancel(): void {
    this._completed = true;
    this._canceled = true;
    this._deferred.resolve();
  }

  private _resolveValue<T>(val: T | (() => T) | Promise<T>): Promise<T> {
    try {
      if (TypeChecker.isFunction(val)) {
        return Promise.resolve(val());
      } else if (TypeChecker.isFunction(val["then"])) {
        return val as Promise<T>;
      } else {
        return Promise.resolve(val as T);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
