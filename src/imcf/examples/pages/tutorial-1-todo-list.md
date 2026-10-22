# Tutorial 1 - a TODO List

Make sure you've read
    #url[Tutorial 0, /?test=Tutorial+0+-+Immediate+Mode+Control+Flow+annotations]
    first.

## Part 0 - getting started

Initialize a blank typescript project, with an `index.html` and an `index.ts`
    as the entrypoint, or similar.
There are a lot of ways to do this - if you don't know how, I'd suggest 
    initializing a vanilla TypeScript project with #url[Vite, https://vite.dev/guide/#scaffolding-your-first-vite-project],
    and then deleting most of the assets to get to a blank page.

#url[Install the framework, /?test=How+to+install] if you 
    haven't already

To get started, you'll need to paste this into your entrypoint:

```typescript
import { im, imdom, ImCache } from "imcf";

imdom.startAnimationLoop(document.body, imMain);

function imMain(c: ImCache) {
     // Your code here
}
```

#list[
- `im` contains the core framework primitives. This object is a namespace object, and holds no state.
- `imdom` contains the DOM-specific wrapper functions. This object is a namespace object, and holds no state.
- `ImCache` is a more or less opaque object where we'll be putting all our state
    that we reuse between renders.
- `imdom.startAnimationLoop` Sets up a render loop where you can start rendering DOM nodes. 
    The DOM node you pass in will be the root.
]


## Part 1 - getting the skeleton of the app in place

Let's get some TODO items drawing. I'll extract out a bunch of helpers for the 
    DOM elements as well:

```ts - Basic skeleton
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

function imTodoList(c: ImCache) {
    imdom.ElBegin(c, el.H3); imStr(c, "TODO List"); imdom.ElEnd(c, el.H3); 

    imDivBegin(c); {
        imStr(c, "Item 1");
    } imDivEnd(c);
    imDivBegin(c); {
        imStr(c, "Item 2");
    } imDivEnd(c);
    imDivBegin(c); {
        imStr(c, "Item 3");
    } imDivEnd(c);
}

function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

We can actually extract out this repeating thing into a TODO list item component:

```ts - Basic skeleton (refactored) #diff[-1]
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

function imTodoList(c: ImCache) {
    imdom.ElBegin(c, el.H3); imStr(c, "TODO List"); imdom.ElEnd(c, el.H3); 

    imTodoItem(c, "Item 1");
    imTodoItem(c, "Item 2");
    imTodoItem(c, "Item 2");
}

function imTodoItem(c: ImCache, name: string) {
    imDivBegin(c); {
        imStr(c, name);
    } imDivEnd(c);
}

function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

If we want to do anything with these items, we'll want to render them by iterating
actual state:

```ts - Basic skeleton (state driven) #diff[-1] #id[left-off-1]
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

const todoList = [
    "Item 1",
    "Item 2",
    "Item 3",
]

function imTodoList(c: ImCache) {
    imdom.ElBegin(c, el.H3); imStr(c, "TODO List"); imdom.ElEnd(c, el.H3); 

    for (const item of todoList) {
        imTodoItem(c, item);
    }
}

function imTodoItem(c: ImCache, name: string) {
    imDivBegin(c); {
        imStr(c, name);
    } imDivEnd(c);
}

function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

We'll come back to this.
First, I want to make a button component, so we can implement
an "Add" button that adds list items.
Let's try implementing a simple button 
component that we can use to respond to mouse clicks:

```ts - Button component
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

function imMain(c: ImCache) {
    imButton(c, "Button 1");
}

function imButton(c: ImCache, buttonText: string) {
    imdom.ElBegin(c, el.BUTTON); {
        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);
}

```

Right now, the button doesn't do anything. 
We can use another helper from `imdom` to handle the click event:

```ts - Button component, with clicking #diff[-1]
import { ImCache, Stringifyable, im, imdom, el, ev } from "imcf";

function imMain(c: ImCache) {
    imButton(c, "Button 1");
}

function imButton(c: ImCache, buttonText: string) {
    imdom.ElBegin(c, el.BUTTON); {
        const clickEvent = imdom.On(c, ev.CLICK);
        if (clickEvent) {
            clickEvent.preventDefault();
            console.log("" + clickEvent, "We clicked this button");
        }

        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);
}

