declare module 'lentil' {
    class Store<A, B> {
        set: (value: A) => B;
        value: A;
        constructor(set: (value: A) => B, value: A);
    }
    /**
     * A partial lens.
     *
     * `A` is the type of the value and `B` is the type of the "field" the lens is
     * referring to - "field" does not necessarily refer to the property of an
     * object, it may also be an array index, or infact anything that there
     * is a bijection for.
     */
    class PLens<A, B> {
        private run;
        constructor(run: (a: A) => Store<B, A>);
        compose<C>(that: PLens<C, A>): PLens<C, B>;
        then<C>(that: PLens<B, C>): PLens<A, C>;
        get(a: A, or?: B): B;
        set(a: A, b: B, or?: A): A;
        modify(a: A, map: (b: B) => B, or?: A): A;
    }
    /**
     * Create a `PLens` from a getter and setter function. The setter should not
     * mutate the original object, but instead return a new value with the
     * updated field.
     */
    function plens<A, B>(get: (value: A) => B, set: (value: A, b: B) => A): PLens<A, B>;
    /**
     * Interface for things that look and (hopefully) behave like an anonymous
     * object.
     */
    interface ObjLike {
        [key: string]: any;
    }
    /**
     * Create a `PLens` for a property of an anonymous object.
     */
    function prop<A>(name: string): PLens<ObjLike, A>;
    /**
     * Interface for things that look and (hopefully) behave like an array.
     */
    interface ArrayLike {
        [key: number]: any;
        slice(): ArrayLike;
    }
    /**
     * Create a `PLens` for an index of an array.
     */
    function index<A>(i: number): PLens<ArrayLike, A>;
}

