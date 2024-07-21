<script lang="ts">
	import { getContext } from "svelte";
	import { derived } from "svelte/store";
	import { fly } from "svelte/transition";

	import { page } from "$app/stores";
	import { goto, pushState } from "$app/navigation";

	import "@material/web/button/text-button";
	import "@material/web/checkbox/checkbox";

	import BackIcon from "~icons/material-symbols/arrow-back-rounded";
	import ImportantNotificationIcon from "~icons/material-symbols/notification-important-rounded";

	import FolderCard from "$lib/components/cards/FolderCard.svelte";
	import NoteCard from "$lib/components/cards/NoteCard.svelte";
	import NoteFolderContextMenu from "$lib/components/NoteFolderContextMenu.svelte";
	import NavigationTopAppBar from "$lib/components/NavigationTopAppBar.svelte";
	import ThemeSwitcher from "$lib/components/ThemeSwitcher.svelte";
	import AddFab from "$lib/components/AddFab.svelte";
	import type { Folder, Note } from "$lib/shared";
	import ViewSwitcher from "$lib/components/ViewSwitcher.svelte";

	const notes = getContext("notes");
	const rootFolder = getContext("root");

	const view = getContext("view");
	$: listView = $view === "list";

	const folders = getContext("folders");
	const folderId = $page.params.folderId;
	let folder = $folders.get(folderId)!;
	$: folder = $folders.get(folderId)!;
	$: if (!folder) {
		console.warn(`Couldn't find folder with id ${folderId}`);
		goto("/folder/root");
	}

	function openFolder(folder: Folder): void {
		pushState(`/folder/${folder.id}`, { folderId: folder.id });
	}

	let ancestors: Folder[] = [];
	const currentFolder = derived([page, folders, notes], ([page, folders, notes]) => {
		const currentFolder = folders.get(page.state.folderId!) ?? folder;
		ancestors = [];
		let ancestor = folders.get(currentFolder?.parentId!);
		while (ancestor) {
			ancestors.unshift(ancestor);
			ancestor = folders.get(ancestor.parentId!);
		}
		return currentFolder;
	});

	function goFolderUp(): void {
		const parent = $folders.get($currentFolder.parentId!);
		if (parent) {
			openFolder(parent);
		}
	}

	let setContextItem: (item: Note | Folder | undefined) => void;
	let viewNote: () => void;
</script>

<NoteFolderContextMenu bind:setContextItem bind:viewNote />

{#if $currentFolder}
	<AddFab folder={$currentFolder} />

	<NavigationTopAppBar on:contextmenu={() => setContextItem($currentFolder)}>
		<svelte:fragment slot="leading-items">
			{#if $currentFolder !== $rootFolder}
				<md-icon-button on:click={goFolderUp}>
					<BackIcon />
				</md-icon-button>
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="headline">
			<span id="ancestors">
				{#each ancestors as ancestor}
					<button on:click={() => openFolder(ancestor)}>
						{ancestor.name}
					</button>
				{/each}
				<span class="current-folder">
					{$currentFolder.name}
				</span>
			</span>
		</svelte:fragment>

		<svelte:fragment slot="trailing-items">
			<md-icon-button href="/mentions">
				<ImportantNotificationIcon />
			</md-icon-button>

			<ViewSwitcher />
			<ThemeSwitcher />
		</svelte:fragment>
	</NavigationTopAppBar>

	{#key $currentFolder}
		<section
			in:fly={{ x: -100, duration: 250 }}
			on:contextmenu|self={() => setContextItem($currentFolder)}
			id="folder-viewer"
			class:list={listView}
		>
			{#if $currentFolder.folders}
				{#each $currentFolder.folders as folder}
					<FolderCard
						{folder}
						compact={listView}
						on:contextmenu={() => setContextItem(folder)}
						on:click={() => openFolder(folder)}
					/>
				{/each}
			{/if}

			{#if $currentFolder.notes}
				{#each $currentFolder.notes as note}
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
			{/if}
		</section>
	{/key}
{/if}

<style>
	#ancestors {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 16px;

		& > button {
			font: inherit;

			position: relative;

			cursor: pointer;

			border: none;
			background: none;
			padding: 0;
			color: var(--md-sys-color-primary);

			&:hover {
				text-decoration: underline;
			}

			&::after {
				position: absolute;
				top: 0;
				right: -10px;
				color: var(--md-sys-color-on-surface);

				content: "/";
			}
		}
	}

	#folder-viewer {
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
