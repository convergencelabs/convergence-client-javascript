/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

/**
 * Convergence supports scenarios where the consuming application loses
 * connectivity to the server. To use, simply provide an `IStorageAdapter`
 * in the [[IConvergenceOptions]] on initial connection.
 *
 * The interfaces here provide an API for customization of the offline
 * operation storage. By default, Convergence provides the [[IdbStorageAdapter]]
 * which uses IndexedDB for persistence.
 *
 * @moduledefinition Offline
 */

export * from "./IModelData";
export * from "./IModelOperationData";
export * from "./IModelState";
export * from "./IModelStore";
export * from "./IMetaStore";
export * from "./IDomainUserIdData";
export * from "./IStorageAdapter";
