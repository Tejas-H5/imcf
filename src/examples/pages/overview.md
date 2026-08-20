# imJS - Overview

`imJS` is an immediate-mode UI framework that rerenders your UI at your monitor's 
    refresh-rate with `requestAnimationFrame`!
Surprisingly, it works.
It's a bit overkill for a documentation page like this one, but I'm somewhat obliged
    to use it here anyway, aren't I?
As far as I know, this is a 'new' approach specifically in the web word.
Or at least, most other web frameworks that have become widely used in industry
#url[don't work like this., https://youtu.be/0C-y59betmY]

<!-- ## Is it still work trying this UI framework now that AI can oneshot any React component? -->
<!---->
<!-- Point your AI at this framework, and ask -->
<!-- Probably no point in this part, because that is what the AI users would do anyway, if they even found this page that is -->

## Why make another JavaScript UI framework?

I have found state management to be a total pain in most web frameworks.
It seems like a small problem, but I think it's _the_ fundamental problem that underpins
    all of frontend.
I have yet to see a framework that:
#list[
- Allows state to be stored as locally to a piece of UI/DOM as required
- Allows state to be easily moved closer into a UI as needed
- Allows state to be easily hoisted higher, even made global, as needed
- Allows for trivial integration with state inside third-party libraries
- Allows all intangible state, like the current date/time, to be  
    'observed' simply and adequately by all UI that might need it
]

It's a difficult problem to solve in a conventional way. 
Rather than solve it, JavaScript has gotten fast enough that it's actually possible 
    to completely ignore it altogether.
By rerendering your component at the Monitor's refresh rate, you have actually 
    solved state managemnt completely.
We no longer need a custom event lifecycle that notifies the framework
    of when it's state changes. 
Rather, all state can live in whatever objects/datastructures/variables we want,
    and we read it from wherever we think is most appropraite for it to be.

## What does it look like?

The code reads a lot like if a React functional component were imperatively rendered.
The render method will always be _synchronous_ (non-`async`), and it will rerender the entire UI from
    top to bottom in a single pass:

```ts - The time

import { im, imdom, el, ImCache } from "im-js";

// You would put this in your entry point, but I've commented
// this out for this example runner.
// imdom.startAnimationLoop(document.body, imMain);

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

I have found that a lot of other benefits fall out of the usage code being way that it is:

#list[
- Extracting reuseable components/logic is the exact same as extracting out functions
- It is much easer to colocate the vast majority of styling logic directly in the code itself
- list elements can be created inline, without needing to extract out a separate component
- UI can coordinate with each other accross the entire app in a deterministic manner via global
    or global-ish state objects
- Bespoke interactions/animations/UI become a lot easier and lower-friction to introduce.
    Whare the thought process was previously "that idea is too insane to implement
    and adds too much architectural overhead let's not bother" to
    "We're already in an animation loop, let's make use of it :D"
- The render pass can be breakpointed and stepped through
- Hitting a breakpoint and inspecting the callstack will showed you where in the 
    component heirarchy you are
- The browser's profiler output will actually be useful
]

It's not all sunshine and rainbows:

#list[
- The unique way I (ab)use code blocks and placing multiple statements on the same
    line for cooler looking code means that I can't use `Prettier` like usual.
    I just use the default `TypeScript` one, as that doesn't mess with newlines.
- If you're used to JSX, it will be a pain to type out at first. 
- Conditional rendering/control flow of any kind must adhere to certain 
    simple and easy to remember yet unusual rules (explained more in 
    #url[Tutorial 1, /?test=Tutorial+1+-+a+TODO+List])
]

If you don't have motion sickness, tap the example below to un-pause it.
It shows off most of the functionality of this framework - state management, 
    conditional rendering, list rendering, and animation:

```ts - you will try imjs ... you will try imj - hey dont look away

// <------- You can drag this middle thing to resize it btw

const subliminalMessage = "you will try imjs"

