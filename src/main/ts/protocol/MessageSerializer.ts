import {IncomingProtocolMessage} from "./protocol";
import MessageType from "./MessageType";
import {ErrorMessageDeserializer} from "./ErrorMessage";
import {HandshakeResponseDeserializer} from "./handhsake";
import {AuthenticationResponseDeserializer} from "./authentication";
import {OutgoingProtocolMessage} from "./protocol";
import {ErrorMessageSerializer} from "./ErrorMessage";
import {HandshakeRequestSerializer} from "./handhsake";
import {AuthRequestSerializer} from "./authentication";
import {ErrorMessage} from "./ErrorMessage";
import {HandshakeRequest} from "./handhsake";
import {AuthRequest} from "./authentication";
import {OpenRealTimeModelRequest} from "./model/openRealtimeModel";
import {OpenRealTimeModelResponseMessageDeserializer} from "./model/openRealtimeModel";
import {OpenRealTimeModelRequestSerializer} from "./model/openRealtimeModel";
import {CreateRealTimeModelRequestSerializer} from "./model/createRealtimeModel";
import {CreateRealTimeModelRequest} from "./model/createRealtimeModel";
import {DeleteRealTimeModelRequest} from "./model/deleteRealtimeModel";
import {DeleteRealTimeModelRequestSerializer} from "./model/deleteRealtimeModel";
import {ForceCloseRealTimeModelMessageDeserializer} from "./model/forceCloseRealtimeModel";
import {CloseRealTimeModelRequestSerializer} from "./model/closeRealtimeModel";
import {CloseRealTimeModelRequest} from "./model/closeRealtimeModel";
import {RemoteOperationDeserializer} from "./model/removeOperation";
import {OperationSubmissionSerializer} from "./model/operationSubmission";
import {OperationSubmission} from "./model/operationSubmission";
import {OperationAckDeserializer} from "./model/operationAck";

export class MessageSerializer {

  static deserialize(body: any, type: string): IncomingProtocolMessage {
    switch (type) {
      case MessageType.ERROR:
        return ErrorMessageDeserializer.deserialize(body);
      case MessageType.HANDSHAKE:
        return HandshakeResponseDeserializer.deserialize(body);
      case MessageType.AUTHENTICATE:
        return AuthenticationResponseDeserializer.deserialize(body);
      case MessageType.OPEN_REAL_TIME_MODEL:
        return OpenRealTimeModelResponseMessageDeserializer.deserialize(body);
      case MessageType.FORCE_CLOSE_REAL_TIME_MODEL:
        return ForceCloseRealTimeModelMessageDeserializer.deserialize(body);
      case MessageType.REMOTE_OPERATION:
        return RemoteOperationDeserializer.deserialize(body);
      case MessageType.OPERATION_ACK:
        return OperationAckDeserializer.deserialize(body);
      case MessageType.CREATE_REAL_TIME_MODEL:
      case MessageType.DELETE_REAL_TIME_MODEL:
      case MessageType.CLOSE_REAL_TIME_MODEL:
        // These messages don't have any message that comes back.  Basically,
        // this is a success message.
        return {
          type: type
        };
      default:
        throw new Error("Unexpected message type: " + type);
    }
  }

  static serialize(body: OutgoingProtocolMessage): any {
    var type: string = body.type;
    switch (type) {
      case MessageType.ERROR:
        return ErrorMessageSerializer.serialize(<ErrorMessage>body);
      case MessageType.HANDSHAKE:
        return HandshakeRequestSerializer.serialize(<HandshakeRequest>body);
      case MessageType.AUTHENTICATE:
        return AuthRequestSerializer.serialize(<AuthRequest>body);
      case MessageType.OPEN_REAL_TIME_MODEL:
        return OpenRealTimeModelRequestSerializer.serialize(<OpenRealTimeModelRequest>body);
      case MessageType.CREATE_REAL_TIME_MODEL:
        return CreateRealTimeModelRequestSerializer.serialize(<CreateRealTimeModelRequest>body);
      case MessageType.DELETE_REAL_TIME_MODEL:
        return DeleteRealTimeModelRequestSerializer.serialize(<DeleteRealTimeModelRequest>body);
      case MessageType.CLOSE_REAL_TIME_MODEL:
        return CloseRealTimeModelRequestSerializer.serialize(<CloseRealTimeModelRequest>body);
      case MessageType.OPERATION_SUBMISSION:
        return OperationSubmissionSerializer.serialize(<OperationSubmission>body);
      default:
        throw new Error("Unexpected protocol type: " + type);
    }
  }
}

