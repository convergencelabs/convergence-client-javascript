/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {ObservableElement, ObservableElementEvents} from "./ObservableElement";
export {ObservableElementEventConstants as ObservableNullEventConstants} from "./ObservableElement";

/**
 * @module Real Time Data
 */
export interface ObservableNullEvents extends ObservableElementEvents {

}

/**
 * @module Real Time Data
 */
export interface ObservableNull extends ObservableElement<void>  {

}
