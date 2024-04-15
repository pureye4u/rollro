/** @type {import('./$types').LayoutLoad} */
export const prerender = true;

import { initializeFirebase, auth } from '$lib/firebase.client';
import { browser } from '$app/environment';
import { onAuthStateChanged } from 'firebase/auth';

export async function load({ url }: { url: URL }) {
  if (browser) {
    try {
      initializeFirebase();
    } catch (error) {
      console.error(error);
    }
  }

  function getAuthUser() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => resolve(user ? user : false));
    });
  }

  return {
    getAuthUser,
    url: url.pathname,
  };
}
