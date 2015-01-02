"use strict";

var Z = require("zelkova");
var I = require("immutable");
var Lentil = require("../dist/lentil");

module.exports = {

  "The signal": {
    "should contain the initial data": function (test) {
      test.expect(1);
      var data = I.fromJS({ a: "foo", b: "bar" });
      var src = Z.constant(data);
      var l = Lentil.create(src, function () {});
      l.signal.subscribe(function (selection) {
        test.strictEqual(selection.value, data);
      });
      test.done();
    },
    "should not emit equivalent repeat values": function (test) {
      test.expect(1);
      var data1 = I.fromJS({ a: "foo", b: "bar" });
      var data2 = I.fromJS({ a: "foo", b: "bar" });
      var chan = Z.channel(data1);
      var src = chan.signal;
      var l = Lentil.create(src, function () {});
      l.signal.subscribe(function (selection) {
        test.strictEqual(selection.value, data1);
      });
      chan.send(data2);
      test.done();
    }
  },

  "selecting": {
    "should produce a new Lentil for a more specific part of the data": function (test) {
      test.expect(2);
      var src = Z.constant(I.fromJS({ a: "foo", b: "bar" }));
      var l = Lentil.create(src, function () {});
      l.select("a").signal.subscribe(function (selection) { test.equal(selection.value, "foo") });
      l.select("b").signal.subscribe(function (selection) { test.equal(selection.value, "bar") });
      test.done();
    },
    "should allow multi-part paths": function (test) {
      test.expect(1);
      var src = Z.constant(I.fromJS({ a: "foo", b: { test: ["bar"] } }));
      var l = Lentil.create(src, function () {});
      l.select("b", "test", 0).signal.subscribe(function (selection) {
        test.equal(selection.value, "bar");
      });
      test.done();
    },
    "should be chainable": function (test) {
      test.expect(1);
      var src = Z.constant(I.fromJS({ a: "foo", b: { test: ["bar"] } }));
      var l = Lentil.create(src, function () {});
      l.select("b").select("test").select(0).signal.subscribe(function (selection) {
        test.equal(selection.value, "bar");
      });
      test.done();
    }
  },

  "joining": {
    "should run the update function with new data after patching the original value": function (test) {
      test.expect(1);
      var data1 = I.fromJS({ a: "foo", b: ["bar"] });
      var data2 = I.fromJS({ a: "foo", b: ["bar", "baz", "fizz"] });
      var src = Z.constant(data1);
      var chan = Z.channel(data1.get("b"));
      var l = Lentil.create(src, function (value) {
        test.ok(I.is(value, data2))
      });
      l.select("b").join(chan.signal);
      chan.send(I.fromJS(["bar", "baz", "fizz"]));
      test.done();
    }
  }

};
