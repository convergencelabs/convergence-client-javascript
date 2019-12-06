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
import {ObjectValue} from "../../model";

/**
 * @module Offline
 */
export interface IModelStore {
  getSubscribedModels(): Promise<IModelMetaData[]>;

  addSubscriptions(modelIds: string[]): Promise<void>;

  removeSubscriptions(modelId: string[]): Promise<void>;

  setModelSubscriptions(subscriptions: string[]): Promise<void>;

  createModelOffline(model: IModelCreationData): Promise<void>;

  modelCreated(modelId: string): Promise<void>;

  getModelCreationData(modelId: string): Promise<IModelCreationData>;

  deleteModel(modelId: string): Promise<void>;

  modelDeleted(modelId: string): Promise<void>;

  getDeletedModelIds(): Promise<string[]>;

  getModelState(modelId: string): Promise<IModelState | undefined>;

  putModelState(model: IModelState): Promise<void>;

  snapshotModel(modelId: string, version: number, modelData: ObjectValue): Promise<void>;

  getModelMetaData(modelId: string): Promise<IModelMetaData | undefined>;

  getAllModelMetaData(): Promise<IModelMetaData[]>;

  updateOfflineModel(update: IModelUpdate): Promise<void>;

  modelExists(modelId: string): Promise<boolean>;

  getModelsRequiringSync(): Promise<IModelMetaData[]>;

  deleteIfNotNeeded(modelId: string): Promise<boolean>;

  processServerOperation(serverOp: IServerOperationData, localOps: ILocalOperationData[]): Promise<void>;

  processLocalOperation(localOp: ILocalOperationData): Promise<void>;

  processOperationAck(modelId: string, seqNo: number, serverOp: IServerOperationData): Promise<void>;
}
