///<reference path="../node_modules/zelkova/dist/zelkova.d.ts"/>
///<reference path="../node_modules/immutable/dist/immutable.d.ts"/>
import Z = require("zelkova");
import I = require("immutable");

module lentil {
  "use strict";

  export interface Collection<K, V> extends I.Collection<K, V> {
    setIn(keyPath: Array<any>, value: V): Collection<K, V>;
    updateIn(keyPath: Array<any>, updater: (value: any) => any): Collection<K, V>;
  }

  export class Selection {

    value: any;
    _data: Collection<any, any>;
    _path: any;
    _update: any;

    constructor(data: Collection<any, any>, path: Array<any>, update) {
      this._data = data;
      this._path = path;
      this._update = update;
      this.value = path.length === 0 ? data : data.getIn(path);
    }

    set(value) {
      this._update(this._data.setIn(this._path, value));
    }

    modify(fn) {
      this._update(this._data.updateIn(this._path, fn));
    }

    select(...args) {
      return new Selection(this._data, this._path.concat(args), this._update);
    }

  }

  export class Lentil {

    signal: Z.Signal<Selection>;
    _data: Z.Signal<Collection<any, any>>;
    _path: any;
    _update: any;

    constructor(data, path, update) {
      this._data = data;
      this._path = path;
      this._update = update;
      this.signal = data
        .dropRepeats((curr, next) => I.is(curr.getIn(path), next.getIn(path)))
        .map(data => new Selection(data, path, update));
    }

    select(...args) {
      return new Lentil(this._data, this._path.concat(args), this._update);
    }

    map(fn) {
      var values = [];
      var results = [];
      return this._data.map(data => {
        return data.map((item, i) => {
          if (I.is(values[i], data.getIn(this._path.concat([i])))) {
            return results[i];
          } else {
            values[i] = data.getIn(this._path.concat([i]));
            return results[i] = fn(new Selection(data, this._path.concat([i]), this._update), i);
          }
        });
      });
    }

    join(input: Z.Signal<Collection<any, any>>): void {
      Z.subscribeN(this._data, input, (data, input) => {
        if (!I.is(data.getIn(this._path), input)) {
          this._update(data.setIn(this._path, input));
        }
      });
    }
  }

  export function create(data, update) {
    return new Lentil(data, [], update);
  };

}

export = lentil;
