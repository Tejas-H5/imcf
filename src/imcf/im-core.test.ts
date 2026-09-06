import { im, ImCache } from "imcf";
import * as test from "testing";

const filename = __FILEPATH__;
test.file(filename);

test.group("im.Get/im.Set", [] , () => {
    // The core of the frame work. If these don't work, nothing works
    
    test.add("State can be maintained between renders", r => {
        const c = im.newCache();
        const value = {};

        im.CacheBegin(c); {
            im.Get(c, Object); im.Set(c, value);
        } im.CacheEnd(c);

        im.CacheBegin(c); {
            const valueFromGet = im.Get(c, Object);
            test.checkEqual(r, valueFromGet, value);
        } im.CacheEnd(c);
    })

    test.add("Two units of state can be maintained between renders", r => {
        const c = im.newCache();
        const value = {v: "val1"};
        const value2 = {v: "val2"};

        im.CacheBegin(c); {
            im.Get(c, Object); im.Set(c, value);
            im.Get(c, Object); im.Set(c, value2);
        } im.CacheEnd(c);

        im.CacheBegin(c); {
            const valueFromGet = im.Get(c, Object);
            test.checkEqual(r, valueFromGet, value);
            
            const value2FromGet = im.Get(c, Object);
            test.checkEqual(r, value2FromGet, value2);
        } im.CacheEnd(c);
    })

    test.add("It throws if we try to access the wrong type of state", r => {
        const c = im.newCache();
        const value = {v: "val1"};

        im.CacheBegin(c); {
            im.Get(c, Object); im.Set(c, value);
        } im.CacheEnd(c);

        test.checkThrows(r, () => {
            im.CacheBegin(c); {
                im.Get(c, Array);
            } im.CacheEnd(c);
        }, "Expected to populate this cache entry with type=Object, but got Array . " + im.CONDITIONAL_RENDERING_ERROR_MESSAGE);
    });

    test.add("It throws if we try to get the next state without setting the previous state", r => {
        const c = im.newCache();

        test.checkThrows(r, () => {
            im.CacheBegin(c); {
                im.Get(c, Array);
                im.Get(c, Array);
            } im.CacheEnd(c);
        }, "The previous call to imGet was not paired with a call to imSet");
    });

    test.add("It throws if we subsequently render more items", r => {
        const c = im.newCache();

        im.CacheBegin(c); {
            im.Get(c, Array) ?? im.Set(c, []);
        } im.CacheEnd(c);

        test.checkThrows(r, () => {
            im.CacheBegin(c); {
                im.Get(c, Array) ?? im.Set(c, []);
                im.Get(c, Array) ?? im.Set(c, []);
            } im.CacheEnd(c);
        }, "You should be rendering the same number of things in every render cycle");
    });

    test.add("It throws if we subsequently render less items", r => {
        const c = im.newCache();

        im.CacheBegin(c); {
            im.Get(c, Array) ?? im.Set(c, []);
            im.Get(c, Array) ?? im.Set(c, []);
        } im.CacheEnd(c);

        test.checkThrows(r, () => {
            im.CacheBegin(c); {
                im.Get(c, Array) ?? im.Set(c, []);
            } im.CacheEnd(c);

            // I notice it isn't as easy to report whether we rendered fewer things or more things. 
            // We may want to fix that.
        }, "You should be rendering the same number of things in every render cycle");
    });
});

