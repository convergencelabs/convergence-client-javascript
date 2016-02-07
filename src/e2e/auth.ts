import ConvergenceDomain from "../main/ts/ConvergenceDomain";
import MockServer from "../mock/MockServer";
import MessageType from "../main/ts/protocol/MessageType";
import {MessageEnvelope} from "../main/ts/protocol/protocol";

import * as chai from "chai";
import ExpectStatic = Chai.ExpectStatic;

var expect: ExpectStatic = chai.expect;
var fail: Function = chai.assert.fail;

//describe('Authentication E2E', () => {
//
//  it('Successful auth', () => {
var url: string = "ws://localhost:8085/domain/namespace1/domain1";
var mockServer: MockServer = new MockServer(url);
var domain: ConvergenceDomain = new ConvergenceDomain(url);

mockServer.handshake(1000).then(() => {
  return Promise.all([
    domain.authenticateWithPassword("test", "password"),
    mockServer.expectRequestMessage(1000, MessageType.AUTHENTICATE, {method: "password", username: "test", password: "password"})
      .then((envelope: MessageEnvelope) => {
        mockServer.sendReply(envelope.reqId, {success: true, username: "test"});
      })
  ]);
}).then(() => {
  return Promise.all([
    domain.modelService().open("collection", "model"),
    mockServer.expectRequestMessage(1000, MessageType.OPEN_REAL_TIME_MODEL, {method: "password", username: "test", password: "password"}).then((envelope: MessageEnvelope) => {
      var body: any = {
        resourceId: "1",
        version: 0,
        createdTime: new Date().getTime(),
        modifiedTime: new Date().getTime(),
        data: {num: 10}
      };
      mockServer.sendReply(envelope.reqId, body);
    })]);
}).then(() => {
  mockServer.stop();
}).catch((error: Error) => {
  mockServer.stop();
  fail(error);
});
//  });
//});
