"use strict";

var Z = require("zelkova");
var I = require("immutable");
var Lentil = require("../dist/lentil");

module.exports = {

  "should run the update function with new data after a set operation": function (test) {
    test.expect(1);
    var data1 = I.fromJS({ a: "foo", b: "bar" });
    var data2 = I.fromJS({ a: "baz", b: "fiz" });
    var src = Z.constant(data1);
    var l = Lentil.create(src, function (value) {
      test.strictEqual(value, data2);
    });
    l.signal.subscribe(function (selection) {
      selection.set(data2);
    });
    test.done();
  },

  "should run the update function with new data after a modify operation": function (test) {
    test.expect(1);
    var data1 = I.fromJS({ a: "foo", b: "bar" });
    var data2 = data1.set("c", "baz");
    var src = Z.constant(data1);
    var l = Lentil.create(src, function (value) {
      test.ok(I.is(value, data2));
    });
    l.signal.subscribe(function (selection) {
      selection.modify(function (data) {
        return data.set("c", "baz");
      });
    });
    test.done();
  },

  "select": {
    "should produce a new Selection with the correct value": function (test) {
      test.expect(1);
      var data = I.fromJS({ a: "foo", b: "bar" });
      var src = Z.constant(data);
      var l = Lentil.create(src, function () {});
      l.signal.subscribe(function (selection) {
        test.equal(selection.select("b").value, "bar");
      });
      test.done();
    },
    "should modify the data at the newly selected location": function (test) {
      test.expect(1);
      var data1 = I.fromJS({ a: "foo", b: "bar" });
      var data2 = data1.set("b", "baz");
      var src = Z.constant(data1);
      var l = Lentil.create(src, function (value) {
        test.ok(I.is(value, data2));
      });
      l.signal.subscribe(function (selection) {
        selection.select("b").set("baz");
      });
      test.done();
    }
  }

};
