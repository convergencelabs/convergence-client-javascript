import ConvergenceDomain from "../../main/ts/ConvergenceDomain";
import MessageType from "../../main/ts/connection/protocol/MessageType";
import {RealTimeModel} from "../../main/ts/model/RealTimeModel";
import {MockConvergenceServer} from "../mock-server/MockConvergenceServer";
import {DoneType} from "../mock-server/MockConvergenceServer";
import {IMockServerOptions} from "../mock-server/MockConvergenceServer";
import {IReceiveRequestRecord} from "../mock-server/records";
import {ISendRequestRecord} from "../mock-server/records";
import {IReceiveResponseRecord} from "../mock-server/records";


describe('Open Real Time Model E2E', () => {

  it('Successful open of existing model', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));

    var expectedOpen: any = {t: MessageType.OPEN_REAL_TIME_MODEL_REQUEST, c: "collection", m: "model", i: false};
    var openReq: IReceiveRequestRecord = mockServer.expectRequest(expectedOpen, 300);
    mockServer.sendReplyTo(openReq, {
      r: "1",
      v: 0,
      c: new Date().getTime(),
      m: new Date().getTime(),
      d: {num: 10},
      t: MessageType.OPEN_REAL_TIME_MODEL_RESPONSE
    });
    mockServer.start();

    ConvergenceDomain.connectWithToken(mockServer.url(), "token").then(domain => {
      return domain.modelService().open("collection", "model");
    }).then((model: RealTimeModel) => {
      mockServer.doneManager().testSuccess();
    }).catch((error: Error) => {
      mockServer.doneManager().testFailure(error);
    });
  });

  it('Successful open of existing new model with initializer provided', (done: MochaDone) => {
    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));
    var expectedOpen: any = {t: MessageType.OPEN_REAL_TIME_MODEL_REQUEST, c: "collection", m: "model", i: true};
    var openReq: IReceiveRequestRecord =
      mockServer.expectRequest(expectedOpen, 300);
    var dataReq: ISendRequestRecord =
      mockServer.sendRequest({t: MessageType.MODEL_DATA_REQUEST, c: "collection", m: "model"});
    var dataResp: IReceiveResponseRecord =
      mockServer.expectResponseTo(dataReq, {t: MessageType.MODEL_DATA_RESPONSE, d: {num: 10}});
    mockServer.sendReplyTo(openReq, () => {
      return {
        r: "1",
        v: 0,
        c: new Date().getTime(),
        m: new Date().getTime(),
        d: dataResp.message().d,
        t: MessageType.OPEN_REAL_TIME_MODEL_RESPONSE
      };
    });
    mockServer.start();

    ConvergenceDomain.connectWithToken(mockServer.url(), "token").then(domain => {
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
      authExpectedToken: "token"
    };
  }
});
