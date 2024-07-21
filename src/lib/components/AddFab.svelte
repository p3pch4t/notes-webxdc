<script lang="ts">
	import { getContext } from "svelte";
	import { fade } from "svelte/transition";
	import { goto } from "$app/navigation";

	import "@material/web/fab/fab";

	import AddIcon from "~icons/material-symbols/add-rounded";
	import AddFolderIcon from "~icons/material-symbols/create-new-folder-rounded";
	import AddNoteIcon from "~icons/material-symbols/add-notes-rounded";
	import UploadFileIcon from "~icons/material-symbols/upload-file-rounded";
	import UploadFolderIcon from "~icons/material-symbols/drive-folder-upload-rounded";

	import AddFolderDialog from "$lib/components/dialogs/AddFolderDialog.svelte";
	import type { Folder } from "$lib/shared";
	import { generateRandomID } from "$lib/utils";
	import { importFolders } from "$lib/export/folder";
	import { importNotes } from "$lib/export/note";

	export let folder: Folder;

	const functions = getContext("functions");

	let opened = false;
	function toggleOpened() {
		opened = !opened;
	}

	async function importNote(): Promise<void> {
		const notes = await importNotes(folder);
		for (const note of notes) {
			functions.addNote(note);
		}
	}

	async function importFolder(): Promise<void> {
		const [folders, notes] = await importFolders(folder);
		for (const folder of folders) {
			functions.addFolder(folder);
		}
		for (const note of notes) {
			functions.addNote(note);
		}
	}

	let showAddFolder: () => void;
	function addFolder(): void {
		showAddFolder();
		opened = false;
	}
	async function addNote(): Promise<void> {
		await goto(`/notes/edit/${folder.id}/${generateRandomID()}`);
	}
</script>

<AddFolderDialog bind:show={showAddFolder} {folder} />

{#if opened}
	<div transition:fade={{ duration: 250 }} id="add-fabs-container" on:click|self={toggleOpened}>
		<md-fab id="import-folder" variant="tertiary" label="Import folder" on:click={importFolder}>
			<UploadFolderIcon slot="icon" />
		</md-fab>
		<md-fab id="import-note" variant="tertiary" label="Import note" on:click={importNote}>
			<UploadFileIcon slot="icon" />
		</md-fab>
		<md-fab id="add-folder" variant="secondary" label="Add folder" on:click={addFolder}>
			<AddFolderIcon slot="icon" />
		</md-fab>
		<md-fab id="add-note" variant="primary" label="Add note" on:click={addNote}>
			<AddNoteIcon slot="icon" />
		</md-fab>
	</div>
{:else}
	<md-fab id="add-fab" on:click={toggleOpened}>
		<AddIcon slot="icon" />
	</md-fab>
{/if}

<style>
	#add-fab {
		position: fixed;
		bottom: 16px;
		right: 16px;

		z-index: 2;
	}

	#add-fabs-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		padding: 16px;

		display: flex;
		flex-direction: column;
		align-items: end;
		justify-content: end;
		gap: 8px;

		background-color: #00000080;
		z-index: 2;

		& > md-fab {
			width: 153px;
		}
	}
</style>
