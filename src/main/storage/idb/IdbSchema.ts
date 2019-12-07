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
 * @hidden
 * @internal
 */
export const IdbSchema = {
  ModelCreation: {
    Store: "ModelCreation",
    Fields: {
      ModelId: "modelId"
    },
    Indices: {
      ModelId: "ModelCreation.modelId"
    }
  },
  ModelMetaData: {
    Store: "ModelMetaData",
    Fields: {
      ModelId: "modelId",
      Subscribed: "subscribed",
      Created: "created",
      Deleted: "deleted",
      SyncRequired: "syncRequired",
      Uncommitted: "uncommitted"
    },
    Indices: {
      ModelId: "ModelMetaData.modelId",
      Created: "ModelMetaData.created",
      Deleted: "ModelMetaData.deleted",
      Uncommitted: "ModelMetaData.uncommitted",
      SyncRequired: "ModelMetaData.syncRequired",
      Subscribed: "ModelMetaData.subscribed"
    }
  },
  ModelData: {
    Store: "ModelData",
    Fields: {
      ModelId: "modelId"
    },
    Indices: {
      ModelId: "ModelData.modelId"
    }
  },
  ModelServerOperation: {
    Store: "ModelServerOperation",
    Fields: {
      ModelId: "modelId",
      Version: "version"
    },
    Indices: {
      ModelId: "ModelServerOperation.modelId",
      ModelId_Version: "ModelServerOperation.modelId_version"
    }
  },
  ModelLocalOperation: {
    Store: "ModelLocalOperation",
    Fields: {
      ModelId: "modelId",
      SequenceNumber: "sequenceNumber"
    },
    Indices: {
      ModelId: "ModelLocalOperation.modelId",
      ModelId_SequenceNumber: "ModelLocalOperation.modelId_sequenceNumber"
    }
  },
  DomainUser: {
    Store: "DomainUser",
    Fields: {
      Username: "username",
      UserType: "userType"
    },
    Indices: {
      UserType_Username: "DomainUser.userType_username"
    }
  },
  Session: {
    Store: "Session",
    Fields: {
      SessionId: "sessionId",
      Username: "username",
      UserType: "userType"
    },
    Indices: {
      UserType_Username: "DomainUser.userType_username",
      SessionId: "Session.sessionId"
    }
  }
};
