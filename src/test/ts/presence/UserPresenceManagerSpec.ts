import {Observable, Subscription, Subject} from "rxjs/Rx";

import * as chai from "chai";
import ExpectStatic = Chai.ExpectStatic;
import {UserPresenceImpl} from "../../../main/ts/presence/UserPresenceImpl";
import {UserPresenceManager} from "../../../main/ts/presence/UserPresenceManager";
import {MessageEvent} from "../../../main/ts/connection/ConvergenceConnection";

var expect: ExpectStatic = chai.expect;


const noOp: () => void = () => {};

describe('UserPresenceManager', () => {

  it('initial presence set correctly', () => {
    const state = new Map<string, any>();
    state.set("key", 9);

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", true, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    expect(mgr.username()).to.equal(initialPresence.username());
    expect(mgr.isAvailable()).to.equal(initialPresence.isAvailable());
    expect(mgr.state().size).to.equal(1);
    expect(mgr.state().get("key")).to.equal(9);
    expect(mgr.state("key")).to.equal(9);
  });

  it('availability is set properly', () => {
    const state = new Map<string, any>();
    state.set("key", 9);

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    mgr.availability(true);

    expect(mgr.isAvailable()).to.equal(true);
  });

  it('new state is merged properly', () => {
    const state = new Map<string, any>();
    state.set("key1", "value1");
    state.set("key2", "value2");

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    const add = new Map<string, any>();
    add.set("key2", "2");
    add.set("key3", "3");
    mgr.set(add);

    expect(mgr.state().size).to.equal(3);
    expect(mgr.state("key1")).to.equal("value1");
    expect(mgr.state("key2")).to.equal("2");
    expect(mgr.state("key3")).to.equal("3");
  });

  it('new state is removed properly', () => {
    const state = new Map<string, any>();
    state.set("key1", "value1");
    state.set("key2", "value2");
    state.set("key3", "value3");

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    mgr.remove(["key1", "key2"]);

    expect(mgr.state().size).to.equal(1);
    expect(mgr.state("key3")).to.equal("value3");
  });

  it('new state is cleared properly', () => {
    const state = new Map<string, any>();
    state.set("key1", "value1");
    state.set("key2", "value2");
    state.set("key3", "value3");

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    mgr.clear();

    expect(mgr.state().size).to.equal(0);
  });

  it('set fires the proper event', () => {
    const state = new Map<string, any>();

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    let firedEvent: boolean = false;

    mgr.on("state_set", (e) => {
      firedEvent = true;
      expect(e.name).to.equal("state_set");
      expect(e.state.size).to.equal(1);
      expect(e.state.get("key")).to.equal("value");
    });

    let firedObserver: boolean = false;
    mgr.events().filter(e => e.name === "state_set").subscribe((e) => {
      firedObserver = true;
    });

    const add = new Map<string, any>();
    add.set("key", "value");
    mgr.set(add);

    expect(firedEvent).to.be.true;
    expect(firedObserver).to.be.true;
  });

  it('clear fires the proper event', () => {
    const state = new Map<string, any>();

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    let firedEvent: boolean = false;
    mgr.on("state_cleared", (e) => {
      firedEvent = true;
    });

    let firedObserver: boolean = false;
    mgr.events().filter(e => e.name === "state_cleared").subscribe((e) => {
      firedObserver = true;
    });

    mgr.clear();

    expect(firedEvent).to.be.true;
    expect(firedObserver).to.be.true;
  });

  it('remove fires the proper event', () => {
    const state = new Map<string, any>();

    const testSubject = new Subject<MessageEvent>();
    const initialPresence = new UserPresenceImpl("test", false, state);
    const mgr = new UserPresenceManager(initialPresence, testSubject.asObservable(), noOp);

    let firedEvent: boolean = false;
    mgr.on("state_removed", (e) => {
      firedEvent = true;
      expect(e.name).to.equal("state_removed");
      expect(e.keys).to.deep.equal(["k1", "k2"]);
    });

    let firedObserver: boolean = false;
    mgr.events().filter(e => e.name === "state_removed").subscribe((e) => {
      firedObserver = true;
    });

    mgr.remove(["k1", "k2"]);

    expect(firedEvent).to.be.true;
    expect(firedObserver).to.be.true;
  });
});
