/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

/**
 * The IConvergenceEvent is the parent interface of all events fired by
 * Convergence. It ensures that each fired event has a name property that
 * indicates the event that was fired.
 */
export interface IConvergenceEvent {

  /**
   * The name of the event that was fired. This is commonly used to filter when
   * using the [[ConvergenceEventEmitter.events]] stream.
   *
   * Note that the name is only guaranteed to be unique within the class /
   * subsystem that is firing it. Names might be reused across classes and
   * subsystems.
   */
  name: string;
}
