/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

/**
 * An object containing some options for fetching chat history. By default, all
 * events in this chat are returned, not just the actual messages.  Also, by default
 * events are returned in descending order, starting from the end.
 *
 * To return the last 25 messages:
 * ```
 * chat.getHistory({
 *   limit: 25,
 *   eventFilter: [ChatMessageEvent.NAME]
 * })
 * ```
 *
 * To return the first 10 events:
 * ```
 * chat.getHistory({
 *   startEvent: 0,
 *   limit: 10,
 *   forward: true
 * })
 * ```
 *
 * @module Chat
 */
export interface IChatHistorySearchOptions {
  /**
   * The sequential event number at which to start the query.
   *
   * [[ChatInfo.lastEventNumber]] could be a useful piece of information here.
   */
  startEvent?: number;

  /**
   * The maximum number of query results
   */
  limit?: number;

  /**
   * Set to true to return events in ascending order
   */
  forward?: boolean;

  /**
   * An array of [[ChatHistoryEntry]] types to which the results will be limited
   */
  eventFilter?: string[];
}