<script lang="ts">
	import { goto } from "$app/navigation";

	import ContextMenu from "$lib/components/ContextMenu.svelte";
	import ExpandableMenuItem from "$lib/components/ExpandableMenuItem.svelte";
	import MenuItem from "$lib/components/MenuItem.svelte";

	import EditIcon from "~icons/material-symbols/edit-rounded";
	import DeleteIcon from "~icons/material-symbols/delete-rounded";
	import EditNoteIcon from "~icons/material-symbols/edit-note-rounded";
	import ViewReadonlyIcon from "~icons/material-symbols/visibility-lock-rounded";
	import DownloadIcon from "~icons/material-symbols/download-rounded";
	import WebIcon from "~icons/material-symbols/web";
	import FilesIcon from "~icons/material-symbols/files";
	import MarkdownIcon from "~icons/material-symbols/markdown-rounded";
	import PdfIcon from "~icons/material-symbols/picture-as-pdf-rounded";
	import WarningIcon from "~icons/material-symbols/warning-rounded";

	import DeleteFolderDialog from "$lib/components/dialogs/DeleteFolderDialog.svelte";
	import DeleteNoteDialog from "$lib/components/dialogs/DeleteNoteDialog.svelte";
	import RenameFolderDialog from "$lib/components/dialogs/RenameFolderDialog.svelte";

	import type { Note, Folder } from "$lib/shared";
	import { createExportedNote, type NoteExportExtension } from "$lib/export/note";
	import { createExportedFolder } from "$lib/export/folder";
	import ConfirmationDialog from "./dialogs/ConfirmationDialog.svelte";

	let showExportConfirmationDialog: () => void;
	let exportDialogFunction: () => void;

	let contextItem: Note | Folder | undefined;
	export function setContextItem(item: Note | Folder | undefined): void {
		contextItem = item;
	}

	export function editNote(): void {
		const note = contextItem as Note;
		goto(`/notes/edit/${note.folderId}/${note.id}`);
	}

	export function viewNote(): void {
		const note = contextItem as Note;
		goto(`/notes/view/${note.folderId}/${note.id}`);
	}

	let showDeleteNote: (note: Note) => void;
	export function deleteNote(): void {
		const note = contextItem as Note;
		showDeleteNote(note);
	}

	export function exportNoteAs(type: NoteExportExtension): void {
		const note = contextItem as Note;

		exportDialogFunction = async () => {
			const file = await createExportedNote(note, type);

			await window.webxdc
				.sendToChat({
					file: {
						name: file.name,
						blob: file,
					},
					text: `Exported note "${note.title}"`,
				})
				.catch(console.error);
		};
		showExportConfirmationDialog();
	}

	let showRenameFolder: (folder: Folder) => void;
	export function renameFolder(): void {
		const folder = contextItem as Folder;
		showRenameFolder(folder);
	}

	let showDeleteFolder: (folder: Folder) => void;
	export function deleteFolder(): void {
		const folder = contextItem as Folder;
		showDeleteFolder(folder);
	}

	export function exportFolderWith(type: NoteExportExtension): void {
		const folder = contextItem as Folder;

		exportDialogFunction = async () => {
			const file = await createExportedFolder(folder, type);

			await window.webxdc
				.sendToChat({
					file: {
						name: file.name,
						blob: file,
					},
					text: `Exported folder "${folder.name}"`,
				})
				.catch(console.error);
		};
		showExportConfirmationDialog();
	}
</script>

<RenameFolderDialog bind:show={showRenameFolder} />
<DeleteFolderDialog bind:show={showDeleteFolder} />
<DeleteNoteDialog bind:show={showDeleteNote} />

<ConfirmationDialog bind:show={showExportConfirmationDialog} bind:confirm={exportDialogFunction}>
	<WarningIcon slot="icon" />
	<svelte:fragment slot="headline">Are you sure?</svelte:fragment>
	<svelte:fragment slot="content">
		Exported files may be potentially unsafe, because they are no longer sandboxed under WebXDC.
		Content like images or links may leak your IP or other data.
	</svelte:fragment>
</ConfirmationDialog>

<ContextMenu width={contextItem && "content" in contextItem ? "100px" : "110px"}>
	{#if contextItem}
		{#if "content" in contextItem}
			<!-- It's a note -->
			<MenuItem on:click={viewNote}>
				<ViewReadonlyIcon slot="icon" />
				View
			</MenuItem>

			<MenuItem on:click={editNote}>
				<EditNoteIcon slot="icon" />
				Edit
			</MenuItem>

			<MenuItem on:click={deleteNote}>
				<DeleteIcon slot="icon" />
				Delete
			</MenuItem>

			<ExpandableMenuItem width="120px">
				<DownloadIcon slot="icon" />
				Export

				<svelte:fragment slot="items">
					<MenuItem on:click={() => exportNoteAs("md")}>
						<MarkdownIcon slot="icon" />
						Markdown
					</MenuItem>
					<MenuItem on:click={() => exportNoteAs("html")}>
						<WebIcon slot="icon" />
						HTML
					</MenuItem>
					<MenuItem on:click={() => exportNoteAs("pdf")}>
						<PdfIcon slot="icon" />
						PDF
					</MenuItem>
				</svelte:fragment>
			</ExpandableMenuItem>
		{:else}
			<!-- It's a folder -->
			<MenuItem on:click={renameFolder}>
				<EditIcon slot="icon" />
				Rename
			</MenuItem>

			<MenuItem on:click={deleteFolder}>
				<DeleteIcon slot="icon" />
				Delete
			</MenuItem>

			<ExpandableMenuItem width="145px">
				<DownloadIcon slot="icon" />
				Export

				<svelte:fragment slot="items">
					<MenuItem on:click={() => exportFolderWith("md")}>
						<MarkdownIcon slot="icon" />
						Markdown
					</MenuItem>
					<MenuItem on:click={() => exportFolderWith("html")}>
						<WebIcon slot="icon" />
						HTML
					</MenuItem>
					<MenuItem on:click={() => exportFolderWith("pdf")}>
						<PdfIcon slot="icon" />
						PDF
					</MenuItem>
					<MenuItem on:click={() => exportFolderWith("html-extra")}>
						<FilesIcon slot="icon" />
						HTML+History
					</MenuItem>
				</svelte:fragment>
			</ExpandableMenuItem>
		{/if}
	{:else}
		<span style:text-align="center" class="md-typescale-title-small">No options available</span>
	{/if}
</ContextMenu>
