<script lang="ts">
import { onMount } from 'svelte';
import { session } from '$lib/session';
import { goto } from '$app/navigation';

import type { LayoutData } from './$types';
export let data: LayoutData;

let isLoading: boolean = true;
let isLoggedIn: boolean = false;
let isVerified: boolean = false;

session.subscribe((cur: any) => {
	isLoading = cur?.isLoading;
	isLoggedIn = cur?.isLoggedIn;
	isVerified = cur?.user?.isVerified;
});

onMount(async () => {
	const user: any = await data.getAuthUser();
	const isLoggedIn = !!user && user?.emailVerified;
	const isVerified = !!user && user?.isVerified;
	session.update((cur: any) => {
		if (!isLoggedIn) {
			goto('/login');
			return;
		}

		if (!isVerified) {
			goto('/verify');
			return;
		}

		isLoading = false;
		return {
			...cur,
			user,
			isLoggedIn,
			isVerified,
			isLoading: false,
		};
	});
});
</script>

{#if isLoading}
	<div id="splash">Loading...</div>
{:else}
  <slot />
{/if}
