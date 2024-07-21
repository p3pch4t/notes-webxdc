import type { Folder, Note } from "$lib/shared";
import { generateRandomID } from "$lib/utils";
import { createExportedNote, type NoteExportExtension } from "./note";

import * as fflate from "fflate";

let nonce = 0;
export function formatDateTime(time: number): string {
	const date = new Date(time);
	return `Y${date.getFullYear()}M${date.getMonth()}D${date.getDay()}H${date.getHours()}M${date.getMinutes()}S${date.getSeconds()}_${++nonce % 100}`;
}

interface Directory {
	[key: string]: Uint8Array | Directory;
}

export async function createExportedFolder(
	folder: Folder,
	type: NoteExportExtension,
): Promise<File>;
export async function createExportedFolder(
	folder: Folder,
	type: NoteExportExtension,
	dir: Directory,
): Promise<void>;
export async function createExportedFolder(
	folder: Folder,
	type: NoteExportExtension,
	dir?: Directory,
): Promise<File | void> {
	const currentDir: Directory = dir ? (dir[folder.name] = {}) : {};

	if (folder.folders) {
		for (const subFolder of folder.folders) {
			await createExportedFolder(subFolder, type, currentDir);
		}
	}

	if (folder.notes) {
		for (const note of folder.notes) {
			const file = await createExportedNote(note, type);
			currentDir[file.name] = new Uint8Array(await file.arrayBuffer());

			if (type === "html-extra") {
				const historyDir: Directory = (currentDir[note.title + "_history"] = {});

				for (const historyNote of note.history) {
					const file = await createExportedNote(historyNote, type);
					historyDir[`${formatDateTime(historyNote.time)}-${file.name}`] = new Uint8Array(
						await file.arrayBuffer(),
					);
				}
			}
		}
	}

	if (dir) return;

	const data = await new Promise<Uint8Array>((resolve, reject) => {
		fflate.zip(currentDir, { consume: true }, (err, data) => {
			if (err) reject(err);
			else resolve(data);
		});
	});

	return new File([data], `${folder.name}.zip`, { type: "application/zip" });
}

export async function importFolders(intoFolder: Folder): Promise<[Folder[], Note[]]> {
	const folders: Folder[] = [];
	const notes: Note[] = [];
	const textDecoder = new TextDecoder();
	try {
		const files = await window.webxdc.importFiles({
			mimeTypes: ["application/zip", "application/x-zip-compressed"],
			extensions: [".zip"],
			multiple: true,
		});

		for (const file of files) {
			const data = new Uint8Array(await file.arrayBuffer());
			const unzipped = await new Promise<fflate.Unzipped>((resolve, reject) => {
				fflate.unzip(data, {}, (err, data) => {
					if (err) reject(err);
					else resolve(data);
				});
			});

			const rootFolder: Folder = {
				parentId: intoFolder.id,
				id: generateRandomID(),
				name: file.name.replace(".zip", ""),
				folders: [],
			};
			folders.push(rootFolder);

			const tempFolders = new Map<string, Folder>();

			for (const path in unzipped) {
				const hierarchical = path.split("/");
				const fileName = hierarchical.pop()!;

				let currentFolder = rootFolder;
				let currentPath = "";
				for (const directory of hierarchical) {
					currentPath += directory + "/";

					let folder =
						tempFolders.get(currentPath) ?? currentFolder.folders?.find(({ name }) => name === directory);
					if (!folder) {
						folder = {
							parentId: currentFolder.id,
							id: generateRandomID(),
							name: directory,
						};

						tempFolders.set(currentPath, folder);
						folders.push(folder);
					}
					currentFolder = folder;
				}

				if (!fileName) continue;

				const content = unzipped[path];
				const note: Note = {
					id: generateRandomID(),
					folderId: currentFolder.id,
					title: fileName.replace(/(\.txt)|(\.md)/, ""),
					content: textDecoder.decode(content),
					history: [],
				};

				notes.push(note);
			}
		}
	} catch (error) {
		console.warn("Failed importing note:", error);
	}
	return [folders, notes];
}
