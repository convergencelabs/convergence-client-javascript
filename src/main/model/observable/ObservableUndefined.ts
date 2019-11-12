/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {ObservableElement, ObservableElementEvents} from "./ObservableElement";
export {ObservableElementEventConstants as ObservableUndefinedEventConstants} from "./ObservableElement";

/**
 * @category Real Time Data Subsystem
 */
export interface ObservableUndefinedEvents extends ObservableElementEvents {

}

/**
 * @category Real Time Data Subsystem
 */
export interface ObservableUndefined extends ObservableElement<void> {

}
