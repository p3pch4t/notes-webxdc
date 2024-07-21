<script lang="ts">
	import { getContext } from "svelte";
	import { fly } from "svelte/transition";
	import { derived } from "svelte/store";

	import NavigationTopAppBar from "$lib/components/NavigationTopAppBar.svelte";
	import ThemeSwitcher from "$lib/components/ThemeSwitcher.svelte";

	import BackIcon from "~icons/material-symbols/arrow-back-rounded";
	import NoteCard from "$lib/components/cards/NoteCard.svelte";
	import type { Note, Folder } from "$lib/shared";
	import NoteFolderContextMenu from "$lib/components/NoteFolderContextMenu.svelte";
	import ViewSwitcher from "$lib/components/ViewSwitcher.svelte";

	const notes = getContext("notes");

	const view = getContext("view");
	$: listView = $view === "list";

	const mentionedInNotes = derived(notes, (notes) => {
		const mentionedIn: Note[] = [];
		for (const note of notes.values()) {
			if (note.mentions?.includes(window.webxdc.selfName)) {
				mentionedIn.push(note);
			}
		}
		return mentionedIn;
	});

	function goBack(): void {
		history.back();
	}

	let setContextItem: (item: Note | Folder | undefined) => void;
	let viewNote: () => void;
</script>

<NoteFolderContextMenu bind:setContextItem bind:viewNote />

<NavigationTopAppBar on:contextmenu={() => setContextItem(undefined)}>
	<svelte:fragment slot="leading-items">
		<md-icon-button on:click={goBack}>
			<BackIcon />
		</md-icon-button>
	</svelte:fragment>

	<svelte:fragment slot="headline">Mentions</svelte:fragment>

	<svelte:fragment slot="trailing-items">
		<ViewSwitcher />
		<ThemeSwitcher />
	</svelte:fragment>
</NavigationTopAppBar>

<section
	id="mentioned-in-notes"
	in:fly={{ x: -100, duration: 250 }}
	on:contextmenu|self={() => setContextItem(undefined)}
	class:list={listView}
>
	{#each $mentionedInNotes as note}
		<NoteCard
			{note}
			compact={listView}
			on:contextmenu={() => setContextItem(note)}
			on:click={() => {
				setContextItem(note);
				viewNote();
			}}
		/>
	{/each}
</section>

<style>
	#mentioned-in-notes {
		display: flex;
		flex-wrap: wrap;
		align-content: start;
		gap: 16px;

		padding: 16px;

		width: 100%;
		height: 100%;

		&:not(.list) > .outlined-card {
			@media screen and (min-width: 480px) {
				max-width: calc(50% - 8px);
			}

			@media screen and (min-width: 1080px) {
				max-width: calc(33% - 8px);
			}

			@media screen and (min-width: 1280px) {
				max-width: calc(25% - 12px);
			}
		}
	}
</style>
