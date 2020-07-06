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

import {ConvergenceConnection, IConnectionEvent, MessageEvent} from "../main/connection/ConvergenceConnection";
import {Subject} from "rxjs";
import {createStubInstance, SinonStub} from "sinon";
import {ConvergenceDomain, ConvergenceSession, DomainUser} from "../main";

export interface IMockConnection {
  connection: ConvergenceConnection;
  messageSubject: Subject<MessageEvent>;
  eventSubject: Subject<IConnectionEvent>;
  requestStub: SinonStub;
  sendStub: SinonStub;
}

export function mockConvergenceConnection(user: DomainUser, sessionId: string, reconnectToken: string): IMockConnection {
  const connectionStub = createStubInstance(ConvergenceConnection);
  const messageSubject = new Subject<MessageEvent>();
  connectionStub.messages.callsFake(() => messageSubject.asObservable());

  const eventSubject = new Subject<IConnectionEvent>();
  connectionStub.events.callsFake(() => eventSubject.asObservable());

  const domain = createStubInstance(ConvergenceDomain) as any as ConvergenceDomain;
  const connection = connectionStub as any as ConvergenceConnection;

  const session = new ConvergenceSession(domain, connection, user, sessionId, reconnectToken);

  (connection.session as SinonStub).returns(session);
  (connection.isOnline as SinonStub).returns(true);

  const requestStub = (connection.request as SinonStub);
  const sendStub = (connection.send as SinonStub);

  return {
    connection,
    messageSubject,
    eventSubject,
    requestStub,
    sendStub
  };
}