test.group("im.Memo", [] , () => {
    // Used to trigger side-effects. If this doesn't work, a lot of behaviours won't work

    test.add("MEMO_FIRST_RENDERER on the first render", r => {
        const c = im.newCache();

        im.CacheBegin(c); {
            const val = im.Memo(c, true);
            test.checkEqual(r, val, im.MEMO_FIRST_RENDER);
        } im.CacheEnd(c);

        im.CacheBegin(c); {
            const val = im.Memo(c, true);
            test.checkEqual(r, val, im.MEMO_NOT_CHANGED);
        } im.CacheEnd(c);
    });

    test.add("MEMO_CHANGED when the value changes", r => {
        const c = im.newCache();

        im.CacheBegin(c); {
            const val = im.Memo(c, true);
            test.checkEqual(r, val, im.MEMO_FIRST_RENDER);
        } im.CacheEnd(c);

        im.CacheBegin(c); {
            const val = im.Memo(c, false);
            test.checkEqual(r, val, im.MEMO_CHANGED);
        } im.CacheEnd(c);

        im.CacheBegin(c); {
            const val = im.Memo(c, false);
            test.checkEqual(r, val, im.MEMO_NOT_CHANGED);
        } im.CacheEnd(c);
    });

    test.add("MEMO_CHANGED when the value changes 1 frame after first render", r => {
        const c = im.newCache();

        im.CacheBegin(c); {
            const val = im.Memo(c, true);
            test.checkEqual(r, val, im.MEMO_FIRST_RENDER);
        } im.CacheEnd(c);

        im.CacheBegin(c); {
            const val = im.Memo(c, true);
            test.checkEqual(r, val, im.MEMO_NOT_CHANGED);
        } im.CacheEnd(c);

        im.CacheBegin(c); {
            const val = im.Memo(c, false);
            test.checkEqual(r, val, im.MEMO_CHANGED);
        } im.CacheEnd(c);

        im.CacheBegin(c); {
            const val = im.Memo(c, false);
            test.checkEqual(r, val, im.MEMO_NOT_CHANGED);
        } im.CacheEnd(c);
    });

    test.group("Interactions with conditional rendering", [] , () => {
        test.add("Memo should work with im.If", r => {
            const c = im.newCache();

            for (let i = 0; i < 4; i++) {
                im.CacheBegin(c); {
                    if (im.If(c) && i % 2 === 0) {
                        const val = im.Memo(c, true);
                        test.checkEqual(r, val, im.MEMO_FIRST_RENDER, "" + i);
                    } else { 
                        im.Else(c);
                        const val = im.Memo(c, true);
                        test.checkEqual(r, val, im.MEMO_FIRST_RENDER, "" + i);
                    } im.IfEnd(c);
                } im.CacheEnd(c);
            }
        });

        test.add("Memo should work with im.If deep", r => {
            const c = im.newCache();

            for (let i = 0; i < 4; i++) {
                im.CacheBegin(c); {
                    if (im.If(c) && i % 2 === 0) {
                        if (im.If(c) && true) {
                            if (im.If(c) && true) {
                                if (im.If(c) && true) {
                                    const val = im.Memo(c, true);
                                    test.checkEqual(r, val, im.MEMO_FIRST_RENDER, "" + i);
                                } im.IfEnd(c);
                            } im.IfEnd(c);
                        } im.IfEnd(c);
                    } else { 
                        im.Else(c);

                        if (im.If(c) && true) {
                            if (im.If(c) && true) {
                                if (im.If(c) && true) {
                                    const val = im.Memo(c, true);
                                    test.checkEqual(r, val, im.MEMO_FIRST_RENDER, "" + i);
                                } im.IfEnd(c);
                            } im.IfEnd(c);
                        } im.IfEnd(c);
                    } im.IfEnd(c);
                } im.CacheEnd(c);
            }
        });

        test.add("Memo should work with im.Switch", r => {
            const c = im.newCache();

            for (let i = 0; i < 4; i++) {
                im.CacheBegin(c); {
                    im.Switch(c, i % 2); switch(i % 2) {
                        case 0: {
                            const val = im.Memo(c, true);
                            test.checkEqual(r, val, im.MEMO_FIRST_RENDER, "" + i);
                        } break;
                        case 1: {
                            const val = im.Memo(c, true);
                            test.checkEqual(r, val, im.MEMO_FIRST_RENDER, "" + i);
                        } break;
                    } im.SwitchEnd(c);
                } im.CacheEnd(c);
            }
        });

        test.add("Memo should work with im.Switch deep", r => {
            const c = im.newCache();

            for (let i = 0; i < 4; i++) {
                im.CacheBegin(c); {
                    im.Switch(c, i % 2); switch(i % 2) {
                        case 0: {
                            im.Switch(c, 0); switch (0) {
                                case 0: {
                                    im.Switch(c, 0); switch (0) {
                                        case 0: {
                                            im.Switch(c, 0); switch (0) {
                                                case 0: {
                                                    const val = im.Memo(c, true);
                                                    test.checkEqual(r, val, im.MEMO_FIRST_RENDER, "" + i);
                                                } break;
                                            } im.SwitchEnd(c);
                                        } break;
                                    } im.SwitchEnd(c);
                                } break;
                            } im.SwitchEnd(c);
                        } break;
                        case 1: {
                            im.Switch(c, 0); switch (0) {
                                case 0: {
                                    im.Switch(c, 0); switch (0) {
                                        case 0: {
                                            im.Switch(c, 0); switch (0) {
                                                case 0: {
                                                    const val = im.Memo(c, true);
                                                    test.checkEqual(r, val, im.MEMO_FIRST_RENDER, "" + i);
                                                } break;
                                            } im.SwitchEnd(c);
                                        } break;
                                    } im.SwitchEnd(c);
                                } break;
                            } im.SwitchEnd(c);
                        } break;
                    } im.SwitchEnd(c);
                } im.CacheEnd(c);
            }
        });
    });
});


