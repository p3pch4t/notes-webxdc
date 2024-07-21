<script lang="ts">
	import { onMount, setContext } from "svelte";
	import { writable } from "svelte/store";

	import "$lib/components/ThemeSwitcher.svelte";

	import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles";
	import type { Folder, Note, User } from "$lib/shared";

	onMount(() => {
		if (typescaleStyles?.styleSheet) {
			document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
		}
	});

	const users = writable<User[]>([]);
	const folders = writable(new Map<string, Folder>());
	const notes = writable(new Map<string, Note>());
	const rootFolder = writable<Folder>({
		name: "Root",
		id: "root",
		folders: [],
		notes: [],
	});

	$folders.set($rootFolder.id, $rootFolder);

	setContext("users", users);
	setContext("root", rootFolder);
	setContext("notes", notes);
	setContext("folders", folders);
	setContext("view", writable("card"));

	onMount(() => {
		const deleteFolderRecursively = (id: string) => {
			const folder = $folders.get(id);
			if (!folder) return;

			const parent = $folders.get(folder.parentId!);
			if (parent) {
				const index = parent.folders?.indexOf(folder);
				if (typeof index !== "undefined" && index !== -1) parent.folders!.splice(index, 1);
			}

			if (folder.notes?.length) {
				for (const note of folder.notes) {
					$notes.delete(note.id);
				}
			}

			if (folder.folders?.length) {
				for (const childFolder of folder.folders) {
					deleteFolderRecursively(childFolder.id);
				}
			}

			$folders.delete(id);
		};

		window.webxdc.setUpdateListener((update) => {
			const { payload } = update;

			switch (payload.kind) {
				case "hello": {
					const { username, id } = payload;
					$users.push({ username, id });
					break;
				}

				case "addNote": {
					const { note, timestamp } = payload;

					const folder = $folders.get(note.folderId);
					if (!folder) {
						console.warn("Where the folder at");
						return;
					}

					if (note.mentions) {
						for (const mention of note.mentions) {
							window.webxdc.sendUpdate(
								{ payload: { kind: "empty" } },
								`@${mention} has been mentioned in "${note.title}"`,
							);
						}
					}

					note.history ??= [];
					note.history.push({
						title: note.title,
						content: note.content,
						time: timestamp,
					});

					folder.notes ??= [];
					folder.notes.push(note);
					$notes.set(note.id, note);
					break;
				}
				case "editNote": {
					const { id, changes, timestamp } = payload;
					const note = $notes.get(id);
					if (!note) {
						console.warn("Where the note at");
						return;
					}

					if (changes.mentions) {
						for (const mention of changes.mentions) {
							if (note?.mentions?.includes(mention)) continue;

							window.webxdc.sendUpdate(
								{ payload: { kind: "empty" } },
								`@${mention} has been mentioned in "${note.title}"`,
							);
						}
					}

					Object.assign(note, changes);

					note.history ??= [];
					note.history.push({
						title: note.title,
						content: note.content,
						time: timestamp,
					});
					break;
				}
				case "deleteNote": {
					const { id } = payload;

					const note = $notes.get(id);
					if (!note) {
						console.warn("where the note at");
						return;
					}

					const folder = $folders.get(note.folderId!);
					if (!folder) {
						console.warn("where the folder at");
						return;
					}

					const index = folder.notes?.indexOf(note);
					if (typeof index !== "undefined" && index !== -1) {
						folder.notes!.splice(index, 1);
					}

					$notes.delete(id);
					break;
				}

				case "addFolder": {
					const { folder } = payload;

					const parent = $folders.get(folder.parentId!);
					if (!parent) {
						console.warn("Where folder parent at?");
						return;
					}

					parent.folders ??= [];
					parent.folders.push(folder);
					$folders.set(folder.id, folder);
					break;
				}
				case "editFolder": {
					const { id, changes } = payload;
					const folder = $folders.get(id);
					if (!folder) {
						console.warn("Where the folder at");
						return;
					}

					Object.assign(folder, changes);
					break;
				}
				case "deleteFolder": {
					const { id } = payload;
					deleteFolderRecursively(id);
					break;
				}
			}

			$rootFolder = $rootFolder;
			$folders = $folders;
			$notes = $notes;
		});

		const { selfName, selfAddr } = window.webxdc;
		if (!$users.find(({ id, username }) => id === selfAddr && username === selfName)) {
			window.webxdc.sendUpdate(
				{
					payload: {
						timestamp: Date.now(),
						kind: "hello",
						id: selfAddr,
						username: selfName,
					},
				},
				`${selfName} joined the notes app`,
			);
		}
	});

	setContext("functions", {
		addNote(note) {
			window.webxdc.sendUpdate(
				{
					payload: {
						timestamp: Date.now(),
						kind: "addNote",
						note,
					},
				},
				`Added note "${note.title}"`,
			);
		},
		editNote(id, changes) {
			window.webxdc.sendUpdate(
				{
					payload: {
						timestamp: Date.now(),
						kind: "editNote",
						id,
						changes,
					},
				},
				`Edited note "${id}"`,
			);
		},
		deleteNote(id) {
			window.webxdc.sendUpdate(
				{
					payload: {
						timestamp: Date.now(),
						kind: "deleteNote",
						id,
					},
				},
				`Deleted note "${id}"`,
			);
		},

		addFolder(folder) {
			window.webxdc.sendUpdate(
				{
					payload: {
						timestamp: Date.now(),
						kind: "addFolder",
						folder,
					},
				},
				`Added folder "${folder.name}"`,
			);
		},
		editFolder(id, changes) {
			window.webxdc.sendUpdate(
				{
					payload: {
						timestamp: Date.now(),
						kind: "editFolder",
						id,
						changes,
					},
				},
				`Edited folder "${id}"`,
			);
		},
		deleteFolder(id) {
			window.webxdc.sendUpdate(
				{
					payload: {
						timestamp: Date.now(),
						kind: "deleteFolder",
						id,
					},
				},
				`Deleted folder "${id}"`,
			);
		},
	});
</script>

<main>
	<slot />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
</style>
