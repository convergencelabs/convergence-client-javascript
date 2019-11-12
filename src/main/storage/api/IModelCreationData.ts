/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ObjectValue} from "../../model/dataValue";
import {ModelPermissions} from "../../model";

/**
 * @hidden
 * @internal
 */
export interface IModelCreationData {
  /**
   * The model's unique id.
   */
  modelId: string;

  /**
   * The collection in which this model will live.
   */
  collection: string;

  /**
   * The data the model was created with.
   */
  initialData: ObjectValue;

  /**
   * Set to true if the permissions set in this object should override those set
   * in the parent collection.
   */
  overrideCollectionWorldPermissions?: boolean;

  /**
   * Generic permissions for this model for all users.
   */
  worldPermissions?: ModelPermissions;

  /**
   * Per-user permissions can be set here, where the key is an existing user's username.
   */
  userPermissions?: { [username: string]: ModelPermissions };
}
