/** @type {import('./$types').LayoutLoad} */
export const prerender = true;

import { onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase, auth } from '$lib/firebase.client';
import { browser } from '$app/environment';
import { getIsVerified } from '../services/userService';

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
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const isVerified = await getIsVerified(user.uid);
          resolve({ ...user, isVerified })
        } else {
          resolve(false);
        }
      });
    });
  }

  return {
    getAuthUser,
    url: url.pathname,
  };
}
