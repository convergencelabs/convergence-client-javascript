var convergence;
(function (convergence) {
    var connection;
    (function (connection) {
        var HandshakeRequest = convergence.message.HandshakeRequest;
        var ProtocolConnection = (function () {
            function ProtocolConnection(socket, protocolConfig, eventHandler) {
                this._nextRequestId = 0;
                var self = this;
                this._protocolConfig = protocolConfig;
                this._socket = socket;
                this._socket.listener = {
                    onMessage: function (message) {
                        self.onSocketMessage(message);
                    },
                    onError: function (error) {
                        self.onSocketError(error);
                    },
                    onClose: function (reason) {
                        self.onSocketClosed();
                    }
                };
                this._eventHandler = eventHandler;
            }
            ProtocolConnection.prototype.connect = function () {
                return this._socket.open();
            };
            ProtocolConnection.prototype.handshake = function (reconnect, reconnectToken, options) {
                var request = new HandshakeRequest(reconnect, reconnectToken, options);
                reconnect: reconnect,
                    reconnectToken;
                reconnectToken,
                    options;
                options;
            };
            ;
            return ProtocolConnection;
        })();
        connection.ProtocolConnection = ProtocolConnection;
        return this.request(request).then(function (response) {
            var self = this;
            var heartbeatHandler = {
                sendPing: function () {
                    self.onPing();
                },
                onTimeout: function () {
                    self.abort("pong timeout");
                }
            };
            // todo handle protocol options that come back from server
            this._heartbeatHelper = new HeartbeatHelper(heartbeatHandler, this._protocolConfig.heartbeatConfig.pingInterval, this._protocolConfig.heartbeatConfig.pongTimeout);
            if (this._protocolConfig.heartbeatConfig.enabled) {
                this._heartbeatHelper.start();
            }
            return response;
        });
    })(connection = convergence.connection || (convergence.connection = {}));
})(convergence || (convergence = {}));
send(message, OutgoingProtocolNormalMessage);
void {
    var: type, string: string,
    var: body, any: any,
    var: envelope, MessageEnvelope: MessageEnvelope,
    this: .sendMessage(envelope)
};
request(message, OutgoingProtocolRequestMessage);
Q.Promise < IncomingProtocolResponseMessage > {
    var: requestId, number: number,
    this: ._nextRequestId++,
    var: replyDeferred, Q: .Deferred < IncomingProtocolResponseMessage > , Q: .defer(),
    var: timeout, number: number,
    var: timeoutTask, number: number,
    var: type, string: string,
    var: body, any: any,
    var: sent, MessageEnvelope: MessageEnvelope,
    this: .sendMessage(sent),
    this: ._requests[requestId] = {
        reqId: requestId,
        replyDeferred: replyDeferred,
        timeoutTask: timeoutTask,
        requestType: sent.type
    },
    return: replyDeferred.promise
};
abort(reason, string);
void {
    console: .log("Aborting connection: " + reason),
    if: function () { }, this: ._heartbeatHelper.started };
{
    this._heartbeatHelper.stop();
}
this._socket.terminate(reason);
this.onSocketDropped();
close();
Q.Promise < void  > {
    console: .log("Closing connection"),
    this: ._eventHandler = null,
    if: function () { }, this: ._heartbeatHelper.started };
{
    this._heartbeatHelper.stop();
}
return this._socket.close();
sendMessage(envelope, MessageEnvelope);
void {
    var: json, string: string,
    this: ._socket.send(json)
};
onSocketMessage(message, string);
void {
    var: envelope, MessageEnvelope: MessageEnvelope,
    if: function () { }, this: ._protocolConfig.heartbeatConfig.enabled };
{
    this._heartbeatHelper.messageReceived();
}
switch (envelope.opCode) {
    case OpCode.NORMAL:
        this.onNormalMessage(envelope);
        break;
    case OpCode.PING:
        this.onPing();
        break;
    case OpCode.PONG:
        break;
    case OpCode.REQUEST:
        this.onRequest(envelope);
        break;
    case OpCode.REPLY:
        this.onReply(envelope);
        break;
    default:
        this.handleInvalidMessage("Unexpected opCode: " + envelope.opCode);
}
onSocketClosed();
void {
    console: .log("Socket closed"),
    if: function () { }, this: ._heartbeatHelper.started };
{
    this._heartbeatHelper.stop();
}
this._eventHandler.onConnectionClosed();
onSocketDropped();
void {
    // logger.debug("Socket dropped");
    if: function () { }, this: ._heartbeatHelper.started };
{
    this._heartbeatHelper.stop();
}
this._eventHandler.onConnectionDropped();
onSocketError(error, string);
void {
    // logger.debug("Socket error");
    this: ._eventHandler.onConnectionError(error)
};
onNormalMessage(envelope, any);
void {
    var: message, ProtocolMessage: ProtocolMessage,
    this: ._eventHandler.onMessageMessage(message)
};
onRequest(envelope, MessageEnvelope);
void {
    var: message, ProtocolMessage: ProtocolMessage,
    this: ._eventHandler.onRequestReceived(message, new ReplyCallbackImpl(envelope.reqId, this))
};
onReply(envelope, MessageEnvelope);
void {
    var: requestId, number: number,
    var: record, RequestRecord: RequestRecord,
    delete: this._requests[requestId],
    if: function (record) {
        clearTimeout(record.timeoutTask);
        var type = envelope.type;
        if (type === "error") {
            var errorMessage = ErrorMessageDeserializer.deserialize(envelope.body);
            record.replyDeferred.reject(new Error(errorMessage.code + ": " + errorMessage.details));
        }
        else {
            var response = MessageSerializer.deserialize(envelope.body, record.requestType);
            record.replyDeferred.resolve(response);
        }
    }
};
onPing();
void {
    this: .sendMessage(new MessageEnvelope(OpCode.PONG, undefined, undefined, undefined))
};
handleInvalidMessage(error, string);
void {
    console: .error(error),
    this: .abort(error),
    this: ._eventHandler.onConnectionError(error)
};
var ReplyCallbackImpl = (function () {
    function ReplyCallbackImpl(reqId, protocolConnection) {
        this._reqId = reqId;
        this._protocolConnection = protocolConnection;
    }
    ReplyCallbackImpl.prototype.reply = function (message) {
        var envelope = new MessageEnvelope(OpCode.REPLY, this._reqId, undefined, message);
        this._protocolConnection.sendMessage(envelope);
    };
    ReplyCallbackImpl.prototype.unknownError = function () {
        this.unexpectedError("An unknown error has occurred");
    };
    ReplyCallbackImpl.prototype.unexpectedError = function (details) {
        this.expectedError("unknown", details);
    };
    ReplyCallbackImpl.prototype.expectedError = function (code, details) {
        var errorMessage = {
            code: code,
            details: details
        };
        var envelope = new MessageEnvelope(OpCode.REPLY, this._reqId, MessageType.ERROR, errorMessage);
        this._protocolConnection.sendMessage(envelope);
    };
    return ReplyCallbackImpl;
})();
//# sourceMappingURL=ProtocolConnection.js.map