test.group("im.IsFirstRender", [] , () => {
    // Used to run things once. If this doesn't work, the results can be pretty bad

    test.add("Only true the first render", r => {
        const c = im.newCache();
        
        im.CacheBegin(c); {
            const result = im.IsFirstRender(c);
            test.checkEqual(r, result, true);
        } im.CacheEnd(c);

        im.CacheBegin(c); {
            const result = im.IsFirstRender(c);
            test.checkEqual(r, result, false);
        } im.CacheEnd(c);
    });

    test.add("Works for multiple callsites", r => {
        const c = im.newCache();
        
        im.CacheBegin(c); {
            test.checkEqual(r, im.IsFirstRender(c), true);
            test.checkEqual(r, im.IsFirstRender(c), true);
            test.checkEqual(r, im.IsFirstRender(c), true);
        } im.CacheEnd(c);

        im.CacheBegin(c); {
            test.checkEqual(r, im.IsFirstRender(c), false);
            test.checkEqual(r, im.IsFirstRender(c), false);
            test.checkEqual(r, im.IsFirstRender(c), false);
        } im.CacheEnd(c);
    });

    test.add("Works for multiple callsites despite exceptions", r => {
        const c = im.newCache();
        
        im.CacheBegin(c); {
            test.checkEqual(r, im.IsFirstRender(c), true);

            // throw new Error("some exception idek")
        } // im.CacheEnd(c); // doesn't get run

        im.CacheBegin(c); {
            test.checkEqual(r, im.IsFirstRender(c), false);

            test.checkEqual(r, im.IsFirstRender(c), true);
            test.checkEqual(r, im.IsFirstRender(c), true);
            // throw new Error("some other exception idek")
        } // im.CacheEnd(c); // doesn't get run

        im.CacheBegin(c); {
            test.checkEqual(r, im.IsFirstRender(c), false);

            test.checkEqual(r, im.IsFirstRender(c), false);
            test.checkEqual(r, im.IsFirstRender(c), false);
            test.checkEqual(r, im.IsFirstRender(c), true);
        } im.CacheEnd(c);

        // NOTE: we can't detect calls to im.IsFirstRender(c) that may buggily be placed out-of-order - 
        // We just increment an integer to be performant. But maybe we should just replace im.IsFirstRender() with im.Memo(c, true) to 
        // get out-of-order rendering safety of some kind? I don't think it's worth it for now.
    });
});

