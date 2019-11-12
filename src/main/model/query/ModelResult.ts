/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
