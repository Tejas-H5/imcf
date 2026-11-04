import { el, im, ImCache, imdom } from "imcf";
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

    if (imButtonIsClicked(c, state.reportView ? "UI view ->" : "Report view ->")) {
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

function renderVariadicComponent(
    c: ImCache,
    fn: (c: ImCache, ...args: any[]) => void,
    root: HTMLElement,
    ...args: any[]
) {
    im.CacheBegin(c, true); {
        imdom.RootBegin(c, root); {
            fn(c, ...args);
        } imdom.RootEnd(c, root);
    } im.CacheEnd(c);
}

function runBenchmark(
    fn: (c: ImCache, ...args: any[]) => void,
    root: HTMLElement,
    ...args: any[]
): BenchmarkResult {
    // Breaking this up into two functions allows the profiler
    // to better attribute the costs to the cold/warm parts of
    // the benchmark

    const coldTimeMs = runBenchmarkCold(fn, root, ...args);
    root.replaceChildren();

    const warmTimeMs = runBenchmarkWarm(fn, root, ...args);
    root.replaceChildren();

    return { coldTimeMs, warmTimeMs };
}

function runBenchmarkCold(
    fn: (c: ImCache, ...args: any[]) => void,
    root: HTMLElement,
    ...args: any[]
): number {
    let coldTimeMs = 0;
    let renders = 20;
    let error: any;
    for (let i = 0; i < renders; i++) {
        try {
            let t0 = performance.now();
            const c = im.newCache();
            renderVariadicComponent(c, fn, root, ...args);
            const total = performance.now() - t0;
            root.replaceChildren();
            coldTimeMs += total;
        } catch (e) {
            error = e;
            console.error(e);
            break;
        }
    }

    coldTimeMs /= renders;
    return coldTimeMs;
}

function runBenchmarkWarm(
    fn: (c: ImCache, ...args: any[]) => void,
    root: HTMLElement,
    ...args: any[]
): number {
    const c = im.newCache();
    renderVariadicComponent(c, fn, root, ...args);

    let warmTimeMs = 0;
    let renders = 200;
    let error: any;
    for (let i = 0; i < renders; i++) {
        try {
            let t0 = performance.now();
            renderVariadicComponent(c, fn, root, ...args);
            const total = performance.now() - t0;
            warmTimeMs += total;
        } catch(e) {
            error = e;
            console.error(e);
            break;
        }
    }

    warmTimeMs /= renders;

    return warmTimeMs;
}
