/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {IModelState} from "./IModelState";
import {ILocalOperationData, IServerOperationData} from "./IModelOperationData";
import {IModelCreationData} from "./IModelCreationData";
import {IOfflineModelSubscription} from "./IOfflineModelSubscription";
import {IModelUpdate} from "./IModelUpdate";

/**
 * @hidden
 * @internal
 */
export interface IModelStore {
  getSubscribedModels(): Promise<IOfflineModelSubscription[]>;

  addSubscription(modelIds: string[]): Promise<void>;

  removeSubscription(modelId: string[]): Promise<void>;

  setModelSubscriptions(subscriptions: IOfflineModelSubscription[]): Promise<void>;

  createLocalModel(model: IModelCreationData): Promise<void>;

  getModelCreationData(modelId: string): Promise<IModelCreationData>;

  putModelState(model: IModelState): Promise<void>;

  updateOfflineModel(update: IModelUpdate): Promise<void>;

  getModel(modelId: string): Promise<IModelState | undefined>;

  modelExists(modelId: string): Promise<boolean>;

  deleteModel(modelId: string): Promise<void>;

  processServerOperation(serverOp: IServerOperationData, localOps: ILocalOperationData[]): Promise<void>;

  processLocalOperation(localOp: ILocalOperationData): Promise<void>;

  processOperationAck(modelId: string, sessionId: string, seqNo: number, serverOp: IServerOperationData): Promise<void>;

  modelCreated(modelId: string): Promise<void>;
}
