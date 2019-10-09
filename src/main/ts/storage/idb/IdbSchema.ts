/**
 * @hidden
 * @internal
 */
export const IdbSchema = {
  Model: {
    Store: "Model",
    Indices: {
      Id: "id"
    },
    Fields: {
      Id: "id"
    }
  },
  ModelServerOperation: {
    Store: "ModelServerOperation",
    Indices: {
      ModelId: "ModelServerOperation.modelId",
      ModelId_Version: "ModelServerOperation.modelId_version"
    },
    Fields: {
      ModelId: "modelId",
      Version: "version"
    }
  },
  ModelLocalOperation: {
    Store: "ModelLocalOperation",
    Indices: {
      ModelId: "ModelLocalOperation.modelId",
      ModelId_SequenceNumber: "ModelLocalOperation.modelId_sequenceNumber"
    },
    Fields: {
      ModelId: "modelId",
      SequenceNumber: "sequenceNumber"
    }
  }
};
