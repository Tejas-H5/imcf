# Immediate-Mode Javascript framework (Check it out [here](https://tejas-h5.github.io/imjs/))

[![Test, build, deploy](https://github.com/Tejas-H5/imjs/actions/workflows/github-workflows.yaml/badge.svg?branch=main)](https://github.com/Tejas-H5/imjs/actions/workflows/github-workflows.yaml)

`imJS` is an immediate-mode UI framework that rerenders your UI at your monitor's refresh-rate
    with `requestAnimationFrame`!
Surprisingly, it works.
The page linked above explains the framework in detail, along with how it works 
    and provides a couple of tutorials for how to use it.

```ts
import { im, imdom, el, ImCache } from "im-js";

imdom.startAnimationLoop(document.body, imMain);

function formatTime(now: Date) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function imMain(c: ImCache) {
    const now = new Date();

    imdom.ElBegin(c, el.DIV); {
        imdom.ElBegin(c, el.DIV); {
            const hours = now.getHours();
            if (im.If(c) && now.getHours() < 12) {
                imdom.Str(c, "Good morning!");
            } else if (im.ElseIf(c) && now.getHours() < 6) {
                imdom.Str(c, "Good afternoon!");
            } else {
                im.Else(c);
                imdom.Str(c, "Good evening!");
            } im.IfEnd(c);
        } imdom.ElEnd(c, el.DIV);
        imdom.ElBegin(c, el.DIV); {
            imdom.Str(c, "The time is ")
            imdom.StrFmt(c, now, formatTime);
        } imdom.ElEnd(c, el.DIV);
    } imdom.ElEnd(c, el.DIV);
}
```
