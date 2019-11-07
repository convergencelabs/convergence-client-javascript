/**
 * A PathElement is a particular desired node within a [[RealTimeModel]]'s contents,
 * which can be thought of as a JSON tree.
 *
 * These have no meaning outside of a [[Path]].
 *
 * @module Real Time Data
 */
export type PathElement = string | number;

/**
 * A `Path` is essentially a set of instructions for retrieving a particular piece of data
 * (subtree) within a model's contents (JSON tree). e.g.
 *
 * for a model with contents
 *
 * ```json
 * {
 *   "firstName": "James",
 *   "kidsAges": [4, 7, 9]
 * }
 * ```
 *
 * one could query:
 *
 * ```typescript
 * realTimeModel.elementAt(['firstName']) // RealTimeString, value() => "James"
 * realTimeModel.elementAt(['kidsAges', 1]) // RealTimeNumber, value() => 7
 * ```
 *
 * See the
 * [developer guide](https://docs.convergence.io/guide/models/overview.html#paths) for
 * more examples of using paths to get parts of a model's contents.
 *
 * @module Real Time Data
 */
export type Path = PathElement[];
