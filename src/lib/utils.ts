import DOMPurify from "dompurify";
import { marked, Renderer } from "marked";
import markedFootnote from "marked-footnote";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

const renderer = new Renderer({ gfm: true, breaks: true, async: false });
let checkboxId = 0;

// Keep track of checkboxes id for checking them in view mode
renderer.checkbox = ({ checked }) =>
	`<input data-checkbox-id="${checkboxId++}" type="checkbox" ${checked ? "checked" : ""} />`;

// Disable images
renderer.image = () => "";

marked
	.use(markedFootnote())
	.use(
		markedHighlight({
			langPrefix: "highlight-js ",
			highlight(code, lang) {
				const language = hljs.getLanguage(lang) ? lang : "plaintext";
				return hljs.highlight(code, { language }).value;
			},
		}),
	)
	.use({ renderer });

export function parseMarkdown(markdown: string): string {
	try {
		return sanitizeHTML(marked.parse(markdown) as string);
	} finally {
		checkboxId = 0;
	}
}

export function sanitizeHTML(html: string): string {
	return DOMPurify.sanitize(html);
}

export function generateRandomID(): string {
	const bytes = crypto.getRandomValues(new Uint32Array(5));
	const strings = Array.from(bytes).map((x) => x.toString(16));
	return strings.join("-");
}
