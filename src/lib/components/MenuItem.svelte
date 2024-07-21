<script lang="ts">
	import "@material/web/button/text-button";

	export let width = "inherit";
</script>

<md-text-button style:width class="menu-item" on:click>
	<span class="menu-item-headline md-typescale-body-large">
		<slot name="icon" />
		<slot />
	</span>
</md-text-button>

<style>
	.menu-item {
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

			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;

			font-size: 0.9rem;

			& > .icon {
				min-width: 20px;
			}
		}
	}
</style>
