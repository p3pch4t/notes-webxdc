<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { fly } from "svelte/transition";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";

	import "@material/web/slider/slider";

	import { parseMarkdown } from "$lib/utils";
	import NavigationTopAppBar from "$lib/components/NavigationTopAppBar.svelte";
	import ThemeSwitcher from "$lib/components/ThemeSwitcher.svelte";

	import BackIcon from "~icons/material-symbols/arrow-back-rounded";
	import EditIcon from "~icons/material-symbols/edit-rounded";
	import type { HistoricalNote } from "$lib/shared";
	import { derived, writable } from "svelte/store";
	import { bindValue } from "$lib/actions/bindValue";

	const folders = getContext("folders");
	const folderId = $page.params.folderId;
	const folder = $folders.get(folderId)!;
	if (!folder) {
		console.warn(`Couldn't find folder with id ${folderId}`);
		goto("/folder/root");
	}

	const notes = getContext("notes");
	const noteId = $page.params.noteId;
	const note = $notes.get(noteId);
	if (!note) {
		console.warn(`Couldn't find note with id ${noteId}`);
		goto("/folder/root");
	}

	const functions = getContext("functions");

	function goBack(): void {
		history.back();
	}

	function editNote(): void {
		goto(`/notes/edit/${folderId}/${noteId}`);
	}

	function handleCheckboxChange(event: Event): void {
		const { target } = event;
		if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;

		console.log(target.dataset?.checkboxId);
		const checkboxId = target.dataset?.checkboxId ? +target.dataset.checkboxId : undefined;
		if (typeof checkboxId === "undefined") return;

		const matches = note!.content.matchAll(/- \[[ x]\]/gi);

		let i = 0;
		for (const match of matches) {
			if (i++ === checkboxId) {
				const [string] = match;
				const checkbox = target.checked ? "- [x]" : "- [ ]";

				const { content } = note!;
				functions.editNote(note!.id, {
					content: content.slice(0, match.index) + checkbox + content.slice(match.index + string.length),
				});
				break;
			}
		}
	}

	let maxIndex = (note?.history?.length ?? 1) - 1;
	const noteIndex = writable(maxIndex);
	const currentNote = derived(noteIndex, (noteIndex) => {
		return note?.history?.[noteIndex];
	});

	const dateFormatter = new Intl.DateTimeFormat(navigator.language, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
	});
	const formattedDate = derived(currentNote, (currentNote) => {
		console.log(currentNote);
		return dateFormatter.format(currentNote?.time ?? 0);
	});
</script>

<NavigationTopAppBar>
	<svelte:fragment slot="leading-items">
		<md-icon-button on:click={goBack}>
			<BackIcon />
		</md-icon-button>
	</svelte:fragment>

	<svelte:fragment slot="headline">View note history</svelte:fragment>

	<svelte:fragment slot="trailing-items">
		<md-icon-button on:click={editNote}>
			<EditIcon />
		</md-icon-button>
		<ThemeSwitcher />
	</svelte:fragment>
</NavigationTopAppBar>

<section in:fly={{ x: -100, duration: 250 }} id="view-note-history">
	<section id="history-timeline">
		<h3 class="md-typescale-title-medium">Time: {$formattedDate}</h3>
		<md-slider use:bindValue={noteIndex} min={0} max={maxIndex} ticks />
	</section>

	<h1 id="note-title">{$currentNote?.title}</h1>
	{#if $currentNote?.content}
		<p id="note-content" class="markdown" on:change={handleCheckboxChange}>
			{@html parseMarkdown($currentNote.content)}
		</p>
	{/if}
</section>

<style>
	#view-note-history {
		display: flex;
		flex-direction: column;

		gap: 8px;

		width: 100%;
		height: 100%;
		padding: 16px;

		& > #history-timeline {
			display: flex;
			flex-direction: column;
			width: 100%;
			align-items: center;

			& > h3 {
				padding: 0;
				margin: 0;
			}

			& > md-slider {
				width: 100%;
			}

			padding-bottom: 16px;
			border-bottom: 1px solid var(--md-sys-color-outline-variant);
		}

		& > #note-title {
			font-size: 1.5em;
		}

		& > #note-content {
			flex: 1;
			width: 100%;
			height: 100%;
			resize: none;
		}
	}
</style>
