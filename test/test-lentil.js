"use strict";

var Lentil = require("../dist/lentil");

module.exports = {

  "plens should create a PLens from a getter and setter": function (test) {
    test.expect(1);
    var lens = Lentil.plens(
      function (x) { return x; },
      function (x, y) { return y; }
    );
    test.ok(lens instanceof Lentil.PLens);
    test.done();
  },

  "plens(x => x, (x, y) => y) should produce an identity lens": function (test) {
    test.expect(2);
    var lens = Lentil.plens(
      function (x) { return x; },
      function (x, y) { return y; }
    );
    test.ok(lens.get(true));
    test.ok(lens.set({}, true));
    test.done();
  },

  "lens.modify should accept the old value and return a new value": function (test) {
    test.expect(1);
    var lens = Lentil.plens(
      function (x) { return x; },
      function (x, y) { return y; }
    );
    var init = {};
    test.ok(lens.modify(init, function (x) { return x === init; }));
    test.done();
  },

  "prop should create a PLens for a property of an anonymous object": function (test) {
    test.expect(3);
    var _x = Lentil.prop("x");
    test.ok(_x.get({ x: true }));
    var obj1 = { x: false };
    var obj2 = _x.set(obj1, true);
    test.ok(obj1 !== obj2);
    test.ok(obj2.x);
    test.done();
  },

  "index should create a PLens for an index of an array": function (test) {
    test.expect(3);
    var _1 = Lentil.index(1);
    test.ok(_1.get([false, true, false]));
    var arr1 = [false, false, false];
    var arr2 = _1.set(arr1, true);
    test.ok(arr1 !== arr2);
    test.ok(arr2[1]);
    test.done();
  },

  "pl1.compose(pl2) should compose pl1 and pl2": function (test) {
    test.expect(2);
    var _x = Lentil.prop("x");
    var _y = Lentil.prop("y");
    var _xy = _y.compose(_x);
    test.ok(_xy.get({ x: { y: true }}));
    test.ok(_xy.set({ x: { y: false }}, true).x.y);
    test.done();
  },

  "pl1.then(pl2) should compose pl2 and pl1": function (test) {
    test.expect(2);
    var _x = Lentil.prop("x");
    var _y = Lentil.prop("y");
    var _xy = _x.then(_y);
    test.ok(_xy.get({ x: { y: true }}));
    test.ok(_xy.set({ x: { y: false }}, true).x.y);
    test.done();
  },

  "set should alter the value of the current lens when the current value is null": function (test) {
    test.expect(1);
    var _x = Lentil.prop("x");
    test.deepEqual(_x.set({ x: null }, true), { x: true });
    test.done();
  },

  "a composed set should not alter the value of the current lens when the 'previous' value is null": function (test) {
    test.expect(1);
    var _x = Lentil.prop("x");
    var _y = Lentil.prop("y");
    var _xy = _y.compose(_x);
    test.deepEqual(_xy.set({ x: null }, true), undefined);
    test.done();
  }

};
