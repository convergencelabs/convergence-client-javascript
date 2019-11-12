/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

/**
 * A set of permissions that are configurable on a given model.
 *
 * @category Real Time Data Subsystem
 */
export class ModelPermissions  {
  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * Set to true to allow read access to a model.
     */
    public readonly read: boolean,

    /**
     * Set to true to allow write access to a model.
     */
    public readonly write: boolean,

    /**
     * Set to true to permit deleting a model.
     */
    public readonly remove: boolean,

    /**
     * Set to true to permit managing the permissions on a model.
     */
    public readonly manage: boolean
  ) {
    Object.freeze(this);
  }
}
