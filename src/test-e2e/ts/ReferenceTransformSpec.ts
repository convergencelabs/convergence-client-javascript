import ConvergenceDomain from "../../main/ts/ConvergenceDomain";
import MessageType from "../../main/ts/connection/protocol/MessageType";
import {RealTimeModel} from "../../main/ts/model/RealTimeModel";
import {MockConvergenceServer} from "../mock-server/MockConvergenceServer";
import {DoneType} from "../mock-server/MockConvergenceServer";
import {IMockServerOptions} from "../mock-server/MockConvergenceServer";
import {IReceiveRequestRecord, ISendRecord} from "../mock-server/records";
import {ISendRequestRecord} from "../mock-server/records";
import {IReceiveResponseRecord} from "../mock-server/records";
import RealTimeString from "../../main/ts/model/RealTimeString";
import {debugFlags} from "../../main/ts/Debug";


describe('Reference Transformation E2E', () => {

  it('Successful open of existing model', (done: MochaDone) => {
    debugFlags.socket.messages = true;

    var resourceId = "1";
    var remoteSessionId = "u1:02";

    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));

    var expectedOpen: any = {t: MessageType.OPEN_REAL_TIME_MODEL_REQUEST, c: "collection", m: "model", i: false};
    var openReq: IReceiveRequestRecord = mockServer.expectRequest(expectedOpen, 300);
    mockServer.sendReplyTo(openReq, {
      r: resourceId,
      v: 0,
      c: new Date().getTime(),
      m: new Date().getTime(),
      d: {
        d: {
          "i": "0:0",
          "?": 0,
          "c": {
            "text": {
              "i": "0:1",
              "?": 2,
              "v": "Some example text to test with."
            }
          }
        },
        s: [remoteSessionId],
        r: []
      },
      t: MessageType.OPEN_REAL_TIME_MODEL_RESPONSE
    });

    var refPublishAction = mockServer.send({
      r: resourceId,
      s: remoteSessionId,
      d: "0:1",
      k: "testKey",
      c: 0,
      t: MessageType.REFERENCE_PUBLISHED
    });

    var expectOp: any = {
      r:"1",
      s:0,
      v:0,
      o:{
        t:13,
        d:"0:1",
        n:false,
        i:0,
        v:"x"
      },
      t:22
    };
    mockServer.expect(expectOp, 300);

    var referenceSetAction: ISendRecord = mockServer.send({
      r: resourceId,
      s: remoteSessionId,
      k: "testKey",
      d: "0:1",
      c: 0,
      v: 10,
      t: 29}, 300);

    mockServer.start();

    ConvergenceDomain.connectWithToken(mockServer.url(), "token").then(domain => {
      return domain.modelService().open("collection", "model");
    }).then((model: RealTimeModel) => {
      referenceSetAction.acknowledgeReceipt();
      var rts: RealTimeString = <RealTimeString>model.dataAt("text");
      console.log(model.connectedSessions());

      rts.on(RealTimeString.Events.REFERENCE, function(e) {
        console.log(e.reference.userId());
        refPublishAction.acknowledgeReceipt();
        e.reference.on("set", (e) => {
          referenceSetAction.acknowledgeReceipt();
          console.log(e.src.value());
          mockServer.doneManager().testSuccess();
        })
      });

      rts.insert(0, "x");
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