```

One way to make this button reuseable is to return a boolean saying 
    whether it was clicked or not:

```ts - Button component - final (for now) #diff[-1]
import { ImCache, Stringifyable, im, imdom, el, ev } from "imcf";

function imMain(c: ImCache) {
    if (imButtonIsClicked(c, "Button 1")) {
        console.log("" + clickEvent, "We clicked this button");
    }
}

function imButtonIsClicked(c: ImCache, buttonText: string): boolean {
    let result = false;

    imdom.ElBegin(c, el.BUTTON); {
        const clickEvent = imdom.On(c, ev.CLICK);
        if (clickEvent) {
            clickEvent.preventDefault();
            result = true;
        }

        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);

    return result;
}

```

Let's use this button to implement adding items to the TODO list:

```ts - Add button  #diff[left-off-1]
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

const todoList = [
    "Item 1",
    "Item 2",
    "Item 3",
]

function imTodoList(c: ImCache) {
    imdom.ElBegin(c, el.H3); imStr(c, "TODO List"); imdom.ElEnd(c, el.H3); 

    for (const item of todoList) {
        imTodoItem(c, item);
    }

    if (imButtonIsClicked(c, "Add item")) {
        todoList.push("Item 1");
    }
}

function imTodoItem(c: ImCache, name: string) {
    imDivBegin(c); {
        imStr(c, name);
    } imDivEnd(c);
}

function imButtonIsClicked(c: ImCache, buttonText: string): boolean {
    let result = false;

    imdom.ElBegin(c, el.BUTTON); {
        const clickEvent = imdom.On(c, ev.CLICK);
        if (clickEvent) {
            clickEvent.preventDefault();
            result = true;
        }

        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);

    return result;
}

function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

Strange - you would have thought that would work, but it didn't:

```
Error: Expected div here, but got button instead - Either your begin/end pairs probably aren't lining up right, or you're conditionally rendering immediate-mode state. If it's the latter, try using im.For/im.ForEnd, im.If/im.IfEnd, im.Switch/im.SwitchEnd or im.Try/im.Catch/im.TryEnd.
```

We need to add `im.For`/`im.ForEnd` to the for-loop:


```ts - Add button - working  #diff[-2]
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

const todoList = [
    "Item 1",
    "Item 2",
    "Item 3",
]

function imTodoList(c: ImCache) {
    imdom.ElBegin(c, el.H3); imStr(c, "TODO List"); imdom.ElEnd(c, el.H3); 

    im.For(c); for (const item of todoList) {
        imTodoItem(c, item);
    } im.ForEnd(c);

    if (imButtonIsClicked(c, "Add item")) {
        todoList.push("Item " + (todoList.length + 1));
    }
}

function imTodoItem(c: ImCache, name: string) {
    imDivBegin(c); {
        imStr(c, name);
    } imDivEnd(c);
}

function imButtonIsClicked(c: ImCache, buttonText: string): boolean {
    let result = false;

    imdom.ElBegin(c, el.BUTTON); {
        const clickEvent = imdom.On(c, ev.CLICK);
        if (clickEvent) {
            clickEvent.preventDefault();
            result = true;
        }

        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);

    return result;
}

function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

If `im.For` is unfamiliar to you, you should make sure you've read 
    #url[Tutorial 0, /?test=Tutorial+0+-+Immediate+Mode+Control+Flow+annotations].

The list is useless if we can't edit the contents of each item.
We could update `imTodoItem` to take in an index, so that it can 
    edit the `i`th item in the array. 
Instead, I'll update the todo list item to be a proper object, 
    so we can pass it around by reference. 

```ts - Todo items as objects  #diff[-1]
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

function newTodoListItem(name: string): TodoListItem {
    return { name };
}

const todoList = [
    newTodoListItem("Item 1"),
    newTodoListItem("Item 2"),
    newTodoListItem("Item 3"),
]

function imTodoList(c: ImCache) {
    imdom.ElBegin(c, el.H3); imStr(c, "TODO List"); imdom.ElEnd(c, el.H3); 

    im.For(c); for (const item of todoList) {
        imTodoItem(c, item);
    } im.ForEnd(c);

    if (imButtonIsClicked(c, "Add item")) {
        const name = "Item " + (todoList.length + 1);
        todoList.push(newTodoListItem(name));
    }
}

function imTodoItem(c: ImCache, item: TodoListItem) {
    imDivBegin(c); {
        imStr(c, item.name);
    } imDivEnd(c);
}

