module lentil {
  "use strict";

  export class Store<A, B> {

    set: (value: A) => B;
    value: A;

    constructor(set: (value: A) => B, value: A) {
      this.set = set;
      this.value = value;
    }
  }

  /**
   * A partial lens.
   *
   * `A` is the type of the value and `B` is the type of the "field" the lens is
   * referring to - "field" does not necessarily refer to the property of an
   * object, it may also be an array index, or infact anything that there
   * is a bijection for.
   */
  export class PLens<A, B> {

    private run: (a: A) => Store<B, A>;

    constructor(run: (a: A) => Store<B, A>) {
      this.run = run;
    }

    compose<C>(that: PLens<C, A>): PLens<C, B> {
      return new PLens<C, B>(c => {
        var x = that.run(c);
        if (x == null || x.value == null) return null;
        var y = this.run(x.value);
        return y == null ? null : new Store<B, C>(b => x.set(y.set(b)), y.value);
      });
    }

    then<C>(that: PLens<B, C>): PLens<A, C> {
      return that.compose(this);
    }

    get(a: A, or?: B): B {
      var s = this.run(a);
      return s && s.value != null ? s.value : or;
    }

    set(a: A, b: B, or?: A): A {
      var s = this.run(a);
      var result = s ? s.set(b) : null;
      return result != null ? result : or;
    }

    modify(a: A, map: (b: B) => B, or?: A): A {
      var s = this.run(a);
      var result = s ? s.set(map(s.value)) : null;
      return result != null ? result : or;
    }
  }

  /**
   * Create a `PLens` from a getter and setter function. The setter should not
   * mutate the original object, but instead return a new value with the
   * updated field.
   */
  export function plens<A, B>(get: (value: A) => B, set: (value: A, b: B) => A): PLens<A, B> {
    return new PLens<A, B>(a => {
      return a == null ? null : new Store<B, A>(b => set(a, b), get(a));
    });
  }

  /**
   * Interface for things that look and (hopefully) behave like an anonymous
   * object.
   */
  export interface ObjLike {
    [key: string]: any;
  }

  /**
   * Shallow-copy an object, used when setting with a `prop`-created `PLens`.
   */
  function clone(obj: ObjLike): ObjLike {
    var result: ObjLike = {};
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
  export function prop<A>(name: string): PLens<ObjLike, A> {
    return new PLens<ObjLike, A>(obj => {
      return new Store<A, ObjLike>(value => {
        var result = clone(obj);
        result[name] = value;
        return result;
      }, obj[name]);
    });
  }

  /**
   * Interface for things that look and (hopefully) behave like an array.
   */
  export interface ArrayLike {
    [key: number]: any;
    slice(): ArrayLike;
  }

  /**
   * Create a `PLens` for an index of an array.
   */
  export function index<A>(i: number): PLens<ArrayLike, A> {
    return new PLens<ArrayLike, A>(arr => {
      return new Store<A, ArrayLike>(value => {
        var result = arr.slice();
        result[i] = value;
        return result;
      }, arr[i]);
    });
  }
}

export = lentil;