function imGalaxyOfDivs(c: ImCache) {
    if (im.IsFirstRender(c)) {
        imdom.setStyle(c, "overflow", "hidden");
    }

    const state = im.GetInline(c, imGalaxyOfDivs) ??
        im.Set(c, { paused: true });

    if (imdom.hasMousePress(c)) {
        // Notice how we did not do setState({...state, paused: !state.paused}) here. 
        // Isn't that just amazing or what? The bar is that low...
        state.paused = !state.paused;
    }

    // This one will cause the CPU fan to start spinning, so we shouldn't ever
    // run it when we're not looking directly at it.
    const visible = imdom.TrackVisibility(c, 0).isVisible;
    if (im.If(c) && visible) {
        imdom.ElBegin(c, el.DIV); {
            const numArms    = 5;

            if (im.IsFirstRender(c)) {
                imdom.setStyle(c, "position", "relative");
                imdom.setStyle(c, "width", "100%");
                imdom.setStyle(c, "height", "100%");
            }

            imdom.ElBegin(c, el.DIV); {
                if (im.IsFirstRender(c)) {
                    imdom.setStyle(c, "zIndex", "100");
                    imdom.setStyle(c, "backgroundColor", "black");
                    imdom.setStyle(c, "color", "white");
                    imdom.setStyle(c, "position", "absolute");
                    imdom.setStyle(c, "top", "0");
                    imdom.setStyle(c, "left", "0");
                }

                const fpsRingbuffer = im.State(c, newRingBuffer);
                pushValue(fpsRingbuffer, im.getFpsCounterState(c).frameMs);

                imdom.Str(c, Math.floor(1000 / getAverage(fpsRingbuffer.values)));
                imdom.Str(c, " fps");
            } imdom.ElEnd(c, el.DIV);

            imdom.ElBegin(c, el.DIV); {
                if (im.IsFirstRender(c)) {
                    imdom.setStyle(c, "backgroundColor", "transparent");
                    imdom.setStyle(c, "height", "100%");
                    imdom.setStyle(c, "transform", "translate(50%, 50%)");
                }

                const anim = im.GetInline(c, imGalaxyOfDivs) ??
                    im.Set(c, { t: 0,  });

                if (!state.paused) {
                    anim.t += im.getDeltaTimeSeconds(c);
                    if (anim.t > 2 * Math.PI) {
                        anim.t -= 2 * Math.PI;
                    }
                }

                im.For(c); for (let armIdx = 0; armIdx < numArms; armIdx++) {
                    let angleOffset = (armIdx / numArms) * 2 * Math.PI + anim.t;
                    let tMult = 1;

                    const numSquares = subliminalMessage.length * 3;
                    im.For(c); for (let squareIdx = 0; squareIdx < numSquares; squareIdx++) {
                        let angle = tMult * (squareIdx / numSquares) * 2 * Math.PI + anim.t;
                        if (angle > 2 * Math.PI) {
                            angle -= 2 * Math.PI;
                        }

                        const size = 10 * angle;
                        const positionOffset = 60;

                        const x = positionOffset * Math.cos(angle + angleOffset) * angle;
                        const y = positionOffset * Math.sin(angle + angleOffset) * angle;

                        let opacity = 1;
                        let padAngle = 1;
                        if (angle < padAngle) {
                            opacity = angle / padAngle;
                        } else {
                            let angleFromTheBack = 2 * Math.PI - angle;
                            if (angleFromTheBack < padAngle) {
                                opacity = angleFromTheBack / padAngle;
                            }
                        }

                        const letter = subliminalMessage[squareIdx % subliminalMessage.length];
                        imSquareLetter(c, x, y, size, opacity, letter);
                    } im.ForEnd(c);
                } im.ForEnd(c);
            } imdom.ElEnd(c, el.DIV);
        } imdom.ElEnd(c, el.DIV);
    } im.IfEnd(c)
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function newRingBuffer(): RingBuffer {
    return {
        // dont cheat the benchmark by filling with 0ms
        values: Array(100).fill(10000),
        i: 0,
    };
}

function pushValue(rb: RingBuffer, value: number) {
    rb.values[rb.i] = value;
    rb.i = (rb.i + 1) % rb.values.length;
}

function getAverage(values: Array<number>) {
    let n = 0;
    for (const val of values) {
        n += val;
    }
    return n / values.length;
}


function imSquareLetter(
    c: ImCache,
    x: number, y: number,
    size: number,
    opacity: number,
    letter: string
) {
    // flooring to, the values change way less frequently.
    // Only chrome macbook retina HDR users shall notice.
    x = Math.floor(x);
    y = Math.floor(y);
    size = Math.floor(size);
    opacity = Math.floor(opacity * 255) / 255;

    if (im.If(c) && opacity > 0.01) {
        imdom.ElBegin(c, el.DIV); {
            if (im.IsFirstRender(c)) {
                imdom.setStyle(c, "position", "absolute");
                imdom.setStyle(c, "transform", "translate(50%, 50%)")
                imdom.setStyle(c, "fontWeight", "bold")
                // Does literally nothing what the heck
                imdom.setStyle(c, "textRendering", "optimizeSpeed")
            }

            if (im.Memo(c, size))    { imdom.setStyle(c, "fontSize", 18 + size + "px"); }
            if (im.Memo(c, x))       { imdom.setStyle(c, "top", x + "px"); }
            if (im.Memo(c, y))       { imdom.setStyle(c, "left", y + "px"); }
            if (im.Memo(c, opacity)) { imdom.setStyle(c, "opacity", "" + opacity); }

            imdom.Str(c, letter);
        } imdom.ElEnd(c, el.DIV);
    } im.IfEnd(c);
}


```

That example was probably making your computer fan spin a little.
It's way more taxing than most UIs will ever be though, since
    the opacity and position of every element is changing every render.
If you profile this page while the example is running, you'll find that the most expensive 
    methods are actually the calls to the DOM API's own style setters, as opposed 
    to data-manipulations done in this framework.

If the code examples haven't put you off the framework by now, then great!
Here's how you #url[get set up, /?test=How+to+install+imJS].

I've also got tutorials on the page!
You can see all the pages by mousing over the strange rectangle thing
hovering on the center-left.

## Production usage

Other than all the stuff I make for myself (mostly unremarkable and unknown stuff for now),
    there are no production users. 
We are venturing off the beaten path.
Raise issues on #url[this GitHub repository, https://github.com/Tejas-H5/imjs] as needed.
