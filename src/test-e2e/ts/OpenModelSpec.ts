import ConvergenceDomain from "../../main/ts/ConvergenceDomain";
import {MessageType} from "../../main/ts/connection/protocol/MessageType";
import {RealTimeModel} from "../../main/ts/model/RealTimeModel";
import {OpenRealTimeModelRequest} from "../../main/ts/connection/protocol/model/openRealtimeModel";
import {MockConvergenceServer} from "../mock-server/MockConvergenceServer";
import {DoneType} from "../mock-server/MockConvergenceServer";
import {IMockServerOptions} from "../mock-server/MockConvergenceServer";
import {IReceiveRequestRecord} from "../mock-server/records";
import {ISendRequestRecord} from "../mock-server/records";
import {IReceiveResponseRecord} from "../mock-server/records";
import {ModelFqn} from "../../main/ts/model/ModelFqn";
import {OpenRealTimeModelRequestSerializer} from "../../main/ts/connection/protocol/model/openRealtimeModel";
import {DataValue} from "../../main/ts/model/dataValue";
import {DataValueSerializer} from "../../main/ts/connection/protocol/model/dataValue";
import {DataValueFactory} from "../../main/ts/model/DataValueFactory";


describe('Open Real Time Model E2E', () => {

  it('Successful open of existing model', (done: MochaDone) => {
    var id: number = 0;
    var idGen = () => {
      return "" + id++;
    };

    var mockServer: MockConvergenceServer = new MockConvergenceServer(expectedSuccessOptions(done));

    var fqn: ModelFqn = new ModelFqn("collection", "model");

    var openRequest: OpenRealTimeModelRequest = {
      type: MessageType.OPEN_REAL_TIME_MODEL_REQUEST,
      modelFqn: fqn,
      initializerProvided: false
    };

    var expectOpen = OpenRealTimeModelRequestSerializer(openRequest);
    expectOpen.t = MessageType.OPEN_REAL_TIME_MODEL_REQUEST;
    var openReq: IReceiveRequestRecord = mockServer.expectRequest(expectOpen, 300);
    mockServer.sendReplyTo(openReq, {
      r: "1",
      v: 0,
      c: new Date().getTime(),
      m: new Date().getTime(),
      d: {
        d: DataValueSerializer(DataValueFactory.createDataValue({num: 10}, idGen)),
        s: [],
        r: []
      },
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
