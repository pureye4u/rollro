<script lang="ts">
	import { session } from '$lib/session';
	import { auth } from '$lib/firebase.client';
	import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
	import { goto } from '$app/navigation';
  import Button, { Label } from '@smui/button';

	async function loginWithGoogle() {
		const provider = new GoogleAuthProvider();
		await signInWithPopup(auth, provider)
			.then((result) => {
				const { displayName, email, photoURL, uid } = result?.user;
				session.set({
					loggedIn: true,
					user: {
						displayName,
						email,
						photoURL,
						uid
					}
				});

				goto('/');
			})
			.catch((error) => {
				return error;
			});
	}
</script>

<div class="login">
  <Button on:click={loginWithGoogle} class="login-button" variant="unelevated">
    <Label>Login with Google</Label>
  </Button>
</div>

<style>
	.login {
		height: 100vh;
	}
  :global(.login .login-button) {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 200px;
    height: 40px;
    margin-top: -20px;
    margin-left: -100px;
    border-radius: 20px;
  }
</style>