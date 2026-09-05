# Tutorial 0 - Immediate Mode Control Flow annotations

This page explains the fundamentals of this framework.
You'll have to read it begining-to-end to understand most of the code/examples (sorry).

## What is the `ImCache`

Every IMCF function appears to have `c: ImCache` as it's first argument.
This is where we persist state between renders.
It's really just a stack of immediate-mode blocks:

```
[item 1, item 2, item 3, item 4, .....] // root block
...
[item 1, item 2, item 3, item 4, .....]
[item 1, item 2, item 3, item 4, .....] <- current immediate-mode block
```

An immediate-mode block is just an array of state.

Every single item in a block is queried/stored using the `im.Get` and `im.Set` methods. 
An index is reset to -1 when a block opens.
Calling `im.Get` increments that index, then returns the state at that index.
Calling `im.Set` sets any state at the current index.
Blocks other than the root block are actually stored in their parent block 
    using `im.Get` and `im.Set`.

```
function imThing(c: ImCache) {
    let stateItem = im.Get(c, constructorFn);
    if (!stateItem) {
        stateItem = im.Set(c, constructorFn());
    }
    ...
}
```

The current immediate-mode block may look something like this:

```
behind the array ==============| <- immediate-mode state index start
item 1: Dom node               | <- im.Get() call 1
item 2: Dom node               | <- im.Get() call 2
item 3: Some component state   | <- im.Get() call 3
item 4: Dom node               | <- im.Get() call 4
item 5: im.For block           | <- im.Get() call 5
item 6: Dom node               | <- im.Get() call 6
item 7: im.If branch block     | <- im.Get() call 7
item 8: im.If branch block     | <- im.Get() call 8
... more items ...             | so on and so forth
```

You'll notice that `im.Get(c, typeId)` takes 2 arguments. 
This is because the real immediate-mode block array looks a bit more like this:

```
item 1 typeId
item 1 value
item 2 typeId
item 2 value
item 3 typeId
item 3 value
... more items ...
```

This allows us to provide a runtime assertion that catches misaligned gets between renders.
We're still screwed if 2 items of the same type of state are next to each other though,
    so we've got another assertion checking for a change in the number of items rendered.

<!-- As for why the typeId is a function - I didn't want to be minting a bunch of unique -->
<!--     integers all over the place.  -->
<!-- And I found that I almost always had a function in the current scope that I could -->
<!--     use to uniquely identify some piece of state. -->
<!-- The typeId's return type doesn't even need to match the state it is associated with -  -->
<!--     since it is only used to catch misaligned gets between renders, all that  -->
<!--     matters is that they are probably different to the typeIds before and after them. -->

## The rules of Immediate-Mode Control-Flow

For the code that queries the state actually work:

#list[
- Every render must get/set the items in the same order
- Every render must get/set the same number of items unless you're in an `im.For` block
]

In order to know which methods query/store immediate-mode at a glance, they 
    should start with `im`, i.e `imName`. 
If they are already on a namespace prefixed with `im`, then they should start with
    a capital letter like `imthing.Name`.

Getting/setting the same number of items every render sounds overly restrictive at first.
How will we use if-statements? For-loops?
Turns out that we can use control-flow AND abide by the rules of IMCF using 
    'control-flow annotations':

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

Control-flow annotations work, because they replace a variable number of 
    immediate-mode state with 1 immediate-mode block that may or may not render items.

In fact - only control-flow annotations will push new immediate-mode blocks to the stack.
Code like this:

```
imDivBegin(c); {
    // New block ? Actually no
} imDivEnd(c);
```

Might look like it's creating a new block but it isn't, because setting the 'parent' 
    item for a particular point in time ends up being completely orthogonal to whether 
    or not the number of items we're storing in the block is constant or not.

## In summary

#list[
- `ImCache` stores all the state between frames. Due to the way it works:
    #list[
    - Every render must get/set the items in the same order
    - Every render must get/set the same number of items unless you're in an `im.For` block
    ]
- if-statements, for-loops, switches, and try-catch statements contradict these rules
- those same control-flow constructs paired with their corresponding control-flow annotations
    do _not_ contradict these rules
]

Read this page to the end?
Congratulations - your IQ just increased by 10 points!
Now make some stuff. 
Or read the subsequent tutorials for ideas.
