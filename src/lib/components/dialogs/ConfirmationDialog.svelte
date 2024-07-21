<script lang="ts">
	import { type MdDialog } from "@material/web/dialog/dialog";
	import "@material/web/button/text-button";
	import "@material/web/button/filled-tonal-button";

	export let confirm: () => void;

	let dialog: MdDialog;

	export function show() {
		dialog.show();
	}

	function close() {
		dialog.close();
	}
</script>

<md-dialog bind:this={dialog} id="add-folder-dialog">
	<slot name="icon" slot="icon" />
	<div slot="headline">
		<h1 class="md-typescale-headline-medium">
			<slot name="headline" />
		</h1>
	</div>
	<div slot="content">
		<p>
			<slot name="content" />
		</p>
	</div>
	<div slot="actions">
		<slot name="actions">
			<md-text-button title="Cancel" on:click={close}> Cancel </md-text-button>
			<md-filled-tonal-button
				title="Confirm"
				on:click={async () => {
					await confirm();
					close();
				}}
			>
				Confirm
			</md-filled-tonal-button>
		</slot>
	</div>
</md-dialog>