function imButtonIsClicked(c: ImCache, buttonText: string): boolean {
    let result = false;

    imdom.ElBegin(c, el.BUTTON); {
        const clickEvent = imdom.On(c, ev.CLICK);
        if (clickEvent) {
            clickEvent.preventDefault();
            result = true;
        }

        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);

    return result;
}

function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

Rather than making an input component, I'm going to just try to make this in-place.

```ts - Editable items  #diff[-1]
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

function newTodoListItem(name: string): TodoListItem {
    return { name };
}

const todoList = [
    newTodoListItem("Item 1"),
    newTodoListItem("Item 2"),
    newTodoListItem("Item 3"),
]

function imTodoList(c: ImCache) {
    imdom.ElBegin(c, el.H3); imStr(c, "TODO List"); imdom.ElEnd(c, el.H3); 

    im.For(c); for (const item of todoList) {
        imTodoItem(c, item);
    } im.ForEnd(c);

    if (imButtonIsClicked(c, "Add item")) {
        const name = "Item " + (todoList.length + 1);
        todoList.push(newTodoListItem(name));
    }
}

function imTodoItem(c: ImCache, item: TodoListItem) {
    imDivBegin(c); {
        const input = imdom.ElBegin(c, el.INPUT).root; {
            if (im.Memo(c, item)) {
                input.value = item.name;
            }
            const inputEvent = imdom.On(c, ev.INPUT);
            if (inputEvent) {
                item.name = input.value;
            }
        } imdom.ElEnd(c, el.INPUT);
    } imDivEnd(c);
}

function imButtonIsClicked(c: ImCache, buttonText: string): boolean {
    let result = false;

    imdom.ElBegin(c, el.BUTTON); {
        const clickEvent = imdom.On(c, ev.CLICK);
        if (clickEvent) {
            clickEvent.preventDefault();
            result = true;
        }

        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);

    return result;
}

function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

We actually have no way of knowing whether it worked or not. 
I'll add a second readonly view of the TODO list next to it to validate this:

```ts - Readonly view  #diff[-1]
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

function newTodoListItem(name: string): TodoListItem {
    return { name };
}

const todoList = [
    newTodoListItem("Item 1"),
    newTodoListItem("Item 2"),
    newTodoListItem("Item 3"),
]

function imTodoList(c: ImCache) {
    imdom.ElBegin(c, el.H3); imStr(c, "TODO List"); imdom.ElEnd(c, el.H3); 

    im.For(c); for (const item of todoList) {
        imTodoItem(c, item);
    } im.ForEnd(c);
    im.For(c); for (const item of todoList) {
        imDivBegin(c); {
            imStr(c, item.name);
        } imDivEnd(c);
    } im.ForEnd(c);

    if (imButtonIsClicked(c, "Add item")) {
        const name = "Item " + (todoList.length + 1);
        todoList.push(newTodoListItem(name));
    }
}

function imTodoItem(c: ImCache, item: TodoListItem) {
    imDivBegin(c); {
        const input = imdom.ElBegin(c, el.INPUT).root; {
            if (im.Memo(c, item)) {
                input.value = item.name;
            }
            const inputEvent = imdom.On(c, ev.INPUT);
            if (inputEvent) {
                item.name = input.value;
            }
        } imdom.ElEnd(c, el.INPUT);
    } imDivEnd(c);
}

function imButtonIsClicked(c: ImCache, buttonText: string): boolean {
    let result = false;

    imdom.ElBegin(c, el.BUTTON); {
        const clickEvent = imdom.On(c, ev.CLICK);
        if (clickEvent) {
            clickEvent.preventDefault();
            result = true;
        }

        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);

    return result;
}

function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

Looks like editing the notes is working. 

#list[
- `im.Memo` will return a non-zero value whenever it's value is no longer `===` strict-equal to 
    the previous value, or when the immediate-mode block has started being
    rendered in that frame.
    It's important to only do this when the external value changes rather than 
        every single frame. If we do it every frame, we won't be able to select or type any text in
        the input.
    Though it may not always be the right choice, it is very convenient, and
        you'll be using it whenever you want to respond to changes.
- `imdom.On` subscribes to an event on the current DOM node
- `ev` is an enumeration containing contant objects for all the events.
    You can create your own objects if `ev` is not exhaustive enough.
]
We're using `im.Memo` to sync the input's value with the outside world when it changes,
    and then we're setting the value directly whenever we type into it.

