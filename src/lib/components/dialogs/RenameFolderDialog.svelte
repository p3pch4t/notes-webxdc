<script lang="ts">
	import { getContext } from "svelte";

	import { type MdDialog } from "@material/web/dialog/dialog";
	import { type MdOutlinedTextField } from "@material/web/textfield/outlined-text-field";
	import "@material/web/button/text-button";
	import "@material/web/button/filled-tonal-button";
	import EditIcon from "~icons/material-symbols/edit-rounded";

	import type { Folder } from "$lib/shared";

	let folder: Folder | undefined;

	let dialog: MdDialog;
	let nameTextField: MdOutlinedTextField;
	export function show(newFolder: Folder) {
		folder = newFolder;
		nameTextField.value = folder.name;
		dialog.show();
	}
	function close() {
		dialog.close();
	}

	const functions = getContext("functions");
	function renameFolder() {
		const name = nameTextField.value;
		if (!name) {
			nameTextField.error = true;
			nameTextField.errorText = "Name cannot be empty";
			return;
		}
		nameTextField.error = false;

		functions.editFolder(folder!.id, { name });
		close();
	}
</script>

<md-dialog bind:this={dialog} id="rename-folder-dialog">
	<EditIcon slot="icon" />
	<div slot="headline">
		<h1 class="md-typescale-headline-medium">Rename folder</h1>
	</div>
	<div slot="content">
		<md-outlined-text-field placeholder="Name" bind:this={nameTextField} />
	</div>
	<div slot="actions">
		<md-text-button title="Close dialog" on:click={close}> Cancel </md-text-button>
		<md-filled-tonal-button title="Rename folder" on:click={renameFolder}>
			Rename
		</md-filled-tonal-button>
	</div>
</md-dialog>
