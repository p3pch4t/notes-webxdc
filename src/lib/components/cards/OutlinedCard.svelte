<script lang="ts">
	import "@material/web/focus/md-focus-ring";
	import "@material/web/ripple/ripple";

	let _class: string;
	export { _class as class };
	export let interactable = false;
</script>

<section
	role="button"
	tabindex="0"
	class:interactable
	class="outlined-card {_class}"
	on:click
	on:contextmenu
>
	<md-ripple />
	<md-focus-ring />

	<slot />
</section>

<style>
	.outlined-card {
		position: relative;

		display: flex;
		flex-direction: column;

		outline: none;
		border-radius: 12px;
		--md-focus-ring-shape: 12px;

		background-color: var(--md-sys-color-surface);
		border: 1px solid var(--md-sys-color-outline-variant);

		transition: var(--md-default-transition);

		&.interactable {
			&:hover {
				background-color: color-mix(
					in srgb,
					var(--md-sys-color-on-surface) 8%,
					var(--md-sys-color-surface)
				);
			}

			&:active {
				background-color: color-mix(
					in srgb,
					var(--md-sys-color-on-surface) 12%,
					var(--md-sys-color-surface)
				);
			}
		}
	}
</style>