Now I want the readonly list to be to the right of the items:

```ts - Readonly list on the right  #diff[-1]
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

function newTodoListItem(name: string): TodoListItem {
    return { name };
}

const todoList = [
    newTodoListItem("Item 1"),
    newTodoListItem("Item 2"),
    newTodoListItem("Item 3"),
]

function imTodoList(c: ImCache) {
    imdom.ElBegin(c, el.H3); imStr(c, "TODO List"); imdom.ElEnd(c, el.H3); 

    imDivBegin(c); {
        if (im.IsFirstRender(c)) {
            imdom.setStyle(c, "display", "flex")
            imdom.setStyle(c, "gap", "10px")
        }
        imDivBegin(c); {
            if (im.IsFirstRender(c)) {
                imdom.setStyle(c, "flex", "1")
            }
            im.For(c); for (const item of todoList) {
                imTodoItem(c, item);
            } im.ForEnd(c);
        } imDivEnd(c);
        imDivBegin(c); {
            if (im.IsFirstRender(c)) {
                imdom.setStyle(c, "flex", "1")
            }
            im.For(c); for (const item of todoList) {
                imDivBegin(c); {
                    imStr(c, item.name);
                } imDivEnd(c);
            } im.ForEnd(c);
        } imDivEnd(c);
    } imDivEnd(c);

    if (imButtonIsClicked(c, "Add item")) {
        const name = "Item " + (todoList.length + 1);
        todoList.push(newTodoListItem(name));
    }
}

function imTodoItem(c: ImCache, item: TodoListItem) {
    imDivBegin(c); {
        const input = imdom.ElBegin(c, el.INPUT).root; {
            if (im.Memo(c, item)) {
                input.value = item.name;
            }
            const inputEvent = imdom.On(c, ev.INPUT);
            if (inputEvent) {
                item.name = input.value;
            }
        } imdom.ElEnd(c, el.INPUT);
    } imDivEnd(c);
}

function imButtonIsClicked(c: ImCache, buttonText: string): boolean {
    let result = false;

    imdom.ElBegin(c, el.BUTTON); {
        const clickEvent = imdom.On(c, ev.CLICK);
        if (clickEvent) {
            clickEvent.preventDefault();
            result = true;
        }

        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);

    return result;
}

function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

I've done this using a flex row, and two flex-1 blocks:

```
=====flex-row ==========
|  flex-1   |  flex-1  |
=====flex-row ==========
```

We've also done the style setting behind `im.IsFirstRender`. 
Since setting CSS every frame is very expensive, all CSS setting should be done
    behind `im.IsFirstRender` or `im.Memo` whenever possible.

The code is a bit ugly now. 
We can clean it up, but there is actually a bigger problem. 
The TODO items that I added and updated in the previous example are gone!
I think we should start loading an saving our state from
    #url[local storage, https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage], 
    so that every example on this page from here-on can remain in-sync:

```ts - Load/save from localStorage #diff[-2]
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

function newTodoListItem(name: string): TodoListItem {
    return { name };
}

// There are other things on this page, and we don't want to collide with them
const STATE_KEY = "IMCF-Examples-Page--Tutorial-1-State";

function loadState(): State {
    const value = localStorage.getItem(STATE_KEY);
    if (value) {
        try {
            return JSON.parse(value);
        } catch(e) {
            console.error("Error loading state: ", e);
        }
    }

    return {
        todoList: [
            newTodoListItem("Item 1"),
            newTodoListItem("Item 2"),
            newTodoListItem("Item 3"),
        ]
    };
}

