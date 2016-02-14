import * as chai from "chai";
import ExpectStatic = Chai.ExpectStatic;
import Deferred from "../../../main/ts/util/Deferred";


var expect: ExpectStatic = chai.expect;

describe('DeferredSpec', () => {

  it('calling resolve on the deferred must resolve the promise with the correct valeue', (done: Function) => {
    var resolveVal: string = "resolve";

    var def: Deferred<string> = new Deferred<string>();
    def.promise().then((val: string) => {
      expect(val).to.equal(resolveVal);
      done();
    }).catch(() => {
      done(new Error("The promise was rejected, when it was supposed to be resolved."));
    });

    def.resolve(resolveVal);
  });

  it('calling reject on the deferred must reject the promise with the correct error', (done: Function) => {
    var rejectError: Error = new Error("Test Error");

    var def: Deferred<string> = new Deferred<string>();
    def.promise().then((val: string) => {
      done(new Error("The promise was resolved, when it was supposed to be rejected."));
    }).catch((error: Error) => {
      expect(error).to.equal(rejectError);
      done();
    });

    def.reject(rejectError);
  });
});
