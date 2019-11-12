/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
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
