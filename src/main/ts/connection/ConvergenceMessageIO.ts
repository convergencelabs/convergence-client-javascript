import * as convergenceProtoJson from "@convergence/convergence-proto/convergence-proto.json";
import * as convergenceProto from "@convergence/convergence-proto";
import * as protobuf from "protobufjs/light";

const ROOT: protobuf.Root = protobuf.Root.fromJSON(convergenceProtoJson as any);
const CONVERGENCE_MESSAGE_PATH = "io.convergence.proto.message.ConvergenceMessage";

type IConvergenceMessage = convergenceProto.io.convergence.proto.IConvergenceMessage;

export class ConvergenceMessageIO {
  public static decode(bytes: Uint8Array): IConvergenceMessage {
    const protocolMessage: protobuf.Message<IConvergenceMessage> =
      ConvergenceMessageIO._convergenceMessageType.decode(bytes);
    const message: IConvergenceMessage = ConvergenceMessageIO._convergenceMessageType.toObject(protocolMessage);
    return message;
  }

  public static encode(message: IConvergenceMessage): Uint8Array {
    const protobufMessage: protobuf.Message<IConvergenceMessage> =
      ConvergenceMessageIO._convergenceMessageType.fromObject(message);
    const bytes: Uint8Array = ConvergenceMessageIO._convergenceMessageType.encode(protobufMessage).finish();
    return bytes;
  }

  private static _convergenceMessageType: protobuf.Type = ROOT.lookupType(CONVERGENCE_MESSAGE_PATH);
}
