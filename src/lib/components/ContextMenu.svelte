<script lang="ts">
	import { fade } from "svelte/transition";

	export let width = "100px";

	let opened = false;
	let x = 0;
	let y = 0;

	function preventClose(event: Event): void {
		event.preventDefault();
		event.stopPropagation();
	}

	function toggle(event: MouseEvent): void {
		event.preventDefault();
		opened = !opened;

		x = event.pageX;
		y = event.pageY;
	}
</script>

<svelte:window on:contextmenu={toggle} on:click={() => (opened = false)} />

{#if opened}
	<section
		on:click={preventClose}
		transition:fade={{ duration: 250 }}
		id="context-menu"
		style:--x="{x}px"
		style:--y="{y}px"
		style:width
	>
		<slot />
	</section>
{/if}

<style>
	#context-menu {
		position: absolute;
		top: var(--y);
		left: var(--x);

		display: flex;
		flex-direction: column;
		align-items: start;

		background-color: var(--md-sys-color-surface-container);
		--expandable-menu-background: var(--md-sys-color-surface-container);

		border-radius: 4px;
		padding-block: 8px;

		z-index: 9999999;
	}
</style>
