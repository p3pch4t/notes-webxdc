import type { Folder, Note } from "$lib/shared";
import { generateRandomID, parseMarkdown, sanitizeHTML } from "$lib/utils";

// @ts-expect-error no types :(
import { default as html2pdf } from "html2pdf.js";

type RequiredNoteFields = Pick<Note, "title" | "content">;

/** Append note's title as markdown headline to the content */
function contentWithTitle(note: RequiredNoteFields): string {
	return `# ${note.title}\n\n${note.content}`;
}

/** Extract title appended in the past using {@linkcode contentWithTitle} from the note's content */
function extractTitleFromContent(content: string): [title: string | undefined, content: string] {
	const title = content.match(/#\s.+\n\n/)?.[0];
	if (title) {
		return [title.slice(2, -2), content.slice(title.length)];
	}
	return [undefined, content];
}

function templateHtmlNote(note: RequiredNoteFields): string {
	// Attach required styles from current document to make exported note look-a-like material 3
	// this includes .markdown styling as well as css variables from :root (both light and dark mode)
	let attachedStyle = "";
	for (const styleSheet of document.styleSheets) {
		for (const rule of styleSheet.cssRules) {
			if (!(rule instanceof CSSStyleRule)) continue;

			if (
				rule.selectorText !== ".markdown" &&
				!rule.selectorText.startsWith(":root") &&
				!rule.selectorText.includes("highlight-js")
			) {
				continue;
			}

			// Convert from using class, which requires js in notes app (to preserve the choice) to prefers-color-scheme media query
			if (rule.selectorText.includes(".dark")) {
				attachedStyle +=
					rule.cssText.replace(
						rule.selectorText,
						`@media (prefers-color-scheme: dark) { ${rule.selectorText.replace(".dark", "")}`,
					) + "}";
				continue;
			}

			attachedStyle += rule.cssText;
		}
	}

	return `
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${sanitizeHTML(note.title)}</title>\

    <style media="all">
        :root {
            font-family: "Roboto Flex", Roboto, Cantarell, Inter, "Noto Sans";
        }
        
        html, body {
            height: 100%;
            transition: var(--md-default-transition);
            color: var(--md-sys-color-on-surface);
            background-color: var(--md-sys-color-surface);
        }

		${attachedStyle}
    </style>
</head>
<body class="markdown">
    ${parseMarkdown(contentWithTitle(note))}
</body>
</html>`;
}

export type NoteExportExtension = "md" | "html-extra" | "html" | "pdf";

export async function createExportedNote(
	note: RequiredNoteFields,
	type: NoteExportExtension,
): Promise<File> {
	let fileName = "";
	let fileType = "";
	let fileContent = "";

	switch (type) {
		case "md": {
			fileName = `${note.title}.md`;
			fileType = "text/markdown";
			fileContent = contentWithTitle(note);
			break;
		}
		case "html-extra":
		case "html": {
			fileName = `${note.title}.html`;
			fileType = "text/html";
			fileContent = templateHtmlNote(note);
			break;
		}
		case "pdf": {
			const html = parseMarkdown(note.content);

			const div = document.createElement("div");
			div.classList.add("markdown-simple", "light");
			div.innerHTML = html;

			const pdf = await new Promise<string>((resolve) => {
				html2pdf()
					.set({
						margin: 8,
						image: { type: "jpeg", quality: 0.95 },
						html2canvas: { scale: 2 },
						pagebreak: {
							mode: "avoid-all",
						},
					})
					.from(div)
					.toPdf()
					.output("blob")
					.then(resolve);
			});

			fileName = `${note.title}.pdf`;
			fileType = "application/pdf";
			fileContent = pdf;
			break;
		}
	}

	return new File([fileContent], fileName, { type: fileType });
}

export async function importNotes(intoFolder: Folder): Promise<Note[]> {
	const notes: Note[] = [];
	try {
		const files = await window.webxdc.importFiles({
			mimeTypes: ["text/plain", "text/markdown", "text/x-markdown"],
			extensions: [".txt", ".md"],
			multiple: true,
		});

		for (const file of files) {
			const [title = file.name.replace(/(\.txt)|(\.md)/, ""), content] = extractTitleFromContent(
				await file.text(),
			);

			const note: Note = {
				id: generateRandomID(),
				folderId: intoFolder.id,
				title,
				content,
				history: [],
			};

			notes.push(note);
		}
	} catch (error) {
		console.warn("Failed importing note:", error);
	}
	return notes;
}
