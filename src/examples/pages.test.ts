import * as test from "testing";

const filename = __FILEPATH__;
const folder = __FOLDER__;
test.file(filename);

test.group("urls", [], () => {
    function toQueryParam(heading: string): string {
        return heading.replace(/ /g, "+")
    }

    test.add("Every local url in every page must be valid", async t => {
        const pageFilenames = await test.listDirectoryContents(t, folder, "pages");
        const pages = await Promise.all(
            pageFilenames.files.map(async page => {
                const content = await test.readFile(t, page)
                return { page, content }
            })
        );

        // This is how our testing harness generates URLs.
        // If this changes, the test is no longer accurate.
        const allHeadings = new Set<string>();
        for (const { page, content } of pages) {
            const firstLine = content.split("\n", 1)[0].trim();
            if (!test.check(t, firstLine.startsWith("# "))) {
                test.failure(t, page + " did not start with a L1 heading - instead we got:\n" + firstLine)
                break
            }

            const heading = toQueryParam(firstLine.slice("# ".length));
            allHeadings.add(heading);
        }

        if (t.fails && t.fails.length > 0) return;

        for (const { page, content } of pages) {
            // Rather than parsing with `bl.parse`, I'm just checking all the urls
            // using a regex. It turns out our blog-lang parser is incredibly slow lol
            for (const match of content.matchAll(/#url\[.*?,(.*?)\]/gm)) {
                let path = match[1].trim();
                if (!path.startsWith("/?")) continue;

                const params = path.slice(2).trim().split("&");
                for (const param of params) {
                    const [arg,val] = param.split("=", 2)
                    if (arg === "test") {
                        if (!allHeadings.has(val)) {
                            test.failure(t, page + " contains an invalid link:\n test=" + val);
                        }
                    }
                }
            }
        }
    })
})
