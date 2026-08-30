import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'url';

// Basiclaly - I have been calling this 'im-js' but I can't actually publish this
// to npm bcause there is some other package/scope with a very similar name. 
// Also I'm thinking aobut it some more and while it's fine for a personal
// library, it isn't a very good outward facing name either.
// It's as if React were named 'imfc-js'.
//
//

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const BASE_DIR   = path.join(__dirname, "../");

for await (const file of fs.glob("**/*.ts", { cwd: BASE_DIR })) {
	if (file.includes("node_modules")) continue;
	if (file.includes("migrate")) continue;

	const filePath = path.join(BASE_DIR, file);

	let newText = await fs.readFile(filePath, { encoding: "utf-8" });

	if (!filePath.includes("im-core")) {
	}

	if (!filePath.includes("im-dom")) {
	}
}

function replaceBetween(text: string, from: string, to: string, replacement: string): string {
	const idx = text.indexOf(to);
	if (idx === -1) return text;

	const fromIdx = text.lastIndexOf(from, idx);
	if (fromIdx === -1) return text;

	return text.substring(0, fromIdx) + replacement + text.substring(idx + to.length);
}
