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

import {IModelState} from "./IModelState";
import {ILocalOperationData, IServerOperationData} from "./IModelOperationData";
import {IModelCreationData} from "./IModelCreationData";
import {IModelUpdate} from "./IModelUpdate";
import {IModelMetaData} from "./IModelMetaData";
import {IObjectValue} from "../../model";

/**
 * [[IModelStore]] defines the methods for storing and processing Realtime
 * Models when offline.
 *
 * @module Offline
 */
export interface IModelStore {

  /**
   * Begins the process of creating a model. This happens when the client
   * creates the model, but before the server acknowledges the creation.
   * This could be when the client is offline or even when online since
   * the process with the server is async.
   *
   * @param modelCreationData
   *   The data the capture how the model was created.
   * @returns
   *   The meta data record created by this operation.
   */
  initiateModelCreation(modelCreationData: IModelCreationData): Promise<IModelMetaData>;

  /**
   * Indicates that the model creation process has completed. This can
   * happen when online and the server responds, or as part of the
   * resync process.
   *
   * @param modelId
   *   The id of the model that was created.
   */
  completeModelCreation(modelId: string): Promise<void>;

  /**
   * Gets the model creation data for a model that is currently in progress of
   * creation, or null if a model with that id is not being created.
   *
   * @param modelId
   *   The id of the model to get the creation data of.
   * @returns
   *   The IModelCreationData for this model or null if it is not set.
   */
  getModelCreationData(modelId: string): Promise<IModelCreationData | null>;

  /**
   * Initiates the deletion of a model. This will remove the local model data
   * but leave the model marked as deletion until the model deletion is
   * confirmed.
   *
   * @param modelId
   *   The id of the model to delete.
   */
  initiateModelDeletion(modelId: string): Promise<void>;

  /**
   * Completes the deletion of the model by removing the deleted flag on the
   * model.
   *
   * @param modelId
   *   The id of the model to complete the deletion for.
   */
  completeModelDeletion(modelId: string): Promise<void>;

  /**
   * Deletes the offline record of the model.
   *
   * @param modelId
   *   The id of the model to delete.
   */
  deleteModels(modelId: string[]): Promise<void>;

  /**
   * Gets the current state for a locally available model. The method
   * will return null for a model that does not exist or is not
   * available locally.
   *
   * @param modelId
   *   The id of the model to get the state of.
   *
   * @returns
   *   The model state for the given model id, or null if the model
   *   is not available locally.
   */
  getModelState(modelId: string): Promise<IModelState | null>;

  /**
   * Sets the models state. This will merge the state of the model with
   * any existing meta data records for the model.
   *
   * @param modelState
   *   The model state to set.
   */
  setModelState(modelState: IModelState): Promise<void>;

  /**
   * Determines if a model record exists for the specified model id. This
   * does not imply that the model is subscribed, or available.
   *
   * @param modelId
   *   The id of the model to check.
   *
   * @returns
   *   True if a meta data record exists; false otherwise.
   */
  modelMetaDataExists(modelId: string): Promise<boolean>;

  /**
   * Gets the model meta data for the specified model or null if meta data for
   * the model does not exist.
   *
   * @param modelId
   *   The id of the model to get the meta data for.
   *
   * @returns
   *   The model meta data for the model or null if no record exists.
   */
  getModelMetaData(modelId: string): Promise<IModelMetaData | null>;

  /**
   * Gets all current model meta data records in the system.
   *
   * @returns
   *   All meta data records.
   */
  getAllModelMetaData(): Promise<IModelMetaData[]>;

  /**
   * Gets all model records for models that require synchronization to the
   * server.
   *
   * @returns
   *   Model meta data for models that are deletes, created, or uncommitted.
   */
  getModelsRequiringSync(): Promise<IModelMetaData[]>;

  /**
   * Gets a model records for models that are subscribed.
   *
   * @returns
   *   All meta data entries for models with the subscribed flag set.
   */
  getSubscribedModels(): Promise<IModelMetaData[]>;

  /**
   * Adds and or removes subscriptions. If no model record exists it will be
   * created. If the record exists, the subscribed flags will be modified. If
   * a model is already subscribe and it is subscribed again, the operation
   * will be a no-op for that model. If the model does not exist or is not
   * subscribed and is asked to be unsubscribed it will be a no-op for that
   * model.
   *
   * @param subscribe
   *   The set of model ids to subscribe.
   *
   * @param unsubscribe
   *   The set of model ids to unsubscribe.
   */
  updateSubscriptions(subscribe: string[], unsubscribe: string[]): Promise<void>;

  /**
   * Updates the model state based on an update. Updates can either contain a
   * data update or a permission update.
   *
   * @param update
   *   The update to apply.
   */
  processOfflineModelUpdate(update: IModelUpdate): Promise<void>;

  /**
   * Processes a new server operation for a model. The modelId is inferred from
   * the id in the serverOp. The localOps passed in are the new local
   * operations that are the result of their transformation against the new
   * server operation. Not the modelId of the localOperations must al match
   * the modelId of the serverOp. This operation will update the modified time
   * and version of the model meta data. The new server operation will be
   * stored.
   *
   * @param serverOp
   *   The new server operation to process.
   * @param localOps
   *   The transformed local operations to store.
   */
  processServerOperation(serverOp: IServerOperationData, localOps: ILocalOperationData[]): Promise<void>;

  /**
   * Processes a new local operation. The modelId will be read from the local
   * operation. The local operation operation will be stored. The model meta
   * data will be updated to indicate that the model has uncommitted changes
   * and the lastSequenceNumber number will be updated in the model details.
   * The syncRequired flag will also be updated appropriately.
   *
   * @param localOp
   *   The local operation to process.
   */
  processLocalOperation(localOp: ILocalOperationData): Promise<void>;

  /**
   * Processes a local operation acknowledgment from the server. This will
   * remove the corresponding local operation and store the new server
   * operation, which is essentially the version of the local operation that
   * was (potentially) transformed such that it now represents the version
   * of the local operation that the server executed. The uncommitted and
   * syncRequired flags will be updated appropriately if this ack means
   * that there are no more outstanding changes in the model.
   *
   * @param modelId
   *   The id of the model that received the ack.
   * @param seqNo
   *   The sequence number of the local operation that was acknowledged.
   * @param serverOp
   *   The server operation to store in place of the local operation.
   */
  processOperationAck(modelId: string, seqNo: number, serverOp: IServerOperationData): Promise<void>;

  /**
   * Updates an offline models snapshot. This only applies to models that are
   * locally available.
   *
   * @param modelId
   *   The id of the model to set the snapshot for.
   * @param version
   *   The new version of the snapshot.
   * @param sequenceNumber
   *   The current sequence number for the local client.
   * @param modelData
   *   The data of the model at the version.
   */
  snapshotModel(modelId: string, version: number, sequenceNumber: number, modelData: IObjectValue): Promise<void>;

  /**
   * Gets and increments the value id prefix for a given model.
   *
   * @param modelId
   *   The model id to get and increment the prefix for.
   * @returns
   *   The claimed value id prefix.
   */
  claimValueIdPrefix(modelId: string): Promise<{ prefix: string, increment: number }>;
}
