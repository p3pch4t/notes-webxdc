<script lang="ts">
	import FolderIcon from "~icons/material-symbols/folder-rounded";
	import OutlinedCard from "./OutlinedCard.svelte";
	import type { Folder } from "$lib/shared";

	export let folder: Folder;
	export let compact = false;
</script>

<OutlinedCard interactable class="folder-card  {compact ? 'compact' : ''}" on:click on:contextmenu>
	<h1 class="md-typescale-title-large">{folder.name}</h1>
	<div class="content">
		<FolderIcon />
	</div>
</OutlinedCard>

<style>
	:global(.folder-card) {
		align-items: center;

		color: var(--md-sys-color-on-surface);

		width: 100%;
		height: 210px;

		user-select: none;
		border: none !important;
		& > * {
			pointer-events: none;
		}

		& > h1 {
			width: 100%;
			padding: 4px 12px;
			color: var(--md-sys-color-on-primary);
			background-color: var(--md-sys-color-primary);

			border-bottom: 1px solid var(--md-sys-color-outline-variant);
			border-radius: 12px 12px 0 0;
		}

		& > .content {
			display: flex;
			justify-content: center;
			align-items: center;

			width: 100%;
			height: 100%;
			border: 1px solid var(--md-sys-color-outline-variant);
			border-radius: 0 0 12px 12px;

			& > .icon {
				width: 128px;
				height: auto;
				color: var(--md-sys-color-primary);
			}
		}

		&.compact {
			flex-direction: row-reverse;

			height: 64px;

			border: 1px solid var(--md-sys-color-outline-variant) !important;
			border-radius: 12px;

			& > h1 {
				flex: 1;
				border: none;
				background: none;
				color: var(--md-sys-color-primary);
			}

			& > .content {
				width: max-content;
				margin-left: 16px;
				border: none;

				& > .icon {
					width: 48px;
				}
			}
		}
	}
</style>