test.group("im.Try/Catch", [] , () => {
    test.add("im.Try throws if a render method wasn't set yet", r => {
        test.checkThrows(r, () => {
            const c = im.newCache();
            im.CacheBegin(c); {
                im.Try(c);
            } im.CacheEnd(c);
        }, "Using imTry requires having set up a rerender method with im.setRenderFn - we need to rerender your state one more time at the very end if an error was thrown");
    });

    test.add("im.Try unwinds the stack when an error is thrown", r => {
        function imRerender(c: ImCache) {
            im.CacheBegin(c); {
                const s = im.Try(c); try {
                    if (im.If(c) && !s.err) {
                        throw new Error("NOO");
                        // The exception causes closing statements to be skipped the first renader
                    } im.IfEnd(c);
                } catch(e) {
                    im.Catch(c, s, e);
                } im.TryEnd(c, s);
            } im.CacheEnd(c);
        }

        const c = im.newCache();
        im.setRenderFn(c, imRerender);

        const err = test.getThrownError(() => {
            im.rerenderCache(c);
        });

        test.checkEqual(r, err, undefined);
    });

    test.add("im.Try will still let a throw through if the error pathway had an error as well", r => {
        // As a result, the error page should be simple.
    
        function imRerender(c: ImCache) {
            im.CacheBegin(c); {
                const s = im.Try(c); try {
                    // usually we would do if (im.If(c) && !s.err) to avoid this
                    throw new Error("NOO");
                } catch(e) {
                    im.Catch(c, s, e);
                } im.TryEnd(c, s);
            } im.CacheEnd(c);
        }

        const c = im.newCache();
        im.setRenderFn(c, imRerender);

        test.checkThrows(r, () => {
            im.rerenderCache(c);
        }, "Your error boundary pathway also has an error in it, so we can't recover!");
    });

    test.add("Errors can be recovered from", r => {
        let recovered = false;
        const log: string[] = [];

        function imRerender(c: ImCache) {
            im.CacheBegin(c); {
                const s = im.Try(c); try {
                    if (im.If(c) && !s.err) {
                        if (!recovered) {
                            throw new Error("NOO");
                        } else {
                            log.push("Recovered");
                        }
                    } else {
                        im.Else(c);
                        recovered = true;
                        s.recover();
                    } im.IfEnd(c);
                } catch(e) {
                    im.Catch(c, s, e);
                } im.TryEnd(c, s);
            } im.CacheEnd(c);
        }

        const c = im.newCache();
        im.setRenderFn(c, imRerender);
        const err = test.getThrownError(() => {
            im.rerenderCache(c);
        });
        test.checkEqual(r, err, undefined);
        test.checkDeepEqual(r, log, ["Recovered"]);
    });
});

