import {Session} from "../Session";
import {ConvergenceConnection, MessageEvent} from "../connection/ConvergenceConnection";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/bindCallback";
import 'rxjs/add/operator/map';
import {MessageType} from "../connection/protocol/MessageType";
import {ChatRoom} from "./ChatRoom";
import {EventKey} from "../util/EventEmitter";

export class ChatService {

  private _connection: ConvergenceConnection;
  private _eventStream: Observable<MessageEvent>;

  constructor(connection: ConvergenceConnection) {
    this._connection = connection;

    var multiMessageListener: (types: EventKey[]) => Observable<MessageEvent> =
      Observable.bindCallback(this._connection.addMultipleMessageListener);

    // TODO: Change Message Types
    this._eventStream = multiMessageListener(
      [MessageType.PRESENCE_AVAILABILITY_CHANGED,
        MessageType.PRESENCE_STATE_SET,
        MessageType.PRESENCE_STATE_CLEARED]
    );
  }

  session(): Session {
    return this._connection.session();
  }

  room(id: string): ChatRoom {
    // TODO: add room filter
    return new ChatRoom(id, this._eventStream, this._connection);
  }

  eventStream(): Observable<MessageEvent> {
    return this._eventStream;
  }
}
