# Immediate Mode Control-Flow (Check it out [here](https://tejas-h5.github.io/imjs/))

The Immediate Mode Control-Flow (`imcf`) framework provides a thin immediate-mode 
    layer over the DOM. 
The core immediate-mode utilities can be reused to create similar wrappers over any 
    retained more tree structure. 
Most immediate-mode frameworks opt to use IDs or keys to allow the framework to 
    identify the same element between frames, but I've opted for a control-flow 
    annotation approach instead.

[![Test, build, deploy](https://github.com/Tejas-H5/imjs/actions/workflows/github-workflows.yaml/badge.svg?branch=main)](https://github.com/Tejas-H5/imjs/actions/workflows/github-workflows.yaml)

`imcf` sits between the DOM and your code to rerender your UI at your monitor's 
    refresh-rate with `requestAnimationFrame`!

Surprisingly, it works, and it's simpler than you might think.
[This page](https://tejas-h5.github.io/imjs/) explains the framework in detail, 
    and provides lots of example code and tutorials for how to use it.

```ts
import { im, imdom, el, ImCache } from "imcf";

imdom.startAnimationLoop(document.body, imMain);

function imMain(c: ImCache) {
    const now = new Date();

    imDivBegin(); {
        imDivBegin(); {
            const hours = now.getHours();
            if (im.If(c) && now.getHours() < 12) {
                imStr(c, "Good morning!");
            } else if (im.ElseIf(c) && now.getHours() < 6) {
                imStr(c, "Good afternoon!");
            } else {
                im.Else(c);
                imStr(c, "Good evening!");
            } im.IfEnd(c);
        } imDivEnd(c);
        imDivBegin(); {
            imStr(c, "The time is ")
            imStrFmt(c, formatTime(now));
        } imDivEnd(c);
    } imDivEnd(c);
}

function imDivBegin(c: ImCache) { return imDivBegin(); }
function imDivEnd(c: ImCache)   { imdom.ElEnd(c, el.DIV); }
function imStr(c, str: Stringifyable) { imdom.Str(c, str); };

function formatTime(now: Date) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}
```
