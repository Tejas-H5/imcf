# Benchmarks

These benchmarks are what I use to understand the performance characteristics of the framework. 
If you can think of any other ones, do let me know!
Also I need to write some more text here so that my blogpost renderer can lay it out properly.

```ts - some boxes

const MIN_ROWS = 1;

function imMain(c: ImCache) {
    const state = im.Get(c, imMain) ?? im.Set(c, {
        rows: 5000, 
        cols: 4, 
    })

    imDivBegin(c, " "); {
        imFpsCounterSimple(c);

        imDivBegin(c, "display: flex; gap: 10px"); {
            {
                imdom.Str(c, "Rows: ");
                imdom.Str(c, state.rows);
                if (imButtonIsClicked(c, "-")) { state.rows--; }
                if (imButtonIsClicked(c, "+")) { state.rows++; }
                state.rows = Math.max(1, state.rows);
            }

            {
                imdom.Str(c, "Cols: ");
                imdom.Str(c, state.cols);
                if (imButtonIsClicked(c, "-")) { state.cols--; }
                if (imButtonIsClicked(c, "+")) { state.cols++; }
                state.cols = Math.max(1, state.cols);
            }

            imdom.Str(c, "Total squares: ");
            imdom.Str(c, state.rows * state.cols);
        } imDivEnd(c);

        imDivBegin(c, "display: flex; flex-direction: column; gap: 10px"); {
            let rowCout = 0;
            im.For(c); for (let row = 0; row < state.rows; row++) {
                rowCout++;
                imDivBegin(c, "display: flex; gap: 10px; "); {
                    im.For(c); for (let col = 0; col < state.cols; col++) {
                        imDivBegin(c, "width: 100px; height: 100px; border: 2px solid black; border-radius: 10px;"); {
                        } imDivEnd(c);
                    } im.ForEnd(c);
                } imDivEnd(c);
            } im.ForEnd(c);
        } imDivEnd(c);
    } imDivEnd(c);
}

function imDivBegin(c: ImCache, style: string) {
    const div = imdom.ElBegin(c, el.DIV);
    if (im.IsFirstRender(c)) {
        imdom.setAttr(c, "style", style + ";");
    }
    return div;
}
function imDivEnd(c: ImCache) { return imdom.ElEnd(c, el.DIV); }

```

