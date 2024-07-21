<script lang="ts">
	import { getContext } from "svelte";

	import { type MdDialog } from "@material/web/dialog/dialog";
	import { type MdOutlinedTextField } from "@material/web/textfield/outlined-text-field";
	import "@material/web/button/text-button";
	import "@material/web/button/filled-tonal-button";
	import FolderAddIcon from "~icons/material-symbols/create-new-folder";

	import { generateRandomID } from "$lib/utils";
	import type { Folder } from "$lib/shared";

	export let folder: Folder;

	let dialog: MdDialog;
	let nameTextField: MdOutlinedTextField;
	export function show() {
		dialog.show();
	}
	function close() {
		nameTextField.value = "";
		dialog.close();
	}

	const functions = getContext("functions");
	function addFolder() {
		const name = nameTextField.value;

		if (!name) {
			nameTextField.error = true;
			nameTextField.errorText = "Name cannot be empty";
			return;
		} else if (folder.folders?.find((f) => f.name === name)) {
			nameTextField.error = true;
			nameTextField.errorText = "Folder with this name already exists in current folder";
			return;
		}
		nameTextField.error = false;

		functions.addFolder({
			id: generateRandomID(),
			parentId: folder.id,
			name,
		});
		close();
	}
</script>

<md-dialog bind:this={dialog} id="add-folder-dialog">
	<FolderAddIcon slot="icon" />
	<div slot="headline">
		<h1 class="md-typescale-headline-medium">Add new folder</h1>
	</div>
	<div slot="content">
		<md-outlined-text-field placeholder="Name" bind:this={nameTextField} />
	</div>
	<div slot="actions">
		<md-text-button title="Close dialog" on:click={close}> Cancel </md-text-button>
		<md-filled-tonal-button title="Add folder" on:click={addFolder}> Add </md-filled-tonal-button>
	</div>
</md-dialog>
