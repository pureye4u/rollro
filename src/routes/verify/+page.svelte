<div class="outside">
	<div class="label">Awaiting approval</div>
  <Button on:click={logout} class="button" variant="unelevated">
    <Label>Logout</Label>
  </Button>
</div>

<script lang="ts">
import { goto } from '$app/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '$lib/firebase.client';
import Button, { Label } from '@smui/button';

export function logout() {
	signOut(auth)
		.then(() => {
			goto('/login');
		})
		.catch((error) => {
			throw new Error(error);
		});
}
</script>
