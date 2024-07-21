<script lang="ts">
	import { getContext } from "svelte";
	import ViewListIcon from "~icons/material-symbols/view-list-outline-rounded";

	const view = getContext("view");

	function toggleView(): void {
		$view = $view === "card" ? "list" : "card";
	}
</script>

<md-icon-button on:click={toggleView} toggle selected={$view === "list"}>
	<ViewListIcon />
</md-icon-button>
