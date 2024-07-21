<script lang="ts">
	import { getContext } from "svelte";

	import { type MdDialog } from "@material/web/dialog/dialog";
	import DeleteIcon from "~icons/material-symbols/delete-rounded";

	import type { Folder } from "$lib/shared";

	let folder: Folder | undefined;
	$: notEmpty = folder?.folders?.length || folder?.notes?.length;

	let dialog: MdDialog;
	export function show(newFolder: Folder) {
		folder = newFolder;
		dialog.show();
	}
	function close() {
		dialog.close();
	}

	const functions = getContext("functions");
	function deleteFolder() {
		functions.deleteFolder(folder!.id);
		close();
	}
</script>

<md-dialog bind:this={dialog} id="folder-delete-dialog">
	<DeleteIcon slot="icon" />
	<div class="headline" slot="headline">
		<h1 class="headline-title md-typescale-headline-medium">
			{#if notEmpty}
				Permanently delete <b class="folder-name">{folder?.name}</b> with its contents?
			{:else}
				Permanently delete {folder?.name}?
			{/if}
		</h1>
	</div>
	<div slot="content">
		Deleting folder cannot be undone. <br />
		{#if notEmpty}
			This folder is not empty, deleting it will also delete everything that is inside it.
		{/if}
	</div>
	<div slot="actions">
		<md-text-button title="Close dialog" on:click={close}> Cancel </md-text-button>
		{#if notEmpty}
			<md-filled-tonal-button title="Delete folder with its contents" on:click={deleteFolder}>
				Delete folder with its contents
			</md-filled-tonal-button>
		{:else}
			<md-filled-tonal-button title="Delete folder" on:click={deleteFolder}>
				Delete
			</md-filled-tonal-button>
		{/if}
	</div>
</md-dialog>

<style>
	.headline-title {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		& > .folder-name {
			font-weight: 600;
		}
	}
</style>
