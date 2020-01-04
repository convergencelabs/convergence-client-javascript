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
export {ILocalOperationData, IModelOperationData, IServerOperationData} from "./IModelOperationData";
export * from "./IModelState";
export * from "./IModelStore";
export * from "./IIdentityStore";
export * from "./IDomainUserIdData";
export * from "./IStorageAdapter";
export * from "./IModelSnapshot";
export * from "./IModelCreationData";
export * from "./IModelUpdate";
export * from "./IModelMetaData";
