/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ModelPermissions} from "./ModelPermissions";
import {ModelDataInitializer} from "./ModelDataInitializer";

/**
 * The configuration available when creating a model with the
 * [[ModelService.create]] or [[ModelService.openAutoCreate]] methods.
 *
 * @category Real Time Data Subsystem
 */
export interface ICreateModelOptions {
  /**
   * The collection in which this model will live.
   */
  collection: string;

  /**
   * The model's ID.  If not provided, a UUID will be generated.
   *
   * Note that model IDs must be unique *even across collections*!
   */
  id?: string;

  /**
   * The initial contents of the model, either provided directly or as the result
   * of a callback function.  This data should be easily serializable.
   */
  data?: ModelDataInitializer;

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
