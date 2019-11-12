/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ObservableElement} from "./ObservableElement";
import {Path, PathElement} from "../Path";

/**
 * @category Real Time Data Subsystem
 */
export interface ObservableContainerElement<T> extends ObservableElement<T> {
  elementAt(path: Path): ObservableElement<any>;
  elementAt(...elements: PathElement[]): ObservableElement<any>;
}
