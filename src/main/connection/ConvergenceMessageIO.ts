/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import * as convergenceProtoJson from "@convergence/convergence-proto/convergence-proto.json";
import * as convergenceProto from "@convergence/convergence-proto";
import * as protobuf from "protobufjs/light";

const ROOT: protobuf.Root = protobuf.Root.fromJSON(convergenceProtoJson as any);
const CONVERGENCE_MESSAGE_PATH = "com.convergencelabs.convergence.proto.ConvergenceMessage";

type IConvergenceMessage = convergenceProto.com.convergencelabs.convergence.proto.IConvergenceMessage;

/**
 * @hidden
 * @internal
 */
export class ConvergenceMessageIO {
  public static decode(bytes: Uint8Array): IConvergenceMessage {
    const protocolMessage: protobuf.Message<IConvergenceMessage> =
      ConvergenceMessageIO._convergenceMessageType.decode(bytes);
    return ConvergenceMessageIO._convergenceMessageType.toObject(protocolMessage);
  }

  public static encode(message: IConvergenceMessage): Uint8Array {
    const protocolMessage: protobuf.Message<IConvergenceMessage> =
      ConvergenceMessageIO._convergenceMessageType.fromObject(message);
    return ConvergenceMessageIO._convergenceMessageType.encode(protocolMessage).finish();
  }

  private static _convergenceMessageType: protobuf.Type = ROOT.lookupType(CONVERGENCE_MESSAGE_PATH);
}
