# Why use control-flow annotations

Most immediate-mode UI libraries will allow the user to simply define the UI every frame:

```
if (imButtonIsClicked("Click me")) {
    count++;
}
```

But I wanted my framework to work using typical DOM nodes. 
A naive approach would be implemented something like this:
 
```
const currentChildren: HtmlElement[] = [document.body];
function imButton(text, onClick) {
    const button = currentChildren[currentChildren.length - 1].appendChild(document.createElement("button"));
    button.innerText = text;
    button.onClick = onClick;
}
```

However, recreating every single DOM node every animation frame is prohibitively expensive. 
We need some way to retain state between renders. 
Even if you're not using a retained mode API, you may encounter similar problems
    if you need to store animation state on a per-UI-element basis.

The normal way most immediate-mode frameworks approach this problem, is by using a 'key'
    or 'element id' to refer to particular elements, such that they can compare every element that rendered
    in the previous frame with every element in the current frame, and then apply a 
    'diff' to the underlying retained-mode tree structure.

```
const immediateModeCache = [];
const currentChildren: HtmlElement[] = [document.body];
function imButton(text, onClick) {
    // key on the text of the button. How convenient that this UI element has a string!
    let button = immediateModeCache[text]; 
    if (!button) {
        button = (immediateModeCache[text] = document.createElement("button"));
    }

    button.innerText = text;
    button.onClick = onClick;
}

// We'll need to give each div an identifier so that we know which one it is.
// The key will have to be 'div-' + key
imDivBegin("Button outer"); {
    imButton("increment", () => count++);
} imDivEnd("Button outer"); // <- this will trigger the diffing logic for the children of this particular div.
                            // Also, passing in the name of the div helps us throw an error if the closing thing
                            // was missing.
```

In order to save yourself from constructing all these strings at runtime all the time, 
    you could also use some sort of metaprogramming capabilities to create a compiled version
    of your program that just generates a bunch of random integer ids that get passed as the first
    argument to every immediate mode function.
I thought about doing it like this, but then decided that all of these approaches are somewhat
    flawed, for one main reason. 

If you have two stateful elements side by side with the same key:

```
if (cond1) {
    imCounter("Increment")
}
if (cond2) {
    imCounter("Increment")
}
```

If one of them were to disappear, how do you actually know 'which one' disappears?
Considering how common it is to copy-paste code, this isn't some random edge case to be paranoid about.
And if the buttons are stateful, say each increment prints the time at which it was incremented, then
    it starts to matter how our framework's reconciler was actually implemented.

I reckon there's a far simpler way - just increment an index each time you want to access immediate-mode
    state, and then use whatever was stored at that index.
Our button implementation then looks something like this:

```
const currentChildren: HtmlElement[] = [document.body];
const immediateModeState = [];
const imIdx = 0;
function imButton(text, onClick) {
    if (imIdx === immediateModeState.length) {
        immediateModeState[imIdx] = document.createElement("button");
    }
    const button = immediateModeState[imIdx]; imIdx++;
    peek(currentChildren).appendChild(button);
    button.innerText = text;
    button.onClick = onClick;
}
```

But this only works, if you request the exact same state in the exact same order. 
This works fine for code that just renders the same things in the same order, possibly in a loop:


```
for (let i = 0; i < 10; i++) {
    if (i > 0) imText(", ");
    imNumber(i);
}
```

But it completely fails as soon as we add, e.g a button below the list that controls it's length:

```
for (let i = 0; i < count; i++) {
    if (i > 0) imText(", ");
    imNumber(i);
}
count = imCounter("Increment", count);
```

As soon as the count is incremented, `imText` will simply overwrite whatever state was at that index, and
    imCounter will need to recreate itself anew. 
But we can fix this by reframing the problem. 
Rather than thinking of our component as
```
<some variable number of items>
<one counter component>
```
We can think of it like this instead:
```
<one for-loop>
<one counter component>
```

The immediate-mode state for the for-loop can just be another entry in the current immediate-mode state array!
In code, it looks - well - execatly like this:

```
im.For(); for (let i = 0; i < count; i++) {
    if (i > 0) imText(", ");
    imNumber(i);
} im.ForEnd();
count = imCounter("Increment", count);
```

A similar reframing can be done for `if` statements. 
Instead of:
```
<n items or 0 items>
<one counter component>
```
We can think of it like this instead:
```
<one conditionally rendered block>
<one counter component>
```

The problem of 'which' component's state to retain becomes non-existant:

```
if (im.If() && cond1) {
    imCounter("Increment")
} im.IfEnd()
if (im.If() && cond2) {
    imCounter("Increment")
} im.IfEnd()
```

We're effectively building a static tree of state, in an immediate-mode way. 
We actually still retain most of the benefits of writing immediate-mode code.