test.group("im.onImmediateModeBlockDestroyed", [] , () => {
    // Used to destroy blocks specifically when they are destroyed. 
    // Typically not used for actual business logic - it should only
    // be for helpers that wrap add/remove patterns. 
    // Because usage is so rare, im.If doesn't support running destructors for example.

    test.add("Does not get called for im.If", r => {
        const c = im.newCache();

        const messages: string[] = [];

        for (let i = 0; i < 2; i++) {
            im.CacheBegin(c); {
                if (im.If(c) && i === 0) {
                    if (im.IsFirstRender(c)) {
                        im.onImmediateModeBlockDestroyed(c, () => {
                            messages.push("Destroyed");
                        });
                    }
                } im.IfEnd(c);
            } im.CacheEnd(c);
        }

        test.checkEqual(r, messages.length, 0);
    });

    test.add("Does get called for im.Switch", r => {
        const c = im.newCache();

        const messages: string[] = [];

        for (const idx of [0, 1, 2, 0]) {
            // NOTE: this isn't particularly good code to write in actual apps - 
            // it's more of a text fixture than an example
            im.CacheBegin(c); {
                const view = "view " + idx;
                im.Switch(c, view); {
                    if (im.IsFirstRender(c)) {
                        im.onImmediateModeBlockDestroyed(c, () => {
                            messages.push("Destroyed " + view);
                        });
                    }
                } im.SwitchEnd(c);
            } im.CacheEnd(c);
        }

        test.checkDeepEqual(r, messages, [
            "Destroyed view 0",
            "Destroyed view 1",
            "Destroyed view 2",
        ]);
    });

    test.add("Destructor works recursively", r => {
        const c = im.newCache();

        const messages: string[] = [];

        for (const idx of [0, 1]) {
            // NOTE: this isn't particularly good code to write in actual apps - 
            // it's more of a text fixture than an example
            im.CacheBegin(c); {
                im.Switch(c, idx);  {
                    if (idx === 0) {
                        if (im.IsFirstRender(c)) {
                            im.onImmediateModeBlockDestroyed(c, () => {
                                messages.push("Destroyed root 1");
                            });
                        }

                        im.If(c); {
                            if (im.IsFirstRender(c)) {
                                im.onImmediateModeBlockDestroyed(c, () => {
                                    messages.push("Destroyed if 1");
                                });
                            }
                        } im.IfEnd(c);

                        im.Switch(c, 1); {
                            if (im.IsFirstRender(c)) {
                                im.onImmediateModeBlockDestroyed(c, () => {
                                    messages.push("Destroyed switch 1");
                                });
                            }
                        } im.SwitchEnd(c);
                    }
                } im.SwitchEnd(c);
            } im.CacheEnd(c);
        }

        // Things deeper in the 'heirarchy' of state will get destroyed first.
        // but the actual order of things on the same level in the heirarchy is undefined.
        // I reserve the right to change it whenever.
        test.checkDeepEqual(r, messages, [
            "Destroyed if 1",
            "Destroyed switch 1",
            "Destroyed root 1",
        ]);
    });

    test.add("Destructor works in else-if and else branches of if statements", r => {
        const messages: string[] = [];

        function render(c: ImCache, branchIdx: number, on: boolean) {
            im.CacheBegin(c); {
                im.Switch(c, on); if (on) {
                    if (im.If(c) && branchIdx === 0) {
                        if (im.IsFirstRender(c)) {
                            im.onImmediateModeBlockDestroyed(c, () => messages.push("Destroyed branch 0"));
                        }
                    } else if (im.IfElse(c) && branchIdx === 1) {
                        if (im.IsFirstRender(c)) {
                            im.onImmediateModeBlockDestroyed(c, () => messages.push("Destroyed branch 1"));
                        }
                    } else {
                        im.Else(c);
                        if (im.IsFirstRender(c)) {
                            im.onImmediateModeBlockDestroyed(c, () => messages.push("Destroyed branch 2"));
                        }
                    } im.IfEnd(c);
                } im.SwitchEnd(c);
            } im.CacheEnd(c);
        }

        const c = im.newCache();

        // Set up the destructors
        render(c, 0, true);
        render(c, 1, true);
        render(c, 2, true);

        test.checkDeepEqual(r, messages, []);

        // invoke the destructors
        render(c, 0, false);

        test.checkDeepEqual(r, messages, [
            "Destroyed branch 0",
            "Destroyed branch 1",
            "Destroyed branch 2",
        ]);
    });
});

test.group("Conditional rendering - remove signal", [] , () => {
    // If nothing is rendered to an entry list, that's the signal to remove that entry list.
    // It's a mistake to think that if the index moved, then the entries were not observed -
    // im.KeyedBegin, and im.IsFirstRender both mutate the entry list without incrementing the index.

    test.add("im.KeyedBegin needs to count as a rendered thing", r => {
        const c = im.newCache();

        const messages: string[] = [];

        for (let i = 0; i < 2; i++) {
            im.CacheBegin(c); {
                if (im.If(c)) {
                    im.KeyedBegin(c, 0); {
                        if (im.Memo(c)) {
                            messages.push("iteration " + i);
                        }
                    } im.KeyedEnd(c);
                } im.IfEnd(c);
            } im.CacheEnd(c);
        }

        test.checkEqual(r, messages.length, 1);
    });

    test.add("im.IsFirstRender needs to count as a rendered thing", r => {
        const c = im.newCache();

        const messages: string[] = [];

        for (let i = 0; i < 2; i++) {
            im.CacheBegin(c); {
                if (im.If(c)) {
                    if (im.IsFirstRender(c)) {
                        // Technically if you dont have any other immediate-mode state accesses within a branch,
                        // we've got no clue if that branch has been taken lol.
                    }

                    const entries = im.getCurrentCacheEntries(c);
                    if (im.getEntriesIsInConditionalPathway(entries)) {
                        messages.push("started");
                    }
                } im.IfEnd(c);
            } im.CacheEnd(c);
        }

        test.checkEqual(r, messages.length, 2);
    });
});
