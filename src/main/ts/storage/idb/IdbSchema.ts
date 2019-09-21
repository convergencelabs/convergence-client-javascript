export const IdbSchema = {
  Model: {
    Name: "Model",
    Indices: {
      Id: "id"
    },
    Fields: {
      Id: "id"
    }
  },
  ModelServerOperation: {
    Name: "ModelServerOperation",
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
    Name: "ModelLocalOperation",
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
