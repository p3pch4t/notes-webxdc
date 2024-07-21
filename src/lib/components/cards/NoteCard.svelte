<script lang="ts">
	import { onMount } from "svelte";

	import OutlinedCard from "./OutlinedCard.svelte";

	import type { Note } from "$lib/shared";
	import { parseMarkdown } from "$lib/utils";

	import NoteIcon from "~icons/material-symbols/sticky-note-2-rounded";

	export let note: Note;
	export let compact = false;

	let content: HTMLElement;
	let overflows = false;
	onMount(() => {
		overflows = content && content.scrollHeight > content.clientHeight;
	});
</script>

<OutlinedCard interactable class="note-card {compact ? 'compact' : ''}" on:click on:contextmenu>
	<h1 class="md-typescale-title-large">{note.title}</h1>
	{#if compact}
		<NoteIcon />
	{:else if note.content}
		<p bind:this={content} tabindex="-1" class="content markdown">
			{@html parseMarkdown(note.content)}
		</p>
		{#if overflows}
			<p tabindex="-1" class="overflow-message md-typescale-title-small">Open to see more</p>
		{/if}
	{:else}
		<i class="empty">This note is empty</i>
	{/if}
</OutlinedCard>

<style>
	:global(.note-card) {
		width: 100%;
		height: 210px;

		color: var(--md-sys-color-on-surface);

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
			transition: var(--md-default-transition);

			border-radius: 12px 12px 0 0;

			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}

		& > .content {
			flex: 1;
			overflow: hidden;
			padding-inline: 12px;
			padding-top: 8px;

			border-radius: 0 0 12px 12px;
			border: 1px solid var(--md-sys-color-outline-variant);
		}

		& > .overflow-message {
			position: absolute;
			bottom: 0;
			width: 100%;

			border-top: 1px solid var(--md-sys-color-outline-variant);
			border-radius: 0 0 12px 12px;

			background-color: var(--md-sys-color-primary);
			color: var(--md-sys-color-on-primary);

			text-align: center;
			padding: 3px;
		}

		& > .empty {
			padding-top: 8px;
			padding-inline: 12px;
		}

		&.compact {
			flex-direction: row-reverse;
			align-items: center;
			justify-content: center;

			height: 64px;

			border: 1px solid var(--md-sys-color-outline-variant) !important;
			border-radius: 12px;

			& > h1 {
				border: none;
				background: none;
				color: var(--md-sys-color-primary);
			}

			& > .icon {
				margin-left: 16px;
				width: 48px;
				height: 100%;
				color: var(--md-sys-color-primary);
			}
		}
	}
</style>
