/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableString} from "../observable/ObservableString";
import {DomainUser} from "../../identity";

/**
 * Emitted when one or more characters are added to a [[RealTimeString]].
 *
 * @category Real Time Data Subsystem
 */
export class StringInsertEvent implements IValueChangedEvent {
  public static readonly NAME = "insert";

  /**
   * @inheritdoc
   */
  public readonly name: string = StringInsertEvent.NAME;

  /**
   * @param element
   * @param index
   * @param value
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeString]] or [[HistoricalString]] which was modified
     */
    public readonly element: ObservableString,

    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * @inheritdoc
     */
    public readonly sessionId: string,

    /**
     * True if the change occurred locally (within the current session)
     */
    public readonly local: boolean,

    /**
     * The index at which the insertion happened
     */
    public readonly index: number,

    /**
     * The substring that was inserted
     */
    public readonly value: string
  ) {
    Object.freeze(this);
  }
}