function saveState() {
    const value = localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

let state = loadState();

function imTodoList(c: ImCache) {
    const { todoList } = state;

    imdom.ElBegin(c, el.H3); imStr(c, "TODO List"); imdom.ElEnd(c, el.H3); 

    imDivBegin(c); {
        if (im.IsFirstRender(c)) {
            imdom.setStyle(c, "display", "flex")
            imdom.setStyle(c, "gap", "10px")
        }
        imDivBegin(c); {
            if (im.IsFirstRender(c)) {
                imdom.setStyle(c, "flex", "1")
            }
            im.For(c); for (const item of todoList) {
                imTodoItem(c, item);
            } im.ForEnd(c);
        } imDivEnd(c);
        imDivBegin(c); {
            if (im.IsFirstRender(c)) {
                imdom.setStyle(c, "flex", "1")
            }
            im.For(c); for (const item of todoList) {
                imDivBegin(c); {
                    imStr(c, item.name);
                } imDivEnd(c);
            } im.ForEnd(c);
        } imDivEnd(c);
    } imDivEnd(c);

    if (imButtonIsClicked(c, "Add item")) {
        const name = "Item " + (todoList.length + 1);
        todoList.push(newTodoListItem(name));
        saveState();
    }
}

function imTodoItem(c: ImCache, item: TodoListItem) {
    imDivBegin(c); {
        const input = imdom.ElBegin(c, el.INPUT).root; {
            if (im.Memo(c, item)) {
                input.value = item.name;
            }
            const inputEvent = imdom.On(c, ev.INPUT);
            if (inputEvent) {
                item.name = input.value;
                saveState();
            }
        } imdom.ElEnd(c, el.INPUT);
    } imDivEnd(c);
}

function imButtonIsClicked(c: ImCache, buttonText: string): boolean {
    let result = false;

    imdom.ElBegin(c, el.BUTTON); {
        const clickEvent = imdom.On(c, ev.CLICK);
        if (clickEvent) {
            clickEvent.preventDefault();
            result = true;
        }

        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);

    return result;
}

function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

Did that work? We'll only know in the next example xD. 
I think it did. 
Let's just move the 'row' to it's own component in this next
example, and see if saving/loading worked:

```ts - extract imRowBegin/imRowEnd #diff[-1]
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

function newTodoListItem(name: string): TodoListItem {
    return { name };
}

// There are other things on this page, and we don't want to collide with them
const STATE_KEY = "IMCF-Examples-Page--Tutorial-1-State";

function loadState(): State {
    const value = localStorage.getItem(STATE_KEY);
    if (value) {
        try {
            return JSON.parse(value);
        } catch(e) {
            console.error("Error loading state: ", e);
        }
    }

    return {
        todoList: [
            newTodoListItem("Item 1"),
            newTodoListItem("Item 2"),
            newTodoListItem("Item 3"),
        ]
    };
}

function saveState() {
    const value = localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

let state = loadState();

function imTodoList(c: ImCache) {
    const { todoList } = state;

    imdom.ElBegin(c, el.H3); imStr(c, "TODO List"); imdom.ElEnd(c, el.H3); 

    imRowBegin(c); {
        imDivBegin(c); imFlex1(c); {
            im.For(c); for (const item of todoList) {
                imTodoItem(c, item);
            } im.ForEnd(c);
        } imDivEnd(c);
        imDivBegin(c); imFlex1(c); {
            im.For(c); for (const item of todoList) {
                imDivBegin(c); {
                    imStr(c, item.name);
                } imDivEnd(c);
            } im.ForEnd(c);
        } imDivEnd(c);
    } imRowEnd(c);

    if (imButtonIsClicked(c, "Add item")) {
        const name = "Item " + (todoList.length + 1);
        todoList.push(newTodoListItem(name));
        saveState();
    }
}

function imTodoItem(c: ImCache, item: TodoListItem) {
    imDivBegin(c); {
        const input = imdom.ElBegin(c, el.INPUT).root; {
            if (im.Memo(c, item)) {
                input.value = item.name;
            }
            const inputEvent = imdom.On(c, ev.INPUT);
            if (inputEvent) {
                item.name = input.value;
                saveState();
            }
        } imdom.ElEnd(c, el.INPUT);
    } imDivEnd(c);
}

function imButtonIsClicked(c: ImCache, buttonText: string): boolean {
    let result = false;

    imdom.ElBegin(c, el.BUTTON); {
        const clickEvent = imdom.On(c, ev.CLICK);
        if (clickEvent) {
            clickEvent.preventDefault();
            result = true;
        }

        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);

    return result;
}

function imFlex1(c: ImCache) {
    if (im.IsFirstRender(c)) {
        imdom.setStyle(c, "flex", "1");
    }
}
function imRowBegin(c: ImCache) {
    const result = imDivBegin(c);
    if (im.IsFirstRender(c)) {
        imdom.setStyle(c, "display", "flex")
        // the flex-direction is row by default
        imdom.setStyle(c, "gap", "10px")
    }

    return result;
}
const imRowEnd = imDivEnd;

function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

We've extracted out our row into an `imRowBegin`/`imRowEnd` abstraction, and
    we've also made an `imFlex1` styling thing, anticipating that we
    will need them later. 
You may have heard somewhere that you need to wait for 3 instances of a thing
    before you pull it out to it's own method, but this 
    #url[youtube video, https://www.youtube.com/watch?v=2OMRWPOSw9s] I saw
    recently has convinced me otherwise - 1 is enough, if you think you're onto something.

The loading/saving also appears to be working, but the state doesn't stay in sync between 
    examples.
There are a lot of ways to fix this, but I'm just going to emit a custom event
    with the new state and the other examples can pull it in.

```ts - save event #diff[-1]
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

function newTodoListItem(name: string): TodoListItem {
    return { name };
}

// There are other things on this page, and we don't want to collide with them
const STATE_KEY = "IMCF-Examples-Page--Tutorial-1-State";

function loadState(): State {
    const value = localStorage.getItem(STATE_KEY);
    if (value) {
        try {
            return JSON.parse(value);
        } catch(e) {
            console.error("Error loading state: ", e);
        }
    }

    return {
        todoList: [
            newTodoListItem("Item 1"),
            newTodoListItem("Item 2"),
            newTodoListItem("Item 3"),
        ]
    };
}

function saveState() {
    const value = localStorage.setItem(STATE_KEY, JSON.stringify(state));
    const stateSavedEvent = new CustomEvent("stateSaved", { detail: state })
    document.dispatchEvent(stateSavedEvent);
}

let state = loadState();
document.addEventListener("stateSaved", e => {
    state = e.detail;
})

function imTodoList(c: ImCache) {
    const { todoList } = state;

    imdom.ElBegin(c, el.H3); imStr(c, "TODO List"); imdom.ElEnd(c, el.H3); 

    imRowBegin(c); {
        imDivBegin(c); imFlex1(c); {
            im.For(c); for (const item of todoList) {
                imTodoItem(c, item);
            } im.ForEnd(c);
        } imDivEnd(c);
        imDivBegin(c); imFlex1(c); {
            im.For(c); for (const item of todoList) {
                imDivBegin(c); {
                    imStr(c, item.name);
                } imDivEnd(c);
            } im.ForEnd(c);
        } imDivEnd(c);
    } imRowEnd(c);

    if (imButtonIsClicked(c, "Add item")) {
        const name = "Item " + (todoList.length + 1);
        todoList.push(newTodoListItem(name));
        saveState();
    }
}

function imTodoItem(c: ImCache, item: TodoListItem) {
    imDivBegin(c); {
        const input = imdom.ElBegin(c, el.INPUT).root; {
            if (im.Memo(c, item)) {
                input.value = item.name;
            }
            const inputEvent = imdom.On(c, ev.INPUT);
            if (inputEvent) {
                item.name = input.value;
                saveState();
            }
        } imdom.ElEnd(c, el.INPUT);
    } imDivEnd(c);
}

function imButtonIsClicked(c: ImCache, buttonText: string): boolean {
    let result = false;

    imdom.ElBegin(c, el.BUTTON); {
        const clickEvent = imdom.On(c, ev.CLICK);
        if (clickEvent) {
            clickEvent.preventDefault();
            result = true;
        }

        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);

    return result;
}

function imFlex1(c: ImCache) {
    if (im.IsFirstRender(c)) {
        imdom.setStyle(c, "flex", "1");
    }
}
function imRowBegin(c: ImCache) {
    const result = imDivBegin(c);
    if (im.IsFirstRender(c)) {
        imdom.setStyle(c, "display", "flex")
        // the flex-direction is row by default
        imdom.setStyle(c, "gap", "10px")
    }

    return result;
}
const imRowEnd = imDivEnd;

function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

As usual, we won't know if it worked till the next example. 
In the meantime, there is one final feature our TODO list needs
in order to be feature-complete. 
That is, a way to complete tasks. 
I'm thinking we just put a chechbox to the left of the items.
A series of items next to each other, seperated by a gap? 
Sounds a lot like that row thing we made earlier.

```ts - Complete tasks #diff[-1]
import { ImCache, Stringifyable, im, imdom, el } from "imcf";

function newTodoListItem(name: string): TodoListItem {
    return { 
        name,
        done: false,
    };
}

// There are other things on this page, and we don't want to collide with them
const STATE_KEY = "IMCF-Examples-Page--Tutorial-1-State";

function loadState(): State {
    const value = localStorage.getItem(STATE_KEY);
    if (value) {
        try {
            return JSON.parse(value);
        } catch(e) {
            console.error("Error loading state: ", e);
        }
    }

    return {
        todoList: [
            newTodoListItem("Item 1"),
            newTodoListItem("Item 2"),
            newTodoListItem("Item 3"),
        ]
    };
}

function saveState() {
    const value = localStorage.setItem(STATE_KEY, JSON.stringify(state));
    const stateSavedEvent = new CustomEvent("stateSaved", { detail: state })
    document.dispatchEvent(stateSavedEvent);
}

let state = loadState();
document.addEventListener("stateSaved", e => {
    state = e.detail;
})

function imTodoList(c: ImCache) {
    const { todoList } = state;

    imRowBegin(c); {
        imDivBegin(c); imFlex1(c); {
            imHeading(c, "TODO list");
            im.For(c); for (const item of todoList) {
                imTodoItem(c, item);
            } im.ForEnd(c);
        } imDivEnd(c);
        imDivBegin(c); imFlex1(c); {
            imHeading(c, "Remaining items");
            im.For(c); for (const item of todoList) {
                if (item.done) continue;
                imDivBegin(c); {
                    imStr(c, item.name);
                } imDivEnd(c);
            } im.ForEnd(c);
        } imDivEnd(c);
    } imRowEnd(c);

    if (imButtonIsClicked(c, "Add item")) {
        const name = "Item " + (todoList.length + 1);
        todoList.push(newTodoListItem(name));
        saveState();
    }
}

function imTodoItem(c: ImCache, item: TodoListItem) {
    imRowBegin(c); {
        const doneInput = imdom.ElBegin(c, el.INPUT).root; {
            if (im.IsFirstRender(c)) {
                imdom.setAttr(c, "type", "checkbox");
            }

            if (im.Memo(c, item)) {
                doneInput.checked = item.done;
            }

            const inputEvent = imdom.On(c, ev.INPUT);
            if (inputEvent) {
                item.done = !item.done;
                saveState();
            }
        } imdom.ElEnd(c, el.INPUT);

        const nameInput = imdom.ElBegin(c, el.INPUT).root; {
            if (im.Memo(c, item)) {
                nameInput.value = item.name;
            }
            const inputEvent = imdom.On(c, ev.INPUT);
            if (inputEvent) {
                item.name = nameInput.value;
                saveState();
            }
        } imdom.ElEnd(c, el.INPUT);
    } imRowEnd(c);
}

function imButtonIsClicked(c: ImCache, buttonText: string): boolean {
    let result = false;

    imdom.ElBegin(c, el.BUTTON); {
        const clickEvent = imdom.On(c, ev.CLICK);
        if (clickEvent) {
            clickEvent.preventDefault();
            result = true;
        }

        imStr(c, buttonText);
    } imdom.ElEnd(c, el.BUTTON);

    return result;
}

function imFlex1(c: ImCache) {
    if (im.IsFirstRender(c)) {
        imdom.setStyle(c, "flex", "1");
    }
}
function imRowBegin(c: ImCache) {
    const result = imDivBegin(c);
    if (im.IsFirstRender(c)) {
        imdom.setStyle(c, "display", "flex")
        // the flex-direction is row by default
        imdom.setStyle(c, "gap", "10px")
    }

    return result;
}
const imRowEnd = imDivEnd;

function imHeading(c: ImCache, text: string) {
    imdom.ElBegin(c, el.H3); imStr(c, text); imdom.ElEnd(c, el.H3); 
}
function imDivBegin(c: ImCache) { return imdom.ElBegin(c, el.DIV); }
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }
function imStr(c: ImCache, val: Stringifyable) { return imdom.Str(c, val); }
```

## Summary

That is about all the work we are going to do on this TODO list. 
The goal was not to end up with a working TODO list that you can 
    sell as a B2B SAAS service.
If it were, we would be looking at deleting items, undo/redo, time tracking,
    analytics, deploying this to the internet, etc.

Instead, you should now be familiar with:
#list[
- The basics of `im`, `imdom`, and how to use them to build web things
- How to extract and reuse functionality
- How to use `im.IsFirstRender` 
]
