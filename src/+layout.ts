import type { Folder, Note, User } from "$lib/shared";
import type { Readable } from "svelte/store";

declare module "svelte" {
	interface Context {
		root: Readable<Folder>;
		users: Readable<User[]>;
		notes: Readable<Map<string, Note>>;
		folders: Readable<Map<string, Folder>>;
		view: Readable<"card" | "list">;

		functions: {
			addNote(note: Note): void;
			editNote(id: string, changes: Exclude<Partial<Note>, "id">): void;
			deleteNote(id: string): void;

			addFolder(folder: Folder): void;
			editFolder(id: string, changes: Exclude<Partial<Folder>, "id">): void;
			deleteFolder(id: string): void;
		};
	}

	export function getContext<T extends keyof Context>(key: T): Context[T];
	export function setContext<T extends keyof Context>(key: T, context: Context[T]): Context[T];
}

// Typing for webxdc
import type { Webxdc } from "../static/webxdc";

interface BasicPayload {
	timestamp: number;
}

interface HelloPayload extends BasicPayload {
	kind: "hello";
	username: string;
	id: string;
}

interface AddNotePayload extends BasicPayload {
	kind: "addNote";
	note: Note;
}

interface EditNotePayload extends BasicPayload {
	kind: "editNote";
	id: string;
	changes: Partial<Note>;
}

interface DeleteNotePayload extends BasicPayload {
	kind: "deleteNote";
	id: string;
}

interface AddFolderPayload extends BasicPayload {
	kind: "addFolder";
	folder: Folder;
}

interface EditFolderPayload extends BasicPayload {
	kind: "editFolder";
	id: string;
	changes: Partial<Folder>;
}

interface DeleteFolderPayload extends BasicPayload {
	kind: "deleteFolder";
	id: string;
}

interface EmptyPayload {
	kind: "empty";
}

type AnyPayload =
	| HelloPayload
	| AddNotePayload
	| EditNotePayload
	| DeleteNotePayload
	| AddFolderPayload
	| EditFolderPayload
	| DeleteFolderPayload
	| EmptyPayload;

declare global {
	type WebxdcPayload = AnyPayload;

	interface Window {
		webxdc: Webxdc<AnyPayload>;
	}
}
