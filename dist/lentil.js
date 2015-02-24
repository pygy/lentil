var lentil;
(function (lentil) {
    "use strict";
    var Store = (function () {
        function Store(set, value) {
            this.set = set;
            this.value = value;
        }
        return Store;
    })();
    lentil.Store = Store;
    /**
     * A partial lens.
     *
     * `A` is the type of the value and `B` is the type of the "field" the lens is
     * referring to - "field" does not necessarily refer to the property of an
     * object, it may also be an array index, or infact anything that there
     * is a bijection for.
     */
    var PLens = (function () {
        function PLens(run) {
            this.run = run;
        }
        PLens.prototype.compose = function (that) {
            var _this = this;
            return new PLens(function (c) {
                var x = that.run(c);
                if (x == null || x.value == null)
                    return null;
                var y = _this.run(x.value);
                return y.value == null ? null : new Store(function (b) { return x.set(y.set(b)); }, y.value);
            });
        };
        PLens.prototype.then = function (that) {
            return that.compose(this);
        };
        PLens.prototype.get = function (a, or) {
            var s = this.run(a);
            return s ? s.value : or;
        };
        PLens.prototype.set = function (a, b, or) {
            var s = this.run(a);
            return s ? s.set(b) : or;
        };
        PLens.prototype.modify = function (a, map, or) {
            var s = this.run(a);
            return s ? s.set(map(s.value)) : or;
        };
        return PLens;
    })();
    lentil.PLens = PLens;
    /**
     * Create a `PLens` from a getter and setter function. The setter should not
     * mutate the original object, but instead return a new value with the
     * updated field.
     */
    function plens(get, set) {
        return new PLens(function (a) {
            return new Store(function (b) { return set(a, b); }, get(a));
        });
    }
    lentil.plens = plens;
    /**
     * Shallow-copy an object, used when setting with a `prop`-created `PLens`.
     */
    function clone(obj) {
        var result = {};
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                result[k] = obj[k];
            }
        }
        return result;
    }
    /**
     * Create a `PLens` for a property of an anonymous object.
     */
    function prop(name) {
        return new PLens(function (obj) {
            return new Store(function (value) {
                var result = clone(obj);
                result[name] = value;
                return result;
            }, obj[name]);
        });
    }
    lentil.prop = prop;
    /**
     * Create a `PLens` for an index of an array.
     */
    function index(i) {
        return new PLens(function (arr) {
            return new Store(function (value) {
                var result = arr.slice();
                result[i] = value;
                return result;
            }, arr[i]);
        });
    }
    lentil.index = index;
})(lentil || (lentil = {}));
module.exports = lentil;
