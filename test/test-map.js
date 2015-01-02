"use strict";

var Z = require("zelkova");
var I = require("immutable");
var Lentil = require("../dist/lentil");

module.exports = {

  "should iterate over a collection": function (test) {
    var expectedValues = ["foo", "bar", "baz"];
    test.expect(expectedValues.length);
    var src = Z.constant(I.fromJS(["foo", "bar", "baz"]));
    var l = Lentil.create(src, function () {});
    l.map(function (selection) {
      test.ok(I.is(selection.value, expectedValues.shift()));
      return selection.value;
    });
    test.done();
  },

  "should only re-trigger the mapping function for items that change": function (test) {
    var expectedValues = ["foo", "bar", "baz", "fizz"];
    var data1 = I.fromJS(["foo", "bar", "baz"]);
    var data2 = data1.set(1, "fizz");
    var expectedData = [data1, data2];
    test.expect(expectedValues.length + expectedData.length);
    var chan = Z.channel(data1);
    var src = chan.signal;
    var l = Lentil.create(src, function () {});
    l.map(function (selection) {
      test.ok(I.is(selection.value, expectedValues.shift()));
      return selection.value;
    }).subscribe(function (data) {
      test.ok(I.is(data, expectedData.shift()));
    });
    chan.send(data2);
    test.done();
  }/*,

  "should allow setting during an update": function (test) {
    var expectedValues = ["foo", "bar", "baz", "fizz"];
    var data1 = I.fromJS(["foo", "bar", "baz"]);
    var data2 = data1.set(1, "fizz");
    var expectedData = [data1, data2];
    test.expect(expectedValues.length + expectedData.length);
    var chan = Z.channel(data1);
    var src = chan.signal;
    var l = Lentil.create(src, function (data) {
      chan.send(data);
    });
    l.map(function (selection) {
      test.ok(I.is(selection.value, expectedValues.shift()));
      if (selection.value === "bar") selection.set("fizz");
      return selection.value;
    }).subscribe(function (data) {
      test.ok(I.is(data, expectedData.shift()));
    });
    test.done();
  }*/

};
