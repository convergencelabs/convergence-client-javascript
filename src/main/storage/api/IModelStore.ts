/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {IModelState} from "./IModelState";
import {ILocalOperationData, IServerOperationData} from "./IModelOperationData";
import {IModelCreationData} from "./IModelCreationData";
import {IOfflineModelSubscription} from "./IOfflineModelSubscription";
import {IModelUpdate} from "./IModelUpdate";
import {IModelData} from "./IModelData";

/**
 * @module Offline
 */
export interface IModelStore {
  getSubscribedModels(): Promise<IOfflineModelSubscription[]>;

  addSubscription(modelIds: string[]): Promise<void>;

  removeSubscription(modelId: string[]): Promise<void>;

  setModelSubscriptions(subscriptions: IOfflineModelSubscription[]): Promise<void>;

  createLocalModel(model: IModelCreationData): Promise<void>;

  getModelCreationData(modelId: string): Promise<IModelCreationData>;

  putModelState(model: IModelState): Promise<void>;

  snapshotModel(model: IModelData): Promise<void>;

  updateOfflineModel(update: IModelUpdate): Promise<void>;

  getModel(modelId: string): Promise<IModelState | undefined>;

  modelExists(modelId: string): Promise<boolean>;

  deleteModel(modelId: string): Promise<void>;

  processServerOperation(serverOp: IServerOperationData, localOps: ILocalOperationData[]): Promise<void>;

  processLocalOperation(localOp: ILocalOperationData): Promise<void>;

  processOperationAck(modelId: string, sessionId: string, seqNo: number, serverOp: IServerOperationData): Promise<void>;

  modelCreated(modelId: string): Promise<void>;
}
