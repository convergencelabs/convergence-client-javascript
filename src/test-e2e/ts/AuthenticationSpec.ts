import ConvergenceDomain from "../../main/ts/ConvergenceDomain";
import MessageType from "../../main/ts/protocol/MessageType";
import RealTimeModel from "../../main/ts/model/RealTimeModel";
import {MockServer} from "./MockServer";
import {IDoneManager} from "./MockServer";
import {DoneType} from "./MockServer";

describe('Authentication E2E', () => {

  it('Successful auth', (done: MochaDone) => {
    var url: string = "ws://localhost:8085/domain/namespace1/domain1";

    var mockServer: MockServer = new MockServer({url: url, doneType: DoneType.MOCHA, mochaDone: done});
    var doneManager: IDoneManager = mockServer.doneManager();

    // set up the server's behavior
    mockServer.handshake(1000);

    var authExpected: any = {t: MessageType.PASSWORD_AUTH_REQUEST, u: "test", p: "password"};
    mockServer.expectRequest(1000, authExpected)
      .thenReply({t: MessageType.AUTHENTICATE_RESPONSE, s: true, u: "test"});

    var expectedOpen: any = {t: MessageType.OPEN_REAL_TIME_MODEL_REQUEST, c: "collection", m: "model", i: false};
    mockServer.expectRequest(1000, expectedOpen)
      .thenReply({
        r: "1",
        v: 0,
        c: new Date().getTime(),
        m: new Date().getTime(),
        d: {num: 10},
        t: MessageType.OPEN_REAL_TIME_MODEL_RESPONSE
      });

    // Execute test code
    ConvergenceDomain.debugFlags.protocol.messages = true;
    var domain: ConvergenceDomain = new ConvergenceDomain(url);
    mockServer.step();

    domain.authenticateWithPassword("test", "password").then(() => {
      mockServer.step();
      return domain.modelService().open("collection", "model");
    }).then((model: RealTimeModel) => {
      doneManager.testSuccess();
    }).catch((error: Error) => {
      doneManager.testFailure(error);
    });
  });
});
