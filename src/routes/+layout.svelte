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

// Naver Maps 스크립트 동적 로드
function loadNaverMapsScript() {
	const clientId = import.meta.env.VITE_NCP_CLIENT_ID;
	
	// Client ID가 설정되지 않은 경우 에러 발생
	if (!clientId) {
		console.error('VITE_NCP_CLIENT_ID is not configured in environment variables');
		throw new Error('VITE_NCP_CLIENT_ID is required. Please set it in .env file.');
	}
	
	// 이미 로드되었는지 확인
	if (document.getElementById('naver-maps-script')) {
		return;
	}

	const script = document.createElement('script');
	script.id = 'naver-maps-script';
	script.type = 'text/javascript';
	script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
	document.head.appendChild(script);
}

onMount(async () => {
	// Naver Maps 스크립트 로드
	loadNaverMapsScript();

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
