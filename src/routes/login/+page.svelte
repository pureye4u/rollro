<script lang="ts">
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { session } from '$lib/session';
import { auth } from '$lib/firebase.client';
import { goto } from '$app/navigation';
import Button, { Label } from '@smui/button';
    import { getIsVerified } from '../../services/userService';

async function loginWithGoogle() {
	const provider = new GoogleAuthProvider();
	await signInWithPopup(auth, provider)
		.then(async (result) => {
			const { displayName, email, photoURL, uid } = result?.user;
			const isVerified = !!uid ? await getIsVerified(uid) : false;
			session.set({
				isLoggedIn: true,
				user: {
					displayName,
					email,
					photoURL,
					uid,
					isVerified,
				}
			});

			if (isVerified) {
				goto('/');
			} else {
        goto('/verify');
			}
		})
		.catch((error) => {
			return error;
		});
}
</script>

<div class="outside">
  <Button on:click={loginWithGoogle} class="button" variant="unelevated">
    <Label>Login with Google</Label>
  </Button>
</div>
