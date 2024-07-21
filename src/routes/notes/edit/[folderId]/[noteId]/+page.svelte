<script lang="ts">
	import { getContext } from "svelte";
	import { writable, derived } from "svelte/store";
	import { fly } from "svelte/transition";

	import { page } from "$app/stores";
	import { beforeNavigate, goto } from "$app/navigation";

	import { type MdOutlinedTextField } from "@material/web/textfield/outlined-text-field";
	import "@material/web/iconbutton/icon-button";
	import "@material/web/fab/fab";

	import BackIcon from "~icons/material-symbols/arrow-back-rounded";
	import PreviewIcon from "~icons/material-symbols/preview";
	import HistoryIcon from "~icons/material-symbols/history";

	import { generateRandomID, parseMarkdown } from "$lib/utils";
	import NavigationTopAppBar from "$lib/components/NavigationTopAppBar.svelte";
	import ThemeSwitcher from "$lib/components/ThemeSwitcher.svelte";
	import type { Note } from "$lib/shared";
	import { bindValue } from "$lib/actions/bindValue";

	let titleTextField: MdOutlinedTextField;
	let contentTextField: MdOutlinedTextField;

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

	const users = getContext("users");
	const functions = getContext("functions");

	function goBack(): void {
		history.back();
	}

	async function modifyNote(): Promise<void> {
		const title = titleTextField.value;
		const content = contentTextField.value;

		if (!title) {
			titleTextField.error = true;
			titleTextField.errorText = "Title cannot be empty";
			return;
		}
		titleTextField.error = false;

		if (note) {
			const changes: Partial<Note> = {};
			if (title !== note.title) changes.title = title;
			if (content !== note.content) {
				changes.content = content ?? "";

				let index = content.indexOf("@");
				while (index !== -1) {
					for (const { username } of $users) {
						if (content.slice(index + 1, index + 1 + username.length) === username) {
							changes.mentions ??= [];
							changes.mentions.push(username);
							break;
						}
					}

					index = content.indexOf("@", index + 1);
				}
			}

			if (changes.title || typeof changes.content !== "undefined") {
				functions.editNote(note.id, changes);
			}
		} else {
			functions.addNote({
				id: generateRandomID(),
				folderId: folder.id,
				title,
				content: content,
				history: [],
			});
		}
	}
	beforeNavigate(modifyNote);

	function keydown(event: KeyboardEvent): void {
		const target = event.target as HTMLTextAreaElement;
		if (!target) return;

		const { value, selectionStart, selectionEnd } = target;

		if (!event.ctrlKey) return;

		const start = value.slice(0, selectionStart);
		const middle = value.slice(selectionStart, selectionEnd);
		const end = value.slice(selectionEnd);

		let newMiddle: string;
		switch (event.key) {
			case "b":
				newMiddle = `**${middle}**`;
				break;
			case "i":
				newMiddle = `_${middle}_`;
				break;
			default:
				return;
		}
		event.preventDefault();

		// execCommand makes it so doing undo and redo works properly
		// It seems like overwriting `value` "destroys" modification history
		if ("execCommand" in document) {
			document.execCommand("insertText", false, newMiddle);
		} else {
			target.value = start + newMiddle + end;
		}
		target.setSelectionRange(selectionStart, selectionEnd + (newMiddle.length - middle.length));
	}

	let showPreview = false;
	function togglePreview(): void {
		showPreview = !showPreview;
	}

	let title = writable(note?.title ?? "");
	let content = writable(note?.content ?? "");
	const parsedTitle = derived(title, (title) => parseMarkdown(title));
	const parsedContent = derived(content, (content) => parseMarkdown(content));
</script>

<NavigationTopAppBar>
	<svelte:fragment slot="leading-items">
		<md-icon-button on:click={goBack}>
			<BackIcon />
		</md-icon-button>
	</svelte:fragment>

	<svelte:fragment slot="headline">{note ? "Edit note" : "Add note"}</svelte:fragment>

	<svelte:fragment slot="trailing-items">
		{#if note}
			<md-icon-button href="/notes/history/{folderId}/{noteId}">
				<HistoryIcon />
			</md-icon-button>
		{/if}
		<md-icon-button toggle on:click={togglePreview}>
			<PreviewIcon />
		</md-icon-button>
		<ThemeSwitcher />
	</svelte:fragment>
</NavigationTopAppBar>

<div id="add-note-container">
	<section in:fly={{ x: -100, duration: 250 }} id="add-note">
		<md-outlined-text-field
			bind:this={titleTextField}
			use:bindValue={title}
			id="title-field"
			placeholder="Title"
		/>

		<md-outlined-text-field
			bind:this={contentTextField}
			use:bindValue={content}
			id="note-field"
			type="textarea"
			placeholder="Note..."
			on:keydown={keydown}
		/>
	</section>
	{#if showPreview}
		<section id="add-note-preview" class="markdown">
			<h1>{@html $parsedTitle}</h1>
			{@html $parsedContent}
		</section>
	{/if}
</div>

<style>
	#add-note-container {
		display: flex;
		height: 100%;

		flex-direction: column;

		& > #add-note {
			display: flex;
			flex-direction: column;

			gap: 8px;

			width: 100%;
			height: 100%;
			padding: 16px;

			--md-outlined-text-field-outline-color: transparent;
			--md-outlined-text-field-hover-outline-color: transparent;
			--md-outlined-text-field-focus-outline-color: transparent;

			& > #title-field {
				--md-outlined-text-field-input-text-size: 1.5em;
			}

			& > #note-field {
				flex: 1;
				width: 100%;
				height: 100%;
				resize: none;
			}

			overflow: auto;
		}

		& > #add-note-preview {
			overflow: auto;

			border-top: 4px solid var(--md-sys-color-outline-variant);

			padding: 16px;

			display: flex;
			flex-direction: column;
			gap: 8px;

			width: 100%;
			height: 100%;
		}

		@media screen and (min-width: 720px) {
			flex-direction: row;

			& > #add-note-preview {
				border-left: 2px solid var(--md-sys-color-outline-variant);
				border-top: none;
			}
		}
	}
</style>
