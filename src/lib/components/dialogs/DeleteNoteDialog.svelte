<script lang="ts">
	import { getContext } from "svelte";

	import { type MdDialog } from "@material/web/dialog/dialog";
	import DeleteIcon from "~icons/material-symbols/delete-rounded";

	import type { Note } from "$lib/shared";

	let note: Note | undefined;

	let dialog: MdDialog;
	export function show(newNote: Note) {
		note = newNote;
		dialog.show();
	}
	function close() {
		dialog.close();
	}

	const functions = getContext("functions");
	function deleteNote() {
		functions.deleteNote(note!.id);
		close();
	}
</script>

<md-dialog bind:this={dialog} id="note-delete-dialog">
	<DeleteIcon slot="icon" />
	<div slot="headline">
		<h1 class="headline-title md-typescale-headline-medium">
			Permanently delete <b class="note-title">{note?.title}</b>?
		</h1>
	</div>
	<div slot="content">
		<p>Deleting note cannot be undone.</p>
	</div>
	<div slot="actions">
		<md-text-button title="Close dialog" on:click={close}> Cancel </md-text-button>
		<md-filled-tonal-button title="Delete note" on:click={deleteNote}>
			Delete
		</md-filled-tonal-button>
	</div>
</md-dialog>

<style>
	.headline-title {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		& > .note-title {
			font-weight: 600;
		}
	}
</style>
