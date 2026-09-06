# Tutorial 0 - Control Flow annotations

Our framework reuses state between renders by putting it into an immediate-mode array.

```
item 1 | item 2 | item 3 | item 4 | ............
^-- The current state index
```

All functions named `imBlah(c: ImCache, ...)` will eventually 
    get/set state in the array by calling `im.Get` and `im.Set`.

#list[
- `im.Get` will increment the 'current state index', then return the state that 
    was saved there
- `im.Set` will overwrite whatever state is at the current index
]

```
function imExample(c: ImCache) {
    const domNode = im.Get(c, document.createElement);
    if (!domNode) {
        domNode = im.Set(c, document.createElement("div"));
    }
    ...
}
```
This won't work if calls to `im.Get` are behind if-statements or for-loop iterations. 
If an if-statement becomes `true` or a for-loop starts iterating more items
    the next render, subsequent calls to `im.Get` will be referring to the wrong state.
You'll notice that `im.Get(c, typeId)` takes two parameters. 
It will not actually invoke your constructor function - rather, we use this to check
    for these misalignments and throw an error.

Does this mean we can't use control-flow in our programs?

## Control-Flow annotations

The way to get around this is by getting/setting another immediate-mode array inside the
    previous one whenever we arrive at control-flow, like conditional rendering or loops. 
The `ImCache` is actually just a stack of immediate-mode arrays:

```
- immediate-mode array 0 ------------------------------
[items.....] 
DOM node | DOM node | user state | for-loop | other state from previous render...
                                 ^--- idx
- for-loop --------------------------------------------
[items.....] 
DOM node | if-true-branch | if-false-branch | other state from previous render...
                          ^--- idx
- if-false-branch -------------------------------------
DOM node | other state from previous render...
^--- idx
```

We've turned 0-n state entries into 1 state entry pointing to another array.
We tell the framework to do this by using control-flow annotations.

#list[
- Use `im.If`/`im.IfElse`/`im.IfEnd` for if-statements:

```ts - if statements
function imMain(c: ImCache) {
    const hour = (new Date()).getSeconds() % 3;
    if (im.If(c) && hour === 0) {
        imdom.Str(c, "area 1");
    } else if (im.ElseIf(c) && hour === 1) {
        imdom.Str(c, "area 2");
    } else {
        im.Else(c);
        imdom.Str(c, "area 3");
    } im.IfEnd(c);
}
```

- Use `im.Switch`/`im.SwitchEnd` for switches:

```ts - switch statements
function imMain(c: ImCache) {
    const hour = (new Date()).getSeconds() % 3;
    im.Switch(c, hour); switch(hour) {
    case 0: imdom.Str(c, "area 1"); break;
    case 1: imdom.Str(c, "area 2"); break;
    case 2: imdom.Str(c, "area 3"); break;
    } im.SwitchEnd(c);
}
```

- Use `im.For`/`im.ForEnd` for loops:

```ts - for loops
function imMain(c: ImCache) {
    im.For(c); for(let i = 0; i < 10; i++) {
        if (i > 0) imdom.Str(c, ", ");
        imdom.Str(c, i);
    } im.ForEnd(c);
}
```

Notice how here we can technically do `if (i > 0)` without needing `im.If` - due to a 
    loop's repeating nature, you will still be querying the same immediate-mode state in the
    same order.

`im.For` can be used for any kind of iteration, not specifically for-loops like the name may suggest:

```ts - any iteration
function imMain(c: ImCache) {
    im.For(c); iter(0, 5, (i, isNotFirst) => {
        if (isNotFirst) imdom.Str(c, ", ");
        imdom.Str(c, i);
    }); im.ForEnd(c);
}
function iter(start: number, end: number, fn: Predicate) {
    let isNotFirst = false;
    for (let i = start; i < end; i++) {
        fn(i, isNotFirst);
        isNotFirst = true;
    }

    for (let i = start * 2; i < end * 2; i++) {
        fn(i, isNotFirst);
        isNotFirst = true;
    }
}
```
- Use `im.Try`/`im.Catch`/`im.TryEnd` for try/catch statements:

```ts - try-catch statements
function imMain(c: ImCache) {
    const tryCatch = im.Try(c); try {
        const { err, recover } = tryCatch;
        if (im.If(c) && err) {
            imdom.Str(c, "An error occured: ");
            imdom.Str(c, err);
        } else {
            im.IfElse(c);
            imdom.Str(c, "HOW are you seeing this");
            throw new Error("Some error here");
        } im.IfEnd(c);
    } catch(e) {
        im.Catch(c, tryCatch, e);
        // You cant actually render things in this region unless
        // you recover and throw an exception every frame.
        // Use an if-statement approach in the try {} block instead.:
    } im.TryEnd(c, tryCatch);
}
```
]

You should remember to use control-flow annotations if you need to do 
    conditional or list-based rendering of immediate-mode state.

## Done

Read this page to the end?
Congratulations - your IQ just increased by 10 points!
Now make some stuff. 
Or read the subsequent tutorials for ideas.
