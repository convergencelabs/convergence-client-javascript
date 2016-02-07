import ConvergenceDomain from "../main/ts/ConvergenceDomain";
import MockServer from "../mock/MockServer";
import MessageType from "../main/ts/protocol/MessageType";
import {MessageEnvelope} from "../main/ts/protocol/protocol";


import {fail} from "assert";

describe('Authentication E2E', () => {

  it('Successful auth', () => {
    var mockServer: MockServer = new MockServer(8085);
    var domain: ConvergenceDomain = new ConvergenceDomain("http://localhost:8085/domain/namespace1/domain1");

    mockServer.handshake(1000).then(() => {
      return domain.authenticateWithPassword("test", "password");
    }).then(() => {
      return domain.modelService().open("collection", "model");

    }).then(() => {
      mockServer.stop();
    }).catch((error: Error) => {
      fail();
      mockServer.stop();
    });

    mockServer.expectMessage(1000, MessageType.AUTHENTICATE).then((envelope: MessageEnvelope) => {
      mockServer.sendReply(envelope.reqId, {success: true, username: "test"});
    });
  });
});
