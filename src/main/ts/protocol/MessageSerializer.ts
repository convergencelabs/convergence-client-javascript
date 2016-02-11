import {IncomingProtocolMessage} from "./protocol";
import MessageType from "./MessageType";
import {ErrorMessageDeserializer} from "./ErrorMessage";
import {HandshakeResponseDeserializer} from "./handhsake";
import {AuthenticationResponseDeserializer} from "./authentication";
import {OutgoingProtocolMessage} from "./protocol";
import {ErrorMessageSerializer} from "./ErrorMessage";
import {HandshakeRequestSerializer} from "./handhsake";
import {ErrorMessage} from "./ErrorMessage";
import {HandshakeRequest} from "./handhsake";
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
import {ModelDataRequestDeserializer} from "./model/modelDataRequest";
import {ModelDataResponse} from "./model/modelDataRequest";
import {ModelDataResponseSerializer} from "./model/modelDataRequest";
import {TokenAuthRequestSerializer} from "./authentication";
import {PasswordAuthRequestSerializer} from "./authentication";
import {PasswordAuthRequest} from "./authentication";
import {TokenAuthRequest} from "./authentication";
import {MessageEnvelope} from "./protocol";

export class MessageSerializer {

  static deserialize(message: any): MessageEnvelope {

    var body: any = message.b;
    var type: number = body.t;
    var requestId: number = message.q;
    var responseId: number = message.p;

    var incomingMessage: IncomingProtocolMessage;

    switch (type) {
      case MessageType.ERROR:
        incomingMessage = ErrorMessageDeserializer.deserialize(body);
        break;
      case MessageType.HANDSHAKE_RESPONSE:
        incomingMessage = HandshakeResponseDeserializer.deserialize(body);
        break;
      case MessageType.AUTHENTICATE_RESPONSE:
        incomingMessage = AuthenticationResponseDeserializer.deserialize(body);
        break;
      case MessageType.OPEN_REAL_TIME_MODEL_RESPONSE:
        incomingMessage = OpenRealTimeModelResponseMessageDeserializer.deserialize(body);
        break;
      case MessageType.FORCE_CLOSE_REAL_TIME_MODEL:
        incomingMessage = ForceCloseRealTimeModelMessageDeserializer.deserialize(body);
        break;
      case MessageType.REMOTE_OPERATION:
        incomingMessage = RemoteOperationDeserializer.deserialize(body);
        break;
      case MessageType.OPERATION_ACKNOWLEDGEMENT:
        incomingMessage = OperationAckDeserializer.deserialize(body);
        break;
      case MessageType.MODEL_DATA_REQUEST:
        incomingMessage = ModelDataRequestDeserializer.deserialize(body);
        break;
      case MessageType.CREATE_REAL_TIME_MODEL_RESPONSE:
      case MessageType.DELETE_REAL_TIME_MODEL_RESPONSE:
      case MessageType.CLOSE_REAL_TIME_MODEL_RESPONSE:
        // These messages don't have any message that comes back.  Basically,
        // this is a success message.
        incomingMessage = {
          type: type
        };
        break;
      default:
        throw new Error("Unexpected message type: " + body.t);
    }

    return {
      body: incomingMessage,
      requestId: requestId,
      responseId: responseId
    };
  }

  static serialize(envelope: MessageEnvelope): any {
    var body: OutgoingProtocolMessage = envelope.body;
    var type: number = body.type;
    var outgoingMessage: OutgoingProtocolMessage;

    switch (type) {
      case MessageType.ERROR:
        outgoingMessage = ErrorMessageSerializer.serialize(<ErrorMessage>body);
        break;
      case MessageType.HANDSHAKE_REQUEST:
        outgoingMessage = HandshakeRequestSerializer.serialize(<HandshakeRequest>body);
        break;
      case MessageType.PASSWORD_AUTH_REQUEST:
        outgoingMessage = PasswordAuthRequestSerializer.serialize(<PasswordAuthRequest>body);
        break;
      case MessageType.TOKEN_AUTH_REQUEST:
        outgoingMessage = TokenAuthRequestSerializer.serialize(<TokenAuthRequest>body);
        break;
      case MessageType.OPEN_REAL_TIME_MODEL_REQUEST:
        outgoingMessage = OpenRealTimeModelRequestSerializer.serialize(<OpenRealTimeModelRequest>body);
        break;
      case MessageType.CREATE_REAL_TIME_MODEL_REQUEST:
        outgoingMessage = CreateRealTimeModelRequestSerializer.serialize(<CreateRealTimeModelRequest>body);
        break;
      case MessageType.DELETE_REAL_TIME_MODEL_REQUEST:
        outgoingMessage = DeleteRealTimeModelRequestSerializer.serialize(<DeleteRealTimeModelRequest>body);
        break;
      case MessageType.CLOSES_REAL_TIME_MODEL_REQUEST:
        outgoingMessage = CloseRealTimeModelRequestSerializer.serialize(<CloseRealTimeModelRequest>body);
        break;
      case MessageType.OPERATION_SUBMISSION:
        outgoingMessage = OperationSubmissionSerializer.serialize(<OperationSubmission>body);
        break;
      case MessageType.MODEL_DATA_REQUEST:
        outgoingMessage = ModelDataResponseSerializer.serialize(<ModelDataResponse>body);
        break;
      default:
        throw new Error("Unexpected message type: " + type);
    }

    return {
      b: outgoingMessage,
      q: envelope.requestId,
      p: envelope.responseId
    };
  }
}

