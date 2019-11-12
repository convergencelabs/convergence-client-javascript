/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ObservableElement, ObservableElementEvents} from "./ObservableElement";
export {ObservableElementEventConstants as ObservableNullEventConstants} from "./ObservableElement";

/**
 * @category Real Time Data Subsystem
 */
export interface ObservableNullEvents extends ObservableElementEvents {

}

/**
 * @category Real Time Data Subsystem
 */
export interface ObservableNull extends ObservableElement<void>  {

}
