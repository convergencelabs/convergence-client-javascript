/**
 * When considering implementing real-time collaboration, most developers think
 * (and only think!) about the various algorithms for synchronizing data. This
 * indeed is a core consideration for collaborative editing systems, and
 * many tomes have been written about it.  Convergence's main goal is to insulate
 * developers from the difficulties of implementing Operational Transformation.
 * It does this by supporting a strict set of data: JSON.
 *
 * See our [developer guide](https://docs.convergence.io/guide/models/overview.html)
 * for additional information.
 *
 * To get started with Real Time Data, get an instance of the [[ModelService]]
 * from the [[ConvergenceDomain]].
 *
 * @moduledefinition Real Time Data
 */

export * from "./ModelService";
export * from "./ModelElementType";
export * from "./Path";

export * from "./events";
export * from "./historical";
export * from "./query";
export * from "./reference";
export * from "./rt";

export * from "./ModelPermissionManager";
export * from "./ModelPermissions";

export * from "./ICreateModelOptions";
export * from "./ModelDataInitializer";
export * from "./IAutoCreateModelOptions";
