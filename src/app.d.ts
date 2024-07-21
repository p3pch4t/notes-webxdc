declare global {
	// import "unplugin-icons/types/svelte";
	declare module "~icons/*" {
		import { SvelteComponent } from "svelte";
		import type { SvelteHTMLElements } from "svelte/elements";

		export default class extends SvelteComponent<SvelteHTMLElements["svg"]> {}
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			folderId?: string;
		}
		// interface Platform {}
	}
}

export {};
