<script lang="ts">
	import "@material/web/button/text-button";
	import MenuItem from "./MenuItem.svelte";

	export let width = "inherit";
</script>

<div class="expandable-menu-item">
	<MenuItem>
		<slot name="icon" />
		<slot />
	</MenuItem>

	<div style:width class="expandable-menu-items">
		<slot name="items" />
	</div>
</div>

<style>
	.expandable-menu-item {
		width: inherit;
		position: relative;

		& > .menu-item {
			width: inherit;
			--md-text-button-container-shape: 0;

			& > .menu-item-headline {
				display: flex;
				align-items: center;
				gap: 8px;

				position: absolute;
				left: 12px;
				top: 50%;
				transform: translateY(-50%);
				max-width: calc(100% - 24px);

				font-size: 0.9rem;

				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
		}

		& > .expandable-menu-items {
			transition: var(--md-default-transition);

			position: absolute;
			top: 0;
			left: 100%;
			width: inherit;

			opacity: 0;
			visibility: hidden;

			border-radius: 4px;
			padding-block: 8px;

			background-color: var(--expandable-menu-background);
		}

		&:hover > .expandable-menu-items {
			opacity: 1;
			visibility: visible;
		}
	}
</style>
