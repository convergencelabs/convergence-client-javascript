/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {DiscreteOperation} from "../ops/DiscreteOperation";
import {ModelReferenceData} from "./ReferenceTransformer";

/**
 * @hidden
 * @internal
 */
export type ReferenceTransformationFunction = (o: DiscreteOperation, r: ModelReferenceData) => ModelReferenceData;
