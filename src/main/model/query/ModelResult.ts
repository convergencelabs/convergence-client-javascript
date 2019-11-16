/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

/**
 * Represents a single read-only result entry from a model query. Includes the relevant
 * data and metadata for a particular model.
 *
 * @module Real Time Data
 */
export class ModelResult {
  constructor(
    /**
     * The contents of the model.
     */
    public readonly data: {[key: string]: any},

    /**
     * The model's collection ID
     */
    public readonly collectionId?: string,

    /**
     * The model's unique ID
     */
    public readonly modelId?: string,

    /**
     * The creation timestamp of the model
     */
    public readonly created?: Date,

    /**
     * The timestamp at which the model's data was last modified
     */
    public readonly modified?: Date,

    /**
     * The model's current version
     */
    public readonly version?: number) {
    Object.freeze(this);
  }
}
