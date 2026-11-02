import { el, im, ImCache, ImCacheRerenderFn, imdom } from "imcf";
import { BLOCK, imui } from "imcf/im-ui";
import { imButtonIsClicked } from "imcf/im-ui/components/button";
import { imFpsCounterSimple } from "imcf/im-ui/components/fps-counter";

export function imBenchmarkRunner(
    c: ImCache,
    fn: (c: ImCache, ...args: any[]) => void,
    ...args: any[]
) {
    imFpsCounterSimple(c);

    const state = im.Get(c, imBenchmarkRunner) ?? im.Set(c, {
        reportView: true,
        running: false,
        result: newBenchmarkResult(),
    });

    if (imButtonIsClicked(c, state.reportView ? "UI View" : "Report View", !state.reportView)) {
        state.reportView = !state.reportView;
    }

    if (im.If(c) && state.reportView) {
        const root = imdom.ElBegin(c, el.DIV); imdom.ElEnd(c, el.DIV);

        if (imButtonIsClicked(c, "Run benchmark")) {
            state.running = true;
            setTimeout(() => {
                state.result = runBenchmark(fn, root.root, ...args);
                state.running = false;
            }, 10);
        }

        if (im.If(c) && state.running) {
            imdom.Str(c, "Running...");
        } else {
            im.IfElse(c);
            imui.Begin(c, BLOCK); {
                imdom.Str(c, "Cold time: "); imdom.Str(c, state.result.coldTimeMs);
            } imui.End(c);
            imui.Begin(c, BLOCK); {
                imdom.Str(c, "Warm time: "); imdom.Str(c, state.result.warmTimeMs);
            } imui.End(c);
        } im.IfEnd(c);
    } else {
        im.IfElse(c);

        fn(c, ...args);
    } im.IfEnd(c);
}

type BenchmarkResult = {
    coldTimeMs: number;
    warmTimeMs: number;
};

function newBenchmarkResult(): BenchmarkResult {
    return { coldTimeMs: 0, warmTimeMs: 0 };
}

function runBenchmark(
    fn: (c: ImCache, ...args: any[]) => void,
    root: HTMLElement,
    ...args: any[]
): BenchmarkResult {
    function renderFn(c: ImCache) {
        im.CacheBegin(c, true); {
            imdom.RootBegin(c, root); {
                fn(c, ...args);
            } imdom.RootEnd(c, root);
        } im.CacheEnd(c);
    }

    let coldTimeMs = 0; 
    {
        let renders = 20;
        let error: any;
        for (let i = 0; i < renders; i++) {
            try {
                let t0 = performance.now();
                const c = im.newCache();
                renderFn(c);
                const total = performance.now() - t0;
                root.replaceChildren();
                coldTimeMs += total;
            } catch(e) {
                error = e;
                console.error(e);
                return newBenchmarkResult();
                break;
            }
        }

        coldTimeMs /= renders;
    }

    let warmTimeMs = 0; 
    {
        const c = im.newCache();
        renderFn(c);

        let renders = 200;
        let error: any;
        for (let i = 0; i < renders; i++) {
            try {
                let t0 = performance.now();
                renderFn(c);
                const total = performance.now() - t0;
                warmTimeMs += total;
            } catch(e) {
                error = e;
                console.error(e);
                return newBenchmarkResult();
                break;
            }
        }

        warmTimeMs /= renders;
    }

    root.replaceChildren();

    return { coldTimeMs, warmTimeMs };
}
