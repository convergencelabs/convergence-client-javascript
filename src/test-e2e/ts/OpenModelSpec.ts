import ConvergenceDomain from "../../main/ts/ConvergenceDomain";
import MessageType from "../../main/ts/protocol/MessageType";
import RealTimeModel from "../../main/ts/model/RealTimeModel";
import {MockConvergenceServer} from "../mock-server/MockConvergenceServer";
import {DoneType} from "../mock-server/MockConvergenceServer";
import {IMockServerOptions} from "../mock-server/MockConvergenceServer";

describe('Open Real Time Model E2E', () => {

  it('Successful open of existing model', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));

    var expectedOpen: any = {t: MessageType.OPEN_REAL_TIME_MODEL_REQUEST, c: "collection", m: "model", i: false};
    mockServer.expectRequest(expectedOpen, 300)
      .thenReply({
        r: "1",
        v: 0,
        c: new Date().getTime(),
        m: new Date().getTime(),
        d: {num: 10},
        t: MessageType.OPEN_REAL_TIME_MODEL_RESPONSE
      });

    var domain: ConvergenceDomain = new ConvergenceDomain(mockServer.url());
    domain.authenticateWithToken("token").then(() => {
      return domain.modelService().open("collection", "model");
    }).then((model: RealTimeModel) => {
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it('Successful open of existing new model with initializer povided', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));

    var expectedOpen: any = {t: MessageType.OPEN_REAL_TIME_MODEL_REQUEST, c: "collection", m: "model", i: true};
    mockServer.expectRequest(expectedOpen, 300).thenCall((openRequest: any) => {
      mockServer.sendRequest({t: MessageType.MODEL_DATA_REQUEST, c: "collection", m: "model"});
      mockServer.expectResponse({t: MessageType.MODEL_DATA_RESPONSE, d: {num: 10}}, 300).thenCall((dataResponse: any) => {
        mockServer.sendReply(openRequest.q, {
          r: "1",
          v: 0,
          c: new Date().getTime(),
          m: new Date().getTime(),
          d: dataResponse.d,
          t: MessageType.OPEN_REAL_TIME_MODEL_RESPONSE
        });
      });
    });

    var domain: ConvergenceDomain = new ConvergenceDomain(mockServer.url());
    domain.authenticateWithToken("token").then(() => {
      return domain.modelService().open("collection", "model", () => {
        return {num: 10};
      });
    }).then((model: RealTimeModel) => {
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  //
  // Text Fixture Code
  //
  var url: string = "ws://localhost:8085/domain/namespace1/domain1";

  function expectedSuccessOptions(done: MochaDone): IMockServerOptions {
    return {
      url: url,
      doneType: DoneType.MOCHA,
      mochaDone: done,

      autoHandshake: true,
      handshakeTimeout: 200,

      autoTokenAuth: true,
      authExpectedToken: "token",

      immediateAutoWait: true
    };
  }
});
