// @ts-expect-error trust me bro
import * as test from "testing";
// @ts-expect-error trust me bro
ALL_TESTS

// @ts-expect-error trust me bro
const isCi: boolean = IS_CI;

// TODO: parallelism. 
// It's important we do it _after_ we've bundled all the code, so that
// each worker doesn't end up doing a bunch of bundling at the start.
(async () => {
	const results = await test.runAll(isCi);

	test.printResults(results);

	if (isCi) {
		if (test.anyFails(results)) {
			throw new Error("Some tests have failed");
		}
	}
})();
