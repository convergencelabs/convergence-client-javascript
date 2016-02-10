import ConvergenceDomain from "../../main/ts/ConvergenceDomain";
import MockServer from "./MockServer";
import MessageType from "../../main/ts/protocol/MessageType";
import {MessageEnvelope} from "../../main/ts/protocol/protocol";
import RealTimeModel from "../../main/ts/model/RealTimeModel";

describe('Authentication E2E', () => {

  it('Successful auth', (done: Function) => {
    var url: string = "ws://localhost:8085/domain/namespace1/domain1";
    var mockServer: MockServer = new MockServer(url);
    var domain: ConvergenceDomain = new ConvergenceDomain(url);

    mockServer.handshake(1000).then(() => {
      return domain.authenticateWithPassword("test", "password");
    }).then(() => {
      return domain.modelService().open("collection", "model");
    }).then((model: RealTimeModel) => {
      console.log("model opened: " + model.data().value());
      mockServer.stop();
      done();
    }).catch((error: Error) => {
      mockServer.stop();
      done(error);
    });

    // set up the server's behavior
    var authExpected: any = {method: "password", username: "test", password: "password"};
    mockServer.expectRequestMessage(1000, MessageType.AUTHENTICATE, authExpected).then((envelope: MessageEnvelope) => {
      mockServer.sendReply(envelope.reqId, {success: true, username: "test"});
    }).then(() => {
      var expectedOpen: any = {fqn: {cId: "collection", mId: "model"}, init: false};
      return mockServer.expectRequestMessage(1000, MessageType.OPEN_REAL_TIME_MODEL, expectedOpen);
    }).then((envelope: MessageEnvelope) => {
      mockServer.sendReply(envelope.reqId, {
        resourceId: "1",
        version: 0,
        createdTime: new Date().getTime(),
        modifiedTime: new Date().getTime(),
        data: {num: 10}
      });
    }).catch((error: Error) => {
      done(error);
    });
  });
});
