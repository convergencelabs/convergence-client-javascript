/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

/**
 * A set of permissions that are configurable on a given model.
 *
 * @module Real Time Data
 */
export class ModelPermissions {

  /**
   * Creates a new ModelPermissions class from a JSON representation.
   *
   * @param json The JSON representations of the ModelPermissions.
   *
   * @returns A ModelPermissions instance initialized from the JSON Object.
   */
  public static fromJSON(json: { read: boolean; write: boolean; remove: boolean; manage: boolean; }): ModelPermissions {
    return new ModelPermissions(json.read, json.write, json.remove, json.manage);
  }

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

  public toJSON(): { read: boolean; write: boolean; remove: boolean; manage: boolean; } {
    return {read: this.read, write: this.write, remove: this.remove, manage: this.manage};
  }
}
