import {ObservableEventEmitter, EventListener} from "../../../main/ts/util/ObservableEventEmitter";
import {Subject} from "rxjs/Rx";
import {ConvergenceEvent} from "../../../main/ts/util/ConvergenceEvent";

import * as chai from "chai";
import {fail} from "assert";
import ExpectStatic = Chai.ExpectStatic;
var expect: ExpectStatic = chai.expect;

describe('EventEmitter', () => {

  it('A listener registered for an event should get called when that event is emitted', () => {
    var value: number = 0;
    var emitter: TestEmitter = new TestEmitter();
    var listener: EventListener<TestEvent> = (e: TestEvent) => {
      value = e.value;
    };
    emitter.on("event", listener);

    emitter.next({src: this, name: "event", value: 1});

    expect(value).to.equal(1);
  });

  it('A listener is not notified after it is removed', () => {
    var emitter: TestEmitter = new TestEmitter();
    var listener: EventListener<TestEvent> = (e: TestEvent) => {
      fail();
    };
    emitter.on("event", listener);
    emitter.off("event", listener);

    emitter.next({src: this, name: "test", value: 1});
  });

  it('All listeners for an event are not notified after all listeners are removed for that event', () => {
    var count: number = 0;
    var emitter: TestEmitter = new TestEmitter();

    emitter.on("event1", () => {
      fail();
    });
    emitter.on("event1", () => {
      fail();
    });

    emitter.on("event2", () => {
      count++;
    });

    emitter.removeAllListeners("event1");

    emitter.next({src: this, name: "event1", value: 1});
    emitter.next({src: this, name: "event2", value: 1});

    expect(count).to.equal(1);
  });

  it('No listeners are notified after all listeners are removed', () => {
    var emitter: TestEmitter = new TestEmitter();

    emitter.on("event1", () => {
      fail();
    });
    emitter.on("event2", () => {
      fail();
    });

    emitter.removeAllListenersForAllEvents();

    emitter.next({src: this, name: "event1", value: 1});
    emitter.next({src: this, name: "event2", value: 1});
  });

  it('A once listener is only notified once.', () => {
    var count: number = 0;
    var emitter: TestEmitter = new TestEmitter();
    var listener: EventListener<TestEvent> = (e: TestEvent) => {
      count++;
    };
    emitter.once("event", listener);

    emitter.next({src: this, name: "event", value: 1});
    emitter.next({src: this, name: "event", value: 1});

    expect(count).to.equal(1);
  });

  it('A listener is only notified for events it is register to.', () => {
    var count: number = 0;
    var emitter: TestEmitter = new TestEmitter();
    var listener: EventListener<TestEvent> = (e: TestEvent) => {
      count++;
    };
    emitter.once("event", listener);

    emitter.next({src: this, name: "event", value: 1});
    emitter.next({src: this, name: "event1", value: 1});
    expect(count).to.equal(1);
  });

  it('Event registration is case insensitive', () => {
    var count: number = 0;
    var emitter: TestEmitter = new TestEmitter();
    var listener: EventListener<TestEvent> = (e: TestEvent) => {
      count++;
    };
    emitter.on("EVENT", listener);

    emitter.next({src: this, name: "event", value: 1});
    emitter.next({src: this, name: "eVeNt", value: 1});

    emitter.off("EvEnt", listener);

    emitter.next({src: this, name: "EVENT", value: 1});
    expect(count).to.equal(2);
  });

  it('Listeners can not be added multiple times', () => {
    var count: number = 0;
    var emitter: TestEmitter = new TestEmitter();
    var listener: EventListener<TestEvent> = (e: TestEvent) => {
      count++;
    };
    emitter.on("event", listener);
    emitter.on("event", listener);

    emitter.next({src: this, name: "event", value: 1});

    expect(count).to.equal(1);
  });
});

class TestEmitter extends ObservableEventEmitter<TestEvent> {
  private _subject: Subject<TestEvent>;

  constructor() {
    super();
    this._subject = new Subject<TestEvent>();
    this.setObservable(this._subject);
  }

  public next(event: TestEvent): ObservableEventEmitter<TestEvent> {
    this._subject.next(event);
    return this;
  }
}

interface TestEvent extends ConvergenceEvent {
  value: number;
}